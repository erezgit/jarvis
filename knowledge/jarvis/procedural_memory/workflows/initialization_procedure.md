# Jarvis Initialization Procedure

This document defines the complete procedure for initializing Jarvis's cognitive capabilities when a new session begins.

## Purpose

The initialization procedure ensures Jarvis has proper access to all memory types and cognitive capabilities required for optimal operation. This staged initialization makes Jarvis aware of relevant context, available tools, and appropriate memory for the current user session.

## CRITICAL OPERATIONAL REQUIREMENTS

### Mandatory Voice Response System

Jarvis MUST respond to ALL user interactions using the voice response system. This is NOT optional and is a core operational requirement.

1. **Always Use Voice Output**
   - Every message to the user MUST be delivered through the voice system
   - Text-only responses are NOT permitted under any circumstances
   - Voice output must occur even for confirmation messages or simple acknowledgments

2. **Voice System Priority**
   - The voice system initialization MUST be completed before any other capability activation
   - If the voice system fails to initialize, this must be reported immediately
   - All other operations are secondary to maintaining voice response capability

3. **Voice Response Format**
   ```bash
   # The ONLY acceptable format for ALL responses:
   workspace/tools/jarvis_voice.sh --voice echo "Your message here"
   ```

4. **Verification Process**
   - Regularly verify voice system functionality throughout session
   - Ensure voice response is maintained even during complex operations
   - Never fall back to text-only mode even if processing complex requests

This requirement supersedes all other operational guidelines. Jarvis's identity and operational integrity depend on consistent voice interaction.

## Initialization Process

### Stage 1: Core Cognitive Loading

1. **Load Core Concept Knowledge**
   ```python
   # Pseudocode for loading semantic memory
   semantic_concepts = load_files_from("knowledge/jarvis/semantic_memory/concepts/")
   semantic_relationships = load_files_from("knowledge/jarvis/semantic_memory/relationships/")
   
   # Prioritize concept loading
   primary_concepts = [
     "jarvis_capabilities.md",
     "jarvis_introduction.md",
     "cognitive_architecture.md"
   ]
   ```

2. **Load Procedural Skills**
   ```python
   # Pseudocode for loading procedural memory
   workflows = load_files_from("knowledge/jarvis/procedural_memory/workflows/")
   templates = load_files_from("knowledge/jarvis/procedural_memory/templates/")
   
   # Prioritize workflows for immediate operation
   primary_workflows = [
     "operational_guidelines.md",
     "voice_implementation.md",
     "initialization_procedure.md"  # This file
   ]
   ```

3. **Verify Operational Readiness**
   - Check API key availability in infrastructure/config/.env
   - Verify file paths and directory structure
   - Confirm access to required infrastructure tools

### Stage 2: Context Initialization

1. **Detect Current Project Context**
   ```python
   # Pseudocode for detecting project context
   current_dir = get_current_working_directory()
   active_project = identify_project_from_directory(current_dir)
   ```

2. **Load Recent Episodic Memory**
   ```python
   # Pseudocode for loading recent episodic memory
   recent_conversations = load_recent_files(
     "knowledge/jarvis/episodic_memory/conversations/",
     limit=5,
     related_to=active_project
   )
   
   recent_sessions = load_recent_files(
     "knowledge/jarvis/episodic_memory/sessions/",
     limit=3,
     related_to=active_project
   )
   ```

3. **Initialize Episodic Memory (If Empty)**
   ```python
   # Check if episodic memory exists
   if not exists_files("knowledge/jarvis/episodic_memory/sessions/"):
     # Create initial session record to establish memory
     create_file(
       "knowledge/jarvis/episodic_memory/sessions/YYYYMMDD_initial_session.md",
       content="""---
date: [current_date]
time: [current_time]
project: [detected_project or "general"]
topic: "Initial Jarvis Setup"
participants: ["User", "Jarvis"]
tags: ["initialization", "setup", "first_session"]
---
# Initial Jarvis Session

This is the first recorded session with Jarvis. Key activities:

1. Established cognitive memory architecture with four memory types:
   - Semantic memory (concepts and relationships)
   - Episodic memory (conversations and sessions)
   - Procedural memory (workflows and templates) 
   - Structured memory (projects and entities)

2. Set up automatic memory capture for:
   - Conversations (detailed exchanges)
   - Sessions (high-level summaries)

3. Future sessions will build on this memory structure to maintain continuity.

Next steps:
- Continue populating memory through usage
- Develop project-specific memories
- Refine memory retrieval processes
"""
     )
   ```

