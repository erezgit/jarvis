# Memory Status Report Procedure

## Purpose

This workflow defines the process for generating comprehensive status reports of Jarvis's memory systems. These reports provide insights into the health, freshness, and completeness of all memory types.

## Memory Status Report Generation

### Step 1: Collect Memory Metadata

```bash
# Get counts and last modified dates for each memory type
semantic_files=$(find ./Jarvis/knowledge/semantic_memory -type f -name "*.md" | wc -l)
semantic_last=$(find ./Jarvis/knowledge/semantic_memory -type f -name "*.md" -exec stat -f "%m %N" {} \; | sort -nr | head -1 | cut -d' ' -f1)
semantic_last_human=$(date -r $semantic_last "+%Y-%m-%d %H:%M:%S")

episodic_conversations=$(find ./Jarvis/knowledge/episodic_memory/conversations -type f -name "*.md" | wc -l)
episodic_sessions=$(find ./Jarvis/knowledge/episodic_memory/sessions -type f -name "*.md" | wc -l)
episodic_last=$(find ./Jarvis/knowledge/episodic_memory -type f -name "*.md" -exec stat -f "%m %N" {} \; | sort -nr | head -1 | cut -d' ' -f1)
episodic_last_human=$(date -r $episodic_last "+%Y-%m-%d %H:%M:%S")

procedural_files=$(find ./Jarvis/knowledge/procedural_memory -type f -name "*.md" | wc -l)
procedural_last=$(find ./Jarvis/knowledge/procedural_memory -type f -name "*.md" -exec stat -f "%m %N" {} \; | sort -nr | head -1 | cut -d' ' -f1)
procedural_last_human=$(date -r $procedural_last "+%Y-%m-%d %H:%M:%S")

structured_files=$(find ./Jarvis/knowledge/structured_memory -type f -name "*.json" | wc -l)
structured_last=$(find ./Jarvis/knowledge/structured_memory -type f -name "*.json" -exec stat -f "%m %N" {} \; | sort -nr | head -1 | cut -d' ' -f1)
structured_last_human=$(date -r $structured_last "+%Y-%m-%d %H:%M:%S")
```

### Step 2: Analyze Memory Freshness

```python
# Pseudocode for evaluating memory freshness
current_time = get_current_timestamp()
semantic_age = current_time - semantic_last
episodic_age = current_time - episodic_last
procedural_age = current_time - procedural_last
structured_age = current_time - structured_last

# Define freshness thresholds (in seconds)
fresh_threshold = 86400  # 1 day
stale_threshold = 604800  # 1 week

# Evaluate freshness status for each memory type
memory_status = {
    "semantic": "fresh" if semantic_age < fresh_threshold else "normal" if semantic_age < stale_threshold else "stale",
    "episodic": "fresh" if episodic_age < fresh_threshold else "normal" if episodic_age < stale_threshold else "stale",
    "procedural": "fresh" if procedural_age < fresh_threshold else "normal" if procedural_age < stale_threshold else "stale",
    "structured": "fresh" if structured_age < fresh_threshold else "normal" if structured_age < stale_threshold else "stale"
}
```

### Step 3: Analyze Memory Completeness

```python
# Pseudocode for evaluating memory completeness
memory_completeness = {
    "semantic": {
        "status": "complete" if semantic_files >= 3 else "partial" if semantic_files > 0 else "empty",
        "percentage": min(100, semantic_files * 20)  # Assuming 5 core concept files = 100%
    },
    "episodic": {
        "conversations": {
            "status": "active" if episodic_conversations > 0 else "inactive",
            "count": episodic_conversations
        },
        "sessions": {
            "status": "active" if episodic_sessions > 0 else "inactive",
            "count": episodic_sessions
        }
    },
    "procedural": {
        "status": "complete" if procedural_files >= 3 else "partial" if procedural_files > 0 else "empty",
        "percentage": min(100, procedural_files * 20)  # Assuming 5 core workflow files = 100%
    },
    "structured": {
        "status": "complete" if structured_files >= 2 else "partial" if structured_files > 0 else "empty",
        "percentage": min(100, structured_files * 50)  # Assuming 2 core project files = 100%
    }
}
```

### Step 4: Generate Status Report

```python
# Pseudocode for generating the memory status report
memory_report = {
    "timestamp": current_time,
    "formatted_time": format_timestamp(current_time),
    "memory_systems": {
        "semantic": {
            "files": semantic_files,
            "last_updated": semantic_last_human,
            "freshness": memory_status["semantic"],
            "completeness": memory_completeness["semantic"]["status"],
            "percentage": memory_completeness["semantic"]["percentage"]
        },
        "episodic": {
            "conversation_count": episodic_conversations,
            "session_count": episodic_sessions,
            "last_updated": episodic_last_human,
            "freshness": memory_status["episodic"],
            "conversation_status": memory_completeness["episodic"]["conversations"]["status"],
            "session_status": memory_completeness["episodic"]["sessions"]["status"]
        },
        "procedural": {
            "files": procedural_files,
            "last_updated": procedural_last_human,
            "freshness": memory_status["procedural"],
            "completeness": memory_completeness["procedural"]["status"],
            "percentage": memory_completeness["procedural"]["percentage"]
        },
        "structured": {
            "files": structured_files,
            "last_updated": structured_last_human,
            "freshness": memory_status["structured"],
            "completeness": memory_completeness["structured"]["status"],
            "percentage": memory_completeness["structured"]["percentage"]
        }
    },
    "overall_health": calculate_overall_health(memory_status, memory_completeness),
    "recommendations": generate_recommendations(memory_status, memory_completeness)
}
```

### Step 5: Format Report for Display

