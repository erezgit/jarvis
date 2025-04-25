# Tool Structure Migration Guide

This document provides guidance for transitioning from the old tools structure to the new organized structure.

## Overview of Changes

The tools directory has been reorganized to follow a cleaner, more maintainable structure:

**Old Structure**:
```
tools/
└── src/
    └── services/
        ├── image/
        │   └── generate_image.py
        └── crewai/
            └── tools/
                └── image_generation_tool.py
```

**New Structure**:
```
tools/
└── src/
    ├── core/              # Core functionality
    │   └── image_generation/
    │       └── generator.py
    ├── cli/               # Command-line interfaces
    │   └── generate_image.py
    └── integrations/      # Framework integrations
        └── crewai/
            └── tools/
                └── image_tool.py
```

## Updating Your Code

### Image Generation

If you were using the image generation functionality, here's how to update your code:

#### Command Line Usage

**Old**:
```bash
python tools/src/services/image/generate_image.py "A landscape"
```

**New**:
```bash
python tools/src/cli/generate_image.py "A landscape"
```

#### Python Imports

**Old**:
```python
from tools.src.services.image.generate_image import generate_image
```

**New**:
```python
from tools.src.core.image_generation.generator import generate_image
```

#### CrewAI Integration

**Old**:
```python
from tools.src.services.crewai.tools.image_generation_tool import ImageGenerationTool
```

**New**:
```python
from tools.src.integrations.crewai.tools.image_tool import ImageGenerationTool
```

## Benefits of the New Structure

1. **Separation of Concerns**: Core functionality is separate from interfaces and integrations
2. **Code Reuse**: The same core code is used by both CLI and framework integrations
3. **Maintainability**: Easier to maintain and extend
4. **Consistency**: Provides a consistent pattern for all tools

## Adding New Tools

To add a new tool to the system, follow this pattern:

1. Create core functionality in `tools/src/core/<tool_name>/`
2. Create a CLI interface in `tools/src/cli/`
3. Create framework integrations in `tools/src/integrations/`
4. Add documentation in `tools/docs/`

See the image generation tool as a reference implementation. 