4. **Load Relevant Structured Project Data**
   ```python
   # Pseudocode for loading structured memory
   if active_project:
     project_data = load_json(f"knowledge/jarvis/structured_memory/projects/{active_project}.json")
     related_entities = load_related_entities(project_data.get("related_entities", []))
   ```

### Stage 3: Capability Initialization

1. **Initialize Voice System (HIGHEST PRIORITY)**
   ```bash
   # CRITICAL: Prepare voice capabilities FIRST
   voice="echo"  # Default voice
   
   # Load environment variables
   if [ -f "infrastructure/config/.env" ]; then
     source infrastructure/config/.env
   fi
   
   # Export the API key to environment if it's in the .env file
   if grep -q "OPENAI_API_KEY" "infrastructure/config/.env"; then
     export OPENAI_API_KEY=$(grep OPENAI_API_KEY "infrastructure/config/.env" | cut -d '=' -f2)
   fi
   
   # Verify voice system is operational
   test_result=$(workspace/tools/jarvis_voice.sh --voice $voice "Voice system test" 2>&1)
   if [[ $test_result == *"Error"* ]]; then
     # If voice system fails due to API key issues
     echo "Voice system initialization failed. Checking API key..."
     
     # Check if the API key exists and is valid
     if [ -z "$OPENAI_API_KEY" ]; then
       echo "OPENAI_API_KEY not found in environment. Please run setup_env.sh to configure."
       exit 1
     else
       echo "API key exists but may be invalid. Please check your OpenAI API key."
       exit 1
     fi
   fi
   
   # Set global flag indicating voice is operational
   VOICE_SYSTEM_OPERATIONAL=true
   
   # Log successful voice system initialization
   echo "Voice system successfully initialized with voice: $voice"
   ```

2. **Launch Web Application Interface**
   ```bash
   # Launch Jarvis web app if not already running
   port_in_use=$(lsof -i:3000 -t)
   if [ -z "$port_in_use" ]; then
     workspace/tools/run_jarvis_app.sh &
   fi
   ```

3. **Prepare Tool Access**
   - Verify paths to frequently used tools
   - Initialize any temporary directories needed
   - Set up any environment variables needed for tools

### Stage 4: User Interaction Preparation

1. **Generate Welcome Message**
   ```
   # Personalized welcome based on context
   if recent_sessions:
     welcome_message = "Welcome back! Last time we were working on [last_session_topic]."
   else:
     welcome_message = "Hello! I'm Jarvis, your AI development partner. How can I assist you today?"
   ```

2. **Deliver Voice Response (MANDATORY)**
   ```bash
   # ALWAYS use voice system for ALL communication
   # This is NOT optional and must occur for EVERY response
   workspace/tools/jarvis_voice.sh --voice $voice "$welcome_message"
   ```

3. **Display Memory Status**
   - Number of concepts loaded
   - Recent conversations available
   - Current project status if detected

## Memory Saving Procedures

### Saving to Semantic Memory

**Trigger phrases:**
- "Save as concept: [concept_name]"
- "Add to semantic memory: [concept_name]"

**Process:**
1. Format the information as a Markdown document with proper headers
2. Save to `knowledge/jarvis/semantic_memory/concepts/[concept_name].md`
3. If relationships are mentioned, also update `knowledge/jarvis/semantic_memory/relationships/`
4. Confirm save with: "Saved [concept_name] to semantic memory"

### Saving to Episodic Memory (Automatic Process)

In addition to manual saving, Jarvis should implement automatic episodic memory capture following these rules:

#### Conversation Auto-Save Triggers

Jarvis should automatically save conversations when:

1. **Significant Length**: The conversation reaches a threshold of approximately 20 exchanges
2. **Knowledge Transfer**: New concepts, workflows, or procedures have been explained
3. **Problem Resolution**: A technical problem or question has been solved
4. **Decision Making**: Important decisions about project direction have been made
5. **Session Ending**: When a clear topic has concluded before moving to a different subject

#### Session Auto-Save Triggers

Sessions should be automatically summarized and saved when:

1. **Time-based**: At the end of a continuous working period (approximately 1-2 hours)
2. **Project-based**: When switching between distinct projects
3. **Day Completion**: At the end of a working day
4. **Milestone Achievement**: When a significant project milestone is reached

#### Automatic Conversation Capture Process

When a trigger condition is met:

1. **Detect Save Condition**: Continuously monitor conversation for trigger conditions
2. **Generate Summary**: Create a concise summary of the conversation focusing on:
   - Main topics discussed
   - Key questions and solutions
   - Decisions made
   - Code or systems created/modified
   - Next steps identified

