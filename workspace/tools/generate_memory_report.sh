#!/bin/bash

# Memory Status Report Generator
# This script analyzes Jarvis's memory systems and outputs a JSON report

# Base directory for Jarvis's knowledge
JARVIS_DIR="./Jarvis"
KNOWLEDGE_DIR="$JARVIS_DIR/knowledge"

# Get current timestamp
TIMESTAMP=$(date +%s)
FORMATTED_TIME=$(date "+%Y-%m-%d %H:%M:%S")

# Function to count files by type and directory
count_files() {
  find "$1" -type f -name "$2" | wc -l | tr -d ' '
}

# Function to get the most recent file modification time
get_last_modified() {
  find "$1" -type f -name "$2" -exec stat -f "%m %N" {} \; 2>/dev/null | sort -nr | head -1 | cut -d' ' -f1
}

# Function to convert timestamp to human-readable date
format_timestamp() {
  date -r "$1" "+%Y-%m-%d %H:%M:%S"
}

# Function to determine freshness status
get_freshness() {
  local last_modified=$1
  local current_time=$TIMESTAMP
  local age=$((current_time - last_modified))
  
  # Thresholds: 1 day for fresh, 7 days for normal, beyond is stale
  if [ $age -lt 86400 ]; then
    echo "fresh"
  elif [ $age -lt 604800 ]; then
    echo "normal"
  else
    echo "stale"
  fi
}

# Function to determine completeness percentage
get_completeness() {
  local count=$1
  local target=$2
  local percentage=$((count * 100 / target))
  
  # Cap at 100%
  if [ $percentage -gt 100 ]; then
    echo 100
  else
    echo $percentage
  fi
}

# Function to determine completeness status
get_completeness_status() {
  local count=$1
  local threshold=$2
  
  if [ $count -ge $threshold ]; then
    echo "complete"
  elif [ $count -gt 0 ]; then
    echo "partial"
  else
    echo "empty"
  fi
}

# Collect semantic memory data
SEMANTIC_DIR="$KNOWLEDGE_DIR/semantic_memory"
SEMANTIC_FILES=$(count_files "$SEMANTIC_DIR" "*.md")
SEMANTIC_LAST=$(get_last_modified "$SEMANTIC_DIR" "*.md")
SEMANTIC_LAST_HUMAN=$(format_timestamp "$SEMANTIC_LAST")
SEMANTIC_FRESHNESS=$(get_freshness "$SEMANTIC_LAST")
SEMANTIC_COMPLETENESS=$(get_completeness_status "$SEMANTIC_FILES" 3)
SEMANTIC_PERCENTAGE=$(get_completeness "$SEMANTIC_FILES" 5)

# Collect episodic memory data
EPISODIC_DIR="$KNOWLEDGE_DIR/episodic_memory"
EPISODIC_CONVERSATIONS=$(count_files "$EPISODIC_DIR/conversations" "*.md")
EPISODIC_SESSIONS=$(count_files "$EPISODIC_DIR/sessions" "*.md")
EPISODIC_LAST=$(get_last_modified "$EPISODIC_DIR" "*.md")
EPISODIC_LAST_HUMAN=$(format_timestamp "$EPISODIC_LAST")
EPISODIC_FRESHNESS=$(get_freshness "$EPISODIC_LAST")
EPISODIC_CONV_STATUS=$([ "$EPISODIC_CONVERSATIONS" -gt 0 ] && echo "active" || echo "inactive")
EPISODIC_SESS_STATUS=$([ "$EPISODIC_SESSIONS" -gt 0 ] && echo "active" || echo "inactive")

# Collect procedural memory data
PROCEDURAL_DIR="$KNOWLEDGE_DIR/procedural_memory"
PROCEDURAL_FILES=$(count_files "$PROCEDURAL_DIR" "*.md")
PROCEDURAL_LAST=$(get_last_modified "$PROCEDURAL_DIR" "*.md")
PROCEDURAL_LAST_HUMAN=$(format_timestamp "$PROCEDURAL_LAST")
PROCEDURAL_FRESHNESS=$(get_freshness "$PROCEDURAL_LAST")
PROCEDURAL_COMPLETENESS=$(get_completeness_status "$PROCEDURAL_FILES" 3)
PROCEDURAL_PERCENTAGE=$(get_completeness "$PROCEDURAL_FILES" 5)

# Collect structured memory data
STRUCTURED_DIR="$KNOWLEDGE_DIR/structured_memory"
STRUCTURED_FILES=$(count_files "$STRUCTURED_DIR" "*.json")
STRUCTURED_LAST=$(get_last_modified "$STRUCTURED_DIR" "*.json")
STRUCTURED_LAST_HUMAN=$(format_timestamp "$STRUCTURED_LAST")
STRUCTURED_FRESHNESS=$(get_freshness "$STRUCTURED_LAST")
STRUCTURED_COMPLETENESS=$(get_completeness_status "$STRUCTURED_FILES" 2)
STRUCTURED_PERCENTAGE=$(get_completeness "$STRUCTURED_FILES" 2)