```markdown
# Memory Status Report
Generated: {{formatted_time}}

## Overall Health: {{overall_health.status}}
{{overall_health.description}}

## Memory Systems Status

### Semantic Memory
- Files: {{semantic.files}}
- Last Updated: {{semantic.last_updated}}
- Freshness: {{semantic.freshness}}
- Completeness: {{semantic.completeness}} ({{semantic.percentage}}%)

### Episodic Memory
- Conversations: {{episodic.conversation_count}}
- Sessions: {{episodic.session_count}}
- Last Updated: {{episodic.last_updated}}
- Freshness: {{episodic.freshness}}
- Status: {{episodic.conversation_status}}/{{episodic.session_status}}

### Procedural Memory
- Files: {{procedural.files}}
- Last Updated: {{procedural.last_updated}}
- Freshness: {{procedural.freshness}}
- Completeness: {{procedural.completeness}} ({{procedural.percentage}}%)

### Structured Memory
- Files: {{structured.files}}
- Last Updated: {{structured.last_updated}}
- Freshness: {{structured.freshness}}
- Completeness: {{structured.completeness}} ({{structured.percentage}}%)

## Recommendations
{{#each recommendations}}
- {{this}}
{{/each}}
```

### Step 6: Save and Display Report

```javascript
// Web app code for displaying the memory status report
function displayMemoryReport(report) {
  const reportContainer = document.getElementById('memory-report');
  
  // Create status indicators with appropriate colors
  const healthIndicator = document.createElement('div');
  healthIndicator.className = `status-indicator ${report.overall_health.status}`;
  healthIndicator.textContent = report.overall_health.status.toUpperCase();
  
  // Populate the report sections
  const sections = ['semantic', 'episodic', 'procedural', 'structured'];
  const reportSections = sections.map(section => {
    return createMemorySectionCard(section, report.memory_systems[section]);
  });
  
  // Add recommendations
  const recommendationsSection = document.createElement('div');
  recommendationsSection.className = 'recommendations-section';
  report.recommendations.forEach(rec => {
    const recItem = document.createElement('div');
    recItem.className = 'recommendation-item';
    recItem.textContent = rec;
    recommendationsSection.appendChild(recItem);
  });
  
  // Assemble the complete report
  reportContainer.appendChild(healthIndicator);
  reportSections.forEach(section => reportContainer.appendChild(section));
  reportContainer.appendChild(recommendationsSection);
}
```

## Scheduled Report Generation

The memory status report should be generated:

1. On demand through the "Generate Memory Report" button in the web app
2. Automatically at the beginning of each new session
3. Automatically once per day if the system is in continuous use
4. After significant memory operations (bulk additions or modifications)

## Integration with Jarvis Web App

### Create Memory Status API Endpoint

```javascript
// API route for memory status report
export async function GET(request: NextRequest) {
  try {
    // Execute the shell commands to collect memory data
    const execSync = require('child_process').execSync;
    const reportData = execSync('./scripts/generate_memory_report.sh').toString();
    
    // Parse the report data into JSON
    const report = JSON.parse(reportData);
    
    // Return the report
    return NextResponse.json({ report });
    
  } catch (error) {
    console.error('Error generating memory report:', error);
    return NextResponse.json({ error: 'Error generating memory report' }, { status: 500 });
  }
}
```

### Create Memory Status Page

```jsx
// React component for memory status page
export default function MemoryStatusPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchReport() {
      try {
        const response = await fetch('/api/memory/status');
        const data = await response.json();
        setReport(data.report);
      } catch (error) {
        console.error('Error fetching memory status:', error);
      } finally {
        setLoading(false);
      }
    }
    
    fetchReport();
  }, []);
  
  return (
    <AppLayout>
      <div className="memory-status-container">
        <h1>Memory System Status</h1>
        
        {loading ? (
          <div className="loading-spinner">Loading memory status...</div>
        ) : report ? (
          <div id="memory-report">
            {/* Report will be populated by displayMemoryReport function */}
            {displayMemoryReport(report)}
          </div>
        ) : (
          <div className="error-message">Unable to load memory status</div>
        )}
        
        <button 
          className="refresh-button"
          onClick={() => {
            setLoading(true);
            fetchReport();
          }}
        >
          Refresh Status
        </button>
      </div>
    </AppLayout>
  );
}
```

## Example Report Output

```json
{
  "timestamp": 1714055287,
  "formatted_time": "2025-04-25 12:01:27",
  "memory_systems": {
    "semantic": {
      "files": 3,
      "last_updated": "2025-04-25 11:05:22",
      "freshness": "fresh",
      "completeness": "complete",
      "percentage": 60
    },
    "episodic": {
      "conversation_count": 1,
      "session_count": 1,
      "last_updated": "2025-04-25 11:30:15",
      "freshness": "fresh",
      "conversation_status": "active",
      "session_status": "active"
    },
    "procedural": {
      "files": 4,
      "last_updated": "2025-04-25 11:15:46",
      "freshness": "fresh",
      "completeness": "complete",
      "percentage": 80
    },
    "structured": {
      "files": 3,
      "last_updated": "2025-04-25 10:02:58",
      "freshness": "fresh",
      "completeness": "complete",
      "percentage": 100
    }
  },
  "overall_health": {
    "status": "healthy",
    "description": "All memory systems are functioning properly with recent updates."
  },
  "recommendations": [
    "Continue adding semantic memory concepts to enhance knowledge capabilities",
    "Consider creating more episodic conversations to build richer interaction history",
    "Schedule regular memory maintenance to ensure continued health"
  ]
}
```

## Implementation Notes

- The report generation script should be created in `./Jarvis/workspace/tools/generate_memory_report.sh`
- The web app should display the report at `/knowledge/status` or a similar path
- Consider adding visual elements like graphs to show memory growth over time
- Include filtering capabilities to focus on specific memory types or issues 