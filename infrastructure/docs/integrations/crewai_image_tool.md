# CrewAI Image Generation Tool

The `ImageGenerationTool` class provides a CrewAI integration for generating images using OpenAI's DALL-E model.

## Usage

```python
from tools.src.integrations.crewai.tools.image_tool import ImageGenerationTool
from crewai import Agent, Task, Crew

# Create the image generation tool
image_tool = ImageGenerationTool(
    output_dir="workspace/generated_images",  # Optional
    api_key="[YOUR_API_KEY]"  # Optional, defaults to env var
)

# Create an agent that uses the image generation tool
artist_agent = Agent(
    role="Digital Artist",
    goal="Create beautiful and descriptive images based on text prompts",
    backstory="You are an expert digital artist with a talent for visualizing concepts.",
    tools=[image_tool],
)

# Create a task for the agent
image_task = Task(
    description=(
        "Generate an image of a futuristic smart home with various IoT devices, "
        "showing how they interact in a modern living space. "
        "Make it look realistic but with a slight sci-fi aesthetic."
    ),
    agent=artist_agent,
)

# Create a crew with the agent and task
demo_crew = Crew(
    agents=[artist_agent],
    tasks=[image_task],
)

# Run the crew
result = demo_crew.kickoff()
```

## Parameters

### Tool Initialization

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| output_dir | str | Directory where the generated images will be saved | "workspace/generated_images" |
| api_key | str | OpenAI API key | None (uses env var) |

### Image Generation Method

When an agent uses this tool, it will call the `_generate_image` method with these parameters:

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| prompt | str | The text description to generate an image from | (required) |
| size | str | Size of the generated image | "1024x1024" |
| quality | str | Quality of the generated image | "standard" |
| style | str | Style of the generated image | "vivid" |
| filename_prefix | str | Prefix for the output filename | "image" |

## Return Value

The tool returns a dictionary with the following keys:

On success:
```python
{
    "status": "success",
    "message": "Image generated successfully and saved to /path/to/image.png",
    "image_path": "/path/to/image.png",
    "image_url": "https://...",
    "prompt": "The prompt that was used"
}
```

On failure:
```python
{
    "status": "failure",
    "message": "Failed to generate image: [error message]",
    "prompt": "The prompt that was used"
}
```

## Integration with CrewAI Agents

The tool is registered in the `tools/src/integrations/crewai/tools/__init__.py` module and can be accessed by name:

```python
from tools.src.integrations.crewai.tools import get_tool

# Get the image generation tool
image_tool = get_tool("image_generation")
```

It can also be added to agents based on configuration using the `get_tools_for_agent` function:

```python
from tools.src.integrations.crewai.tools import get_tools_for_agent

agent_config = {
    "allowed_tools": ["image_generation"]
}

tools = get_tools_for_agent(agent_config)
``` 