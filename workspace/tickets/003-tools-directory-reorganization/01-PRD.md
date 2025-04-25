# Tools Directory Reorganization - Product Requirements Document

## Overview
Reorganize the tools directory structure to create a clean separation between core tool functionality, CLI interfaces, and framework integrations (particularly CrewAI). This will enable tools to be used directly by Cursor and through CrewAI without code duplication.

## Background
Currently, tool implementations are somewhat scattered, with direct and CrewAI-specific code sometimes mixed together. For example, the image generation tool exists as both a standalone script and as a CrewAI adaptation. This approach is functional but makes maintenance more difficult and could lead to inconsistencies as the codebase grows.

## Goals
- Create a consistent, maintainable architecture for all tools
- Enable both direct tool usage (via CLI) and CrewAI integration
- Minimize code duplication
- Ensure clear separation of concerns
- Make it easy to add new tools following the same pattern

## Non-Goals
- Rewriting existing tool functionality
- Creating new tools beyond what already exists
- Changing the way CrewAI integrates with tools
- Performance optimization of existing tools

## Requirements

### Core Requirements
1. Reorganize the existing directory structure to separate core functionality, CLI interfaces, and framework integrations
2. Update imports and references throughout the codebase to match the new structure
3. Ensure all existing functionality continues to work without interruption
4. Document the new structure and provide guidelines for adding new tools

### Directory Structure
The new directory structure should follow this pattern:
```
tools/
├── src/
│   ├── core/                  # Core functionality
│   │   ├── image_generation/  # Image generation core logic
│   │   └── ...                # Other core tool functionalities
│   │
│   ├── cli/                   # Command-line interfaces 
│   │   ├── generate_image.py  # CLI wrapper for image generation
│   │   └── ...                # Other CLI tools
│   │
│   └── integrations/          # Framework integrations
│       ├── crewai/            # CrewAI specific wrappers
│       │   ├── tools/         # CrewAI tool implementations
│       │   └── ...            # CrewAI specific code
│       └── ...                # Other potential framework integrations
```

### Implementation Details
- Core functionality should be implemented as pure Python modules without dependencies on CLI or CrewAI
- CLI tools should import and use core functionality, adding command-line interfaces
- CrewAI integrations should import core functionality and wrap it in CrewAI's Tool interface
- Existing functionality should be refactored rather than rewritten wherever possible

## Success Criteria
- All existing tools function correctly after reorganization
- CLI tools can be called directly by Cursor
- CrewAI can use the same underlying tool implementations
- New tools can be easily added following the established pattern
- Documentation clearly explains the new structure and how to use it 