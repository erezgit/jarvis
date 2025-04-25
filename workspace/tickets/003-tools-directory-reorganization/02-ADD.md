# Tools Directory Reorganization - Architectural Design Document

## Overview
This document outlines the architectural design for reorganizing the tools directory structure to create a clean separation between core functionality, CLI interfaces, and framework integrations.

## Design Principles
1. **Separation of Concerns**: Clearly separate core logic from interfaces (CLI) and framework integrations (CrewAI)
2. **DRY (Don't Repeat Yourself)**: Minimize code duplication by sharing core implementations
3. **Modularity**: Design components to be independently testable and maintainable
4. **Backward Compatibility**: Ensure existing functionality continues to work
5. **Future Extensibility**: Make it easy to add new tools and integrations

## Architecture

### Directory Structure
```
tools/
├── src/
│   ├── core/                       # Core functionality
│   │   ├── __init__.py
│   │   ├── image_generation/       # Image generation core logic
│   │   │   ├── __init__.py
│   │   │   └── generator.py        # Core image generation functionality
│   │   └── ...                     # Other tool directories
│   │
│   ├── cli/                        # Command-line interfaces
│   │   ├── __init__.py
│   │   ├── generate_image.py       # CLI for image generation
│   │   └── ...                     # Other CLI tools
│   │
│   └── integrations/               # Framework integrations
│       ├── __init__.py
│       ├── crewai/                 # CrewAI specific wrappers
│       │   ├── __init__.py
│       │   ├── tools/              # CrewAI tool implementations
│       │   │   ├── __init__.py
│       │   │   ├── image_tool.py   # CrewAI wrapper for image generation
│       │   │   └── ...            # Other CrewAI tools
│       │   └── ...                # Other CrewAI specific code
│       └── ...                    # Other framework integrations
└── docs/                          # Documentation
    ├── core/                      # Documentation for core functionality
    ├── cli/                       # Documentation for CLI tools
    └── integrations/              # Documentation for integrations
```

### Component Relationships

#### Core Components
The `core/` directory contains the essential functionality of each tool, implemented as pure Python modules with well-defined interfaces:

- **Image Generation Core** (`core/image_generation/generator.py`):
  - Contains the `generate_image()` function that interfaces with OpenAI's DALL-E API
  - Handles parameter validation, API communication, and result processing
  - Has no dependencies on CLI or CrewAI

#### CLI Components
The `cli/` directory contains command-line interfaces that wrap core functionality:

- **Image Generation CLI** (`cli/generate_image.py`):
  - Imports the core `generate_image()` function
  - Adds command-line argument parsing and help documentation
  - Handles output formatting and file saving
  - Executable directly by Cursor or from the terminal

#### Integration Components
The `integrations/` directory contains framework-specific adaptations:

- **CrewAI Image Tool** (`integrations/crewai/tools/image_tool.py`):
  - Imports the core `generate_image()` function
  - Wraps it in CrewAI's Tool interface
  - Handles CrewAI-specific functionality like describing tool capabilities
  - Usable by CrewAI agents in workflows

### Interface Contracts

#### Core Interfaces
Core functions should have clean, well-documented interfaces:

```python
def generate_image(
    prompt: str,
    size: str = "1024x1024",
    quality: str = "standard",
    style: str = "vivid",
    output_dir: Optional[str] = None,
    api_key: Optional[str] = None
) -> Dict[str, Any]:
    """
    Generate an image using OpenAI's DALL-E model.
    
    Args:
        prompt: Description of the desired image
        size: Size of the generated image
        quality: Quality of the generated image
        style: Style of the generated image
        output_dir: Directory to save the generated image
        api_key: OpenAI API key (falls back to environment variable)
        
    Returns:
        Dictionary containing image URL and saved file path
    """
```

#### CLI Interfaces
CLI tools should use argparse with consistent parameter naming and help documentation.

#### Integration Interfaces
Integrations should adapt core functionality to the specific framework's requirements without changing the underlying behavior.

## Migration Strategy

1. **Create New Structure**: Set up the new directory structure without modifying existing code
2. **Refactor Core Logic**: Extract and move core functionality to appropriate locations
3. **Create CLI Wrappers**: Create command-line interfaces that use the core functionality
4. **Update Integrations**: Update framework integrations to use the core functionality
5. **Test Thoroughly**: Ensure all functionality works as expected
6. **Remove Deprecated Components**: Remove old files once new structure is confirmed working

## Compatibility Considerations

- Existing scripts should continue to work during the transition
- Import paths will need to be updated throughout the codebase
- Documentation should be updated to reflect the new structure 