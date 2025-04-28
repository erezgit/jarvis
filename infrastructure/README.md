# Jarvis

Jarvis is an AI development partner designed to assist in software development tasks through natural conversation with voice feedback.

## Features

- **Voice-First Interaction**: Jarvis communicates through voice output for all interactions
- **Cognitive Architecture**: Built with semantic, episodic, procedural, and structured memory systems
- **Development Assistant**: Helps architect systems, generate code, debug issues, and explain concepts

## Architecture

Jarvis' architecture is organized around a cognitive memory model:

- **Semantic Memory**: Core concepts, relationships, and knowledge
- **Episodic Memory**: Conversations and session histories
- **Procedural Memory**: Workflows and templates for tasks
- **Structured Memory**: Projects, entities, and structured data

## Getting Started

```bash
# Clone the repository
git clone https://github.com/erezgit/Jarvis.git

# Set up the environment
cd Jarvis
# Additional setup instructions will be added
```

## Project Structure

```
jarvis/
├── infrastructure/    # Core system infrastructure
├── knowledge/         # Memory and knowledge base
│   ├── jarvis/        # Jarvis domain knowledge
│   │   ├── episodic_memory/    # Conversations and sessions
│   │   ├── procedural_memory/  # Workflows and templates
│   │   ├── semantic_memory/    # Concepts and relationships
│   │   └── structured_memory/  # Projects and entities
├── workspace/         # Working directory for Jarvis
    ├── jarvis-app/    # Web application interface
    ├── tools/         # Utility scripts and tools
    └── generated_audio/  # Voice output files
``` 