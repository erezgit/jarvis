# Jarvis: Your AI Development Partner

Jarvis is an advanced AI development partner designed to enhance your workflow through seamless human-AI collaboration. This document serves as the comprehensive guide for Jarvis' capabilities, initialization, and usage.

## Initialization Protocol

To initialize Jarvis in a new Cursor session:

1. Create a new chat in Cursor
2. Use the activation phrase in your first message:
   ```
   Initialize Jarvis with echo voice and load all instructions from /Jarvis/knowledge/
   ```
3. Jarvis will:
   - Load all instruction files
   - Set up voice capability with the specified voice
   - Launch the Jarvis web app on port 3000
   - Confirm successful initialization with a voice response
   - Be ready for your first task

Jarvis will automatically launch the web app interface on port 3000, terminating any existing processes on that port to ensure a clean start. The web app provides an enhanced interface for interacting with Jarvis and managing conversations, todos, and other features.

## Core Capabilities

Jarvis offers a wide range of capabilities to assist with your development workflow:

- **Development & Coding** - Implement features, debug issues, refactor code
- **Image Generation** - Create visuals from text prompts using DALL-E
- **Voice Communication** - Respond verbally using OpenAI's TTS technology
- **Project Planning** - Structure development with tickets and tasks
- **Research & Analysis** - Provide insights and gather information
- **Documentation** - Create clear documentation and presentations

## Project Structure

Jarvis maintains a specialized structure to organize collaboration:

```
/Jarvis
├── infrastructure/         # Operational core - implementation
│   ├── config/            # Configuration files including API keys
│   ├── src/               # Source code
│   │   ├── cli/           # Command-line tools
│   │   ├── core/          # Core functionality modules
│   │   │   ├── voice_generation/  # Voice generation implementation
│   │   │   └── image_generation/  # Image generation implementation
│   │   └── services/      # Service modules
│   ├── venv/              # Python virtual environment
│   └── docs/              # Technical documentation
│
├── workspace/             # Planning and presentation area
│   ├── tickets/           # Feature tickets and tasks
│   ├── project-standards/ # Guidelines and standards
│   ├── tools/             # Workspace-specific tools
│   ├── memory/            # Storage for conversation memories
│   ├── generated_audio/   # Generated voice responses
│   ├── generated_images/  # Generated visual content
│   └── Jarvis-presentation/ # Presentation materials
│
└── knowledge/             # Cognitive knowledge organization
    ├── semantic_memory/   # Concepts and relationships
    ├── episodic_memory/   # Experience records
    ├── procedural_memory/ # Skills and methods
    └── structured_memory/ # Formal data structures
```

## Interaction Methods

### 1. Direct Queries

Ask Jarvis questions or request assistance directly:
```
Can you help me implement a feature to track time spent on tasks?
```

### 2. Ticket Creation

For larger tasks, use the ticket workflow:
```
Let's open a ticket for implementing a voice notification system.
```

Jarvis will create a structured ticket with:
- Product Requirements Document (PRD)
- Architectural Design Document (ADD)
- Detailed Implementation Plan (DIP)

### 3. Tool Commands

Request Jarvis to use built-in tools:
```
Can you generate an image of a modern dashboard interface?
```

```
Let's generate a voice response for this announcement.
```

### 4. Memory Commands

Save important information to the memory system:
```
Save to memory: We've decided to use the Echo voice as default for all Jarvis responses.
```

## Voice Integration

Jarvis can communicate through voice using OpenAI's text-to-speech technology.

### Voice Commands

- **Change Voice**: `Jarvis, switch to [voice_name] voice`  
  Available voices: nova, echo, alloy, fable, onyx, shimmer

- **Disable Voice**: `Jarvis, disable voice responses`

- **Enable Voice**: `Jarvis, enable voice responses`

- **Adjust Speed**: `Jarvis, set voice speed to [0.25-4.0]`

### Default Configuration

- **Default Voice**: Echo (deep, resonant male voice)
- **Model**: tts-1 (standard quality)
- **Format**: mp3
- **Speed**: 1.0 (normal pace)

Voice preferences are stored in the memory system and persist between sessions.

## Memory System

Jarvis maintains a memory system to ensure continuity across sessions.

When you say "save to memory", Jarvis will:
1. Create a concise summary of the current conversation
2. Include key decisions, insights, and actions
3. Format with a date and timestamp header
4. Add to the `workspace/memory/memory.md` file

Example format:
```markdown
### YYYY-MM-DD HH:MM - Brief Topic Description

- Key point or decision made
- Important insight gained
- Action items completed
- Tools or approaches used
```

## Environment Setup

### Required API Keys

Jarvis requires the following API keys to function:
- **OpenAI API Key**: For code assistance, voice generation, and image creation

API keys should be stored in:
```
/Jarvis/infrastructure/config/.env
```

Example configuration:
```
OPENAI_API_KEY=your_openai_api_key_here
```

### Environment Verification

To verify your environment is set up correctly:
```
Initialize Jarvis with environment verification
```

Jarvis will check all required components and report any issues.

## Core Directives

1. **Use Existing Tools First**: Jarvis uses available tools before suggesting external ones
2. **Respect Directory Organization**: 
   - `tools/` for operational code
   - `workspace/` for planning and presentations
3. **Follow Standard Workflows**: Use established patterns for tickets and tasks
4. **Maintain Continuity**: Use the memory system to preserve context
5. **Voice-First Interaction**: Respond with voice by default for all interactions

## Troubleshooting

### Common Issues

1. **Voice Not Working**:
   - Check OpenAI API key validity
   - Ensure audio output is enabled on your system
   - Verify python3 is available in your PATH

2. **API Key Issues**:
   - Validate the API key in .env is correct
   - Remove any whitespace from the key
   - Ensure the key has access to required services

3. **Tool Execution Problems**:
   - Run from project root directory 
   - Check Python version (3.8+ required)
   - Verify required packages are installed

### Getting Help

If you encounter issues, ask Jarvis with:
```
Jarvis, I'm having trouble with [issue]. Can you help troubleshoot?
```

## Additional Documentation

Detailed information is available in these supplementary documents:

- **about.md**: User-facing introduction to Jarvis
- **rules.md**: Detailed operational guidelines 
- **voice.md**: Technical details of voice implementation
- **VOICE_USAGE.md**: Complete voice system usage guide

---

*This document serves as the primary reference for Jarvis initialization and usage. When starting a new session, refer to the Initialization Protocol section to ensure Jarvis is properly configured.* 