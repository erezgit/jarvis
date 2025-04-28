# CrewAI Newsletter Team - Architectural Design Document

## Overview
This document outlines the architectural design for implementing a CrewAI-based system for newsletter content generation. The system will allow users to interact with AI agents through Cursor, similar to how they currently use the image generation service.

## Architecture Alignment
The implementation follows the existing Jarvis Command Center architecture:

```
┌────────────────────────────────────────────────────────────┐
│                      Human Interface                        │
│                      (Cursor IDE)                           │
└─────────────────────────────┬──────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    AI Reasoning Layer                       │
│                    (Claude/OpenAI)                          │
└─────────────────────────────┬──────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    Command Execution Layer                  │
│                    (Python/Shell Scripts)                   │
└─────────────────────────────┬──────────────────────────────┘
                              │
┌─────────────────────────────▼──────────────────────────────┐
│                    External Services Layer                  │
│                 (APIs, Data Sources, Tools)                 │
└────────────────────────────────────────────────────────────┘
```

The new CrewAI implementation will be positioned in the Command Execution Layer, with connections to the External Services Layer for APIs and data sources.

## Component Design

### 1. CrewAI Service Module
- **Location**: `tools/src/services/crewai/`
- **Purpose**: Provide command-line interface to CrewAI functionality
- **Components**:
  - `run_crew.py`: Main executable script
  - `agents.py`: Agent definitions and configurations
  - `tasks.py`: Task definitions
  - `tools/`: Custom tools for CrewAI agents

### 2. Agent Hierarchy
```
┌───────────────────────┐
│      Design CEO       │
└─────────┬─┬─┬─────────┘
          │ │ │
┌─────────▼─┐ │ ┌─────────▼─┐
│  Design   │ │ │  Content  │
│  Manager  │ │ │  Manager  │
└─────┬─────┘ │ └─────┬─────┘
      │       │       │
┌─────▼─┐ ┌───▼───┐ ┌─▼─────┐
│Designer│ │Creative│ │Writer │
│       │ │Manager │ │       │
└───────┘ └───┬───┘ └───────┘
              │
          ┌───▼───┐
          │Creative│
          │       │
          └───────┘
```

### 3. External Tool Integration
- **Image Generation**: Integrates with existing `tools/src/services/image/generate_image.py`
- **Dropbox Access**: New implementation at `tools/src/services/dropbox/access_dropbox.py`
- **Web Search**: Uses CrewAI's built-in search capabilities

### 4. Data Flow

1. **Initialization Flow**:
   ```
   User (Cursor) → run_crew.py → CrewAI Framework → Agent Initialization → Tool Setup
   ```

2. **Execution Flow**:
   ```
   CrewAI → Hierarchical Agent Execution → Task Delegation → Tool Usage → Content Generation
   ```

3. **Results Flow**:
   ```
   Generated Content → Output Formatting → Terminal Output → User (Cursor)
   ```

### 5. Timeout Mechanism
- Implements threading with timeouts to ensure execution completes within specified limits
- Gracefully terminates excess computation
- Returns partial results if full execution cannot complete in time

## Technical Specifications

### Command-Line Interface
```
python tools/src/services/crewai/run_crew.py <prompt> [options]

Options:
  --agent STRING       Specific agent to interact with (default: CEO)
  --time_limit INT     Maximum execution time in seconds (default: 120)
  --output STRING      Output directory path (default: ./crew_outputs)
  --process STRING     Process type: sequential, hierarchical (default: hierarchical)
```

### Agent Configuration
- Uses YAML for agent definitions (roles, goals, backstories)
- Supports dynamic agent creation based on command-line parameters
- Configurable task delegation patterns

### Tool Integration
- Tool registration with CrewAI framework
- Consistent interface pattern across all tools
- Error handling and graceful degradation

## Security Considerations
1. API keys stored securely in `.env` file, not in code
2. No sensitive user data persisted between runs
3. Execution isolated within project environment
4. Rate limiting for external API calls

## Error Handling
1. Graceful handling of API failures
2. Timeout management for long-running processes
3. Informative error messages for troubleshooting
4. Fallback mechanisms for critical features

## Extension Points
1. Additional agent roles and specializations
2. New external tool integrations
3. Custom process types beyond sequential and hierarchical
4. Enhanced output formats and destinations 