# Jarvis Tools Quick Reference

This document provides a quick reference for the available tools in the Jarvis system.

## Directory Structure

```
tools/
├── src/
│   ├── core/                       # Core functionality
│   │   ├── image_generation/       # Image generation core logic
│   │   └── ...                     # Other core components
│   │
│   ├── cli/                        # Command-line interfaces
│   │   ├── generate_image.py       # Image generation CLI
│   │   └── ...                     # Other CLI tools
│   │
│   └── integrations/               # Framework integrations
│       ├── crewai/                 # CrewAI integration
│       │   ├── tools/              # CrewAI tools
│       │   └── ...                 # Other CrewAI files
│       └── ...                     # Other framework integrations
└── docs/                           # Documentation
```

## Available Tools

### Image Generation

Generate images using OpenAI's DALL-E model.

#### Direct Usage (CLI)

```bash
# Generate an image with default settings
python tools/src/cli/generate_image.py "A beautiful mountain landscape with a lake"

# Generate an image with custom settings
python tools/src/cli/generate_image.py "A beautiful mountain landscape with a lake" \
  --size 1024x1024 \
  --quality hd \
  --style natural \
  --output-dir workspace/images \
  --format text
```

#### Programmatic Usage

```python
from tools.src.core.image_generation.generator import generate_image

# Generate an image
result = generate_image(
    prompt="A beautiful mountain landscape with a lake",
    size="1024x1024",
    quality="standard",
    style="vivid",
    output_dir="workspace/images"
)

# Check the result
if result["success"]:
    print(f"Image URL: {result['image_url']}")
    print(f"Saved to: {result['saved_path']}")
else:
    print(f"Error: {result['error']}")
```

#### CrewAI Integration

```python
from tools.src.integrations.crewai.tools.image_tool import ImageGenerationTool
from crewai import Agent

# Create the image generation tool
image_tool = ImageGenerationTool(output_dir="workspace/images")

# Create an agent with the tool
agent = Agent(
    role="Artist",
    goal="Create beautiful images",
    tools=[image_tool]
)
```

## Adding New Tools

To add a new tool, follow these steps:

1. Create core functionality in `tools/src/core/<tool_name>/`
2. Create a CLI interface in `tools/src/cli/`
3. Create framework integrations in `tools/src/integrations/`
4. Add documentation in `tools/docs/`

Refer to the existing image generation tool as an example. 