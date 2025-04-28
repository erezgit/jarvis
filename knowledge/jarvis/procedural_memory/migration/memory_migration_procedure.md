# Memory System Migration Procedure

## Overview
This document outlines the procedure for migrating the Jarvis memory system from a flat memory-type structure to a domain-based organization.

## Migration Steps

### 1. Create Domain Structure
```bash
# Create domain directories with nested memory type folders
mkdir -p Jarvis/knowledge/domains/{jarvis,project1,project2,project3}/{semantic_memory,episodic_memory,procedural_memory,structured_memory}
```

### 2. Copy Existing Memory to Domain Structure
```bash
# Copy semantic memory files
cp -r Jarvis/knowledge/semantic_memory/concepts/* Jarvis/knowledge/domains/jarvis/semantic_memory/concepts/
cp -r Jarvis/knowledge/semantic_memory/relationships/* Jarvis/knowledge/domains/jarvis/semantic_memory/relationships/

# Copy episodic memory files
cp -r Jarvis/knowledge/episodic_memory/sessions/* Jarvis/knowledge/domains/jarvis/episodic_memory/sessions/
cp -r Jarvis/knowledge/episodic_memory/conversations/* Jarvis/knowledge/domains/jarvis/episodic_memory/conversations/

# Copy procedural memory files
cp -r Jarvis/knowledge/procedural_memory/workflows/* Jarvis/knowledge/domains/jarvis/procedural_memory/workflows/
cp -r Jarvis/knowledge/procedural_memory/templates/* Jarvis/knowledge/domains/jarvis/procedural_memory/templates/

# Copy structured memory files
cp -r Jarvis/knowledge/structured_memory/projects/* Jarvis/knowledge/domains/jarvis/structured_memory/projects/
cp -r Jarvis/knowledge/structured_memory/entities/* Jarvis/knowledge/domains/jarvis/structured_memory/entities/
```

### 3. Create Domain Documentation
Create README.md files in each domain directory to explain the structure:

```markdown
# Domain Memory Structure

This directory contains the memory systems for the [DOMAIN] domain, organized according to our cognitive architecture model.

## Memory Types

### Semantic Memory
Knowledge about concepts, facts, and their relationships.
- **concepts/**: Definitions and explanations of key concepts
- **relationships/**: How concepts relate to each other

### Episodic Memory
Records of experiences and events.
- **sessions/**: Records of working sessions
- **conversations/**: Stored conversation histories

### Procedural Memory
Instructions, workflows, and processes.
- **workflows/**: Step-by-step procedures for tasks
- **templates/**: Reusable patterns and formats
- **design/**: Design standards and guidelines

### Structured Memory
Organized information about entities and projects.
- **entities/**: Information about specific objects or actors
- **projects/**: Details about projects and their components
```

### 4. Update Root Knowledge Index
Update the knowledge/index.md file to reflect the new domain-based organization:

```markdown
# Jarvis Knowledge System

The Jarvis Knowledge System is organized using a domain-based cognitive architecture model, providing a structured approach to storing and accessing information.

## Domain-Based Organization

All knowledge is organized first by domain, then by memory type:

```
knowledge/
└── domains/
    ├── jarvis/                # Core Jarvis system domain
    │   ├── semantic_memory/   # Concepts and relationships
    │   ├── episodic_memory/   # Sessions and conversations
    │   ├── procedural_memory/ # Workflows and procedures
    │   └── structured_memory/ # Entities and projects
    │
    ├── project1/              # Project-specific domain
    │   ├── semantic_memory/
    │   ├── episodic_memory/
    │   ├── procedural_memory/
    │   └── structured_memory/
    │
    ├── project2/
    └── project3/
```

## Memory Types

Each domain contains four types of memory:

1. **Semantic Memory**: Knowledge about concepts, facts, and their relationships
2. **Episodic Memory**: Records of experiences and events
3. **Procedural Memory**: Instructions, workflows, and processes
4. **Structured Memory**: Organized information about entities and projects
```

### 5. Remove Old Structure
After verification that all content has been successfully migrated:

```bash
# Remove old memory directories
rm -rf Jarvis/knowledge/{semantic_memory,episodic_memory,procedural_memory,structured_memory}
```

### 6. Update References
Any code or documents that reference the old memory paths should be updated to use the new domain-based paths.

## Notes
- This migration preserves all existing memory content while reorganizing it into a more scalable domain-based structure.
- The procedure can be adapted for future migrations of additional knowledge components.
- For project-specific knowledge, ensure it is placed in the appropriate project domain rather than the core Jarvis domain. 