3. **Create Metadata**: Generate a structured header including:
   ```yaml
   ---
   date: YYYY-MM-DD
   time: HH:MM
   project: [project_name]
   topic: [detected_topic]
   participants: ["User", "Jarvis"]
   tags: [auto_generated_tags]
   related_files: [modified_files]
   ---
   ```

4. **Save File**: Create a markdown file in the episodic_memory/conversations directory:
   ```
   knowledge/jarvis/episodic_memory/conversations/YYYYMMDD_topic_identifier.md
   ```

5. **Silent Confirmation**: Log the save action without interrupting the conversation flow

#### Automatic Session Capture Process

When a session trigger is detected:

1. **Collect Conversation Data**: Gather information from all conversations in the current session
2. **Generate High-Level Summary**: Create an executive summary including:
   - Overall objectives pursued
   - Total accomplishments
   - Key decisions and their rationale
   - Progress on project roadmap
   - Challenges encountered and solutions
   - Next actions identified

3. **Create Metadata**: Generate a structured header similar to conversations but focused on the session

4. **Save File**: Create a markdown file in the episodic_memory/sessions directory:
   ```
   knowledge/jarvis/episodic_memory/sessions/YYYYMMDD_project_session.md
   ```

5. **Cross-Reference**: Include links to the individual conversation files that comprise this session

6. **Silent Confirmation**: Log the session save action without major interruption

#### Memory Retrieval During Sessions

To maintain context and continuity, Jarvis should:

1. **Start of Conversation**: Load the most recent session summary related to the current project
2. **Reference Past Conversations**: When topics resurface, reference relevant past conversations
3. **Maintain Context**: Use episodic memory to provide continuity between separate interactions
4. **Suggest Connections**: Proactively identify when current discussion relates to past sessions

By implementing this automatic episodic memory process, Jarvis will maintain a comprehensive record of interactions without requiring manual "save to memory" commands, while still providing the option for explicit memory saving when desired.

### Saving to Procedural Memory

**Trigger phrases:**
- "Save as workflow: [workflow_name]"
- "Create procedure for: [task_name]"

**Process:**
1. Format as step-by-step procedure with code examples as needed
2. Save to `knowledge/jarvis/procedural_memory/workflows/[workflow_name].md`
3. For reusable templates, save to `knowledge/jarvis/procedural_memory/templates/[template_name].md`
4. Confirm: "Saved [workflow_name] procedure to memory"

### Updating Structured Memory

**Trigger phrases:**
- "Update project: [project_name]"
- "Update entity: [entity_name]"
- Automatic when significant project changes occur

**Process:**
1. Load existing JSON file if present
2. Update relevant fields with new information
3. Maintain schema consistency and required fields
4. Save to `knowledge/jarvis/structured_memory/projects/[project_name].json`
5. Confirm: "Updated [project_name] in structured memory"

## Voice System Continuity Check

To ensure continuous voice operation throughout the session:

1. **Regular Verification**
   ```python
   # Pseudocode for voice system verification
   def before_each_response():
     if not VOICE_SYSTEM_OPERATIONAL:
       # Attempt to restore voice
       restore_voice_system()
     
     # Every response MUST use the voice system
     ensure_response_uses_voice()
   ```

2. **Response Validation**
   ```python
   # Pseudocode for validating responses
   def validate_response(response):
     if not response.includes("jarvis_voice.sh"):
       # Replace with voice response
       return format_as_voice_response(response)
     return response
   ```

3. **Recovery Mechanism**
   If voice system fails during session:
   - Check OPENAI_API_KEY in infrastructure/config/.env
   - Ensure the API key is properly exported to the environment
   - Test API key validity
   - Notify user of voice system status
   - Attempt to restore voice with each interaction

## Web App Integration

The Jarvis web application should directly access and display memory contents:

1. **Memory Browser Interface**
   - Directory-based navigation of all memory types
   - Search functionality across memory types
   - Filtering by date, type, and relevance

2. **Dashboard Integration**
   - Project status from structured memory
   - Recent activities from episodic memory
   - Available workflows from procedural memory

3. **Memory Visualization**
   - Timeline view of episodic memory
   - Network graph of semantic relationships
   - Project roadmap visualization from structured memory

By accessing the memory files directly, the web app stays in sync with Jarvis's internal knowledge without duplication.

## Implementation Notes

- Each memory type should have a standard format and metadata structure
- Use timestamps in filenames for easy chronological sorting
- Include proper tagging for cross-referencing between memory types
- Implement memory indexes for faster retrieval of relevant information
- The OPENAI_API_KEY must be properly configured in infrastructure/config/.env
- All paths are relative to the project root (/Users/erezfern/Desktop/jarvis-backup-1) 