# Determine overall health
determine_health() {
  # Count critical issues
  local critical=0
  local warning=0
  
  # Check freshness
  for freshness in "$SEMANTIC_FRESHNESS" "$EPISODIC_FRESHNESS" "$PROCEDURAL_FRESHNESS" "$STRUCTURED_FRESHNESS"; do
    if [ "$freshness" == "stale" ]; then
      critical=$((critical + 1))
    elif [ "$freshness" == "normal" ]; then
      warning=$((warning + 1))
    fi
  done
  
  # Check completeness
  for completeness in "$SEMANTIC_COMPLETENESS" "$PROCEDURAL_COMPLETENESS" "$STRUCTURED_COMPLETENESS"; do
    if [ "$completeness" == "empty" ]; then
      critical=$((critical + 1))
    elif [ "$completeness" == "partial" ]; then
      warning=$((warning + 1))
    fi
  done
  
  # Check episodic status
  if [ "$EPISODIC_CONV_STATUS" == "inactive" ] && [ "$EPISODIC_SESS_STATUS" == "inactive" ]; then
    warning=$((warning + 1))
  fi
  
  # Determine overall status
  if [ $critical -gt 0 ]; then
    echo "critical"
  elif [ $warning -gt 0 ]; then
    echo "warning"
  else
    echo "healthy"
  fi
}

OVERALL_STATUS=$(determine_health)

# Generate health description
generate_health_description() {
  local status=$1
  
  if [ "$status" == "healthy" ]; then
    echo "All memory systems are functioning properly with recent updates."
  elif [ "$status" == "warning" ]; then
    echo "Some memory systems require attention due to age or completeness issues."
  else
    echo "Critical issues detected in memory systems that require immediate attention."
  fi
}

HEALTH_DESCRIPTION=$(generate_health_description "$OVERALL_STATUS")

# Generate recommendations
generate_recommendations() {
  # Start with an empty array
  local recommendations="["
  
  # Semantic memory recommendations
  if [ "$SEMANTIC_COMPLETENESS" != "complete" ]; then
    recommendations="$recommendations\"Continue adding semantic memory concepts to enhance knowledge capabilities\","
  fi
  
  # Episodic memory recommendations
  if [ "$EPISODIC_CONVERSATIONS" -lt 3 ]; then
    recommendations="$recommendations\"Consider creating more episodic conversations to build richer interaction history\","
  fi
  
  # Procedural memory recommendations
  if [ "$PROCEDURAL_COMPLETENESS" != "complete" ]; then
    recommendations="$recommendations\"Add more procedural workflows to enhance operational capabilities\","
  fi
  
  # Freshness recommendations
  for freshness in "$SEMANTIC_FRESHNESS" "$EPISODIC_FRESHNESS" "$PROCEDURAL_FRESHNESS" "$STRUCTURED_FRESHNESS"; do
    if [ "$freshness" != "fresh" ]; then
      recommendations="$recommendations\"Update outdated memory systems to maintain cognitive relevance\","
      break
    fi
  done
  
  # Always include a maintenance recommendation
  recommendations="$recommendations\"Schedule regular memory maintenance to ensure continued health\""
  
  # Close the array
  recommendations="$recommendations]"
  
  echo "$recommendations"
}

RECOMMENDATIONS=$(generate_recommendations)

# Generate JSON report
cat << EOF
{
  "timestamp": $TIMESTAMP,
  "formatted_time": "$FORMATTED_TIME",
  "memory_systems": {
    "semantic": {
      "files": $SEMANTIC_FILES,
      "last_updated": "$SEMANTIC_LAST_HUMAN",
      "freshness": "$SEMANTIC_FRESHNESS",
      "completeness": "$SEMANTIC_COMPLETENESS",
      "percentage": $SEMANTIC_PERCENTAGE
    },
    "episodic": {
      "conversation_count": $EPISODIC_CONVERSATIONS,
      "session_count": $EPISODIC_SESSIONS,
      "last_updated": "$EPISODIC_LAST_HUMAN",
      "freshness": "$EPISODIC_FRESHNESS",
      "conversation_status": "$EPISODIC_CONV_STATUS",
      "session_status": "$EPISODIC_SESS_STATUS"
    },
    "procedural": {
      "files": $PROCEDURAL_FILES,
      "last_updated": "$PROCEDURAL_LAST_HUMAN",
      "freshness": "$PROCEDURAL_FRESHNESS",
      "completeness": "$PROCEDURAL_COMPLETENESS",
      "percentage": $PROCEDURAL_PERCENTAGE
    },
    "structured": {
      "files": $STRUCTURED_FILES,
      "last_updated": "$STRUCTURED_LAST_HUMAN",
      "freshness": "$STRUCTURED_FRESHNESS",
      "completeness": "$STRUCTURED_COMPLETENESS",
      "percentage": $STRUCTURED_PERCENTAGE
    }
  },
  "overall_health": {
    "status": "$OVERALL_STATUS",
    "description": "$HEALTH_DESCRIPTION"
  },
  "recommendations": $RECOMMENDATIONS
}
EOF 