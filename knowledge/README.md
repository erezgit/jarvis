# Jarvis Knowledge System

This directory contains Jarvis's cognitive memory architecture. The knowledge system is organized into domains, with each domain containing four types of memory.

## Memory Types

- **Semantic Memory**: Core concepts, relationships, and knowledge
  - Concepts: Fundamental units of knowledge (definitions, explanations)
  - Relationships: Connections between concepts
  
- **Episodic Memory**: Conversations and session histories
  - Conversations: Detailed exchanges with users
  - Sessions: High-level summaries of work periods
  
- **Procedural Memory**: Workflows and templates for tasks
  - Workflows: Step-by-step procedures for accomplishing tasks
  - Templates: Reusable patterns for common outputs
  
- **Structured Memory**: Projects, entities, and structured data
  - Projects: Information about specific projects
  - Entities: Structured data about important objects or people

## Domain Structure

The knowledge system is organized into domains:

```
knowledge/
├── jarvis/              # Core Jarvis domain knowledge
│   ├── semantic_memory/
│   ├── episodic_memory/
│   ├── procedural_memory/
│   └── structured_memory/
├── projects/            # Project-specific knowledge domains
│   ├── project1/
│   │   ├── semantic_memory/
│   │   ├── episodic_memory/
│   │   ├── procedural_memory/
│   │   └── structured_memory/
│   └── project2/
│       └── ...
```

## Working with Memory

### Memory Commands

Jarvis understands several memory-related commands:

- "Save as concept: [name]" → Store in semantic memory
- "Save as workflow: [name]" → Store in procedural memory
- "Update project: [name]" → Update structured memory

### Automatic Memory Capture

Episodic memory is captured automatically:

- Conversations are saved based on significance triggers
- Sessions are summarized at logical boundaries
- Memory is retrieved based on relevance to current context 