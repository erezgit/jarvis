# Jarvis AI Assistant

Jarvis is your AI development partner with voice capabilities, designed to help with coding, research, and project management tasks.

## Directory Structure

Jarvis maintains exactly three main directories:

### 1. `infrastructure/`
Core system components and services:
- API integrations
- Voice generation
- System utilities
- Configuration (`infrastructure/config/.env`)

### 2. `workspace/`
Working files and user-facing components:
- Generated audio and images
- Web application
- Tools and utilities
- Project files

### 3. `knowledge/`
Knowledge base and memory systems:
- Semantic memory (concepts)
- Episodic memory (conversations)
- Procedural memory (workflows)
- Structured memory (entities)

## Path Conventions

There are two path conventions used in Jarvis:

1. **Implementation Paths** (used in code)
   ```
   workspace/generated_audio
   infrastructure/src/core
   knowledge/semantic_memory
   ```
   These are the direct filesystem paths.

2. **User-Facing Paths** (used in docs and instructions)
   ```
   ./Jarvis/workspace/tools/jarvis_voice.sh
   ```
   These are used for consistency in user commands and instructions.

All implementation follows the three-directory structure, keeping the codebase organized and maintainable.

## Setup

1. Run the setup script:
   ```bash
   ./setup_env.sh
   ```

2. When prompted, enter your OpenAI API key or edit the `infrastructure/config/.env` file manually.

3. Test the voice system:
   ```bash
   ./workspace/tools/jarvis_voice.sh "Hello, I am Jarvis"
   ```

## Usage

- **Voice Generation:**
  ```bash
  ./workspace/tools/jarvis_voice.sh "Your message here"
  ```

- **Web Interface:**
  ```bash
  ./workspace/tools/run_jarvis_app.sh
  ```

## Environment Configuration

Your OpenAI API key and other configuration settings are stored in:
```
infrastructure/config/.env
```

To activate these settings in your current shell:
```bash
source infrastructure/config/.env
```

## Maintenance

To maintain the three-directory structure:
- Keep all core system code in `infrastructure/`
- Keep all user-facing outputs in `workspace/`
- Keep all knowledge and memory in `knowledge/`

Do not create additional top-level directories. 