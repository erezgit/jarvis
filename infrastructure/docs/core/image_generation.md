# Core Image Generation

The core image generation module provides a function to generate images using OpenAI's DALL-E model.

## Usage

```python
from tools.src.core.image_generation.generator import generate_image

# Generate an image
result = generate_image(
    prompt="A beautiful mountain landscape with a lake",
    size="1024x1024",  # Optional, defaults to "1024x1024"
    quality="standard",  # Optional, defaults to "standard"
    style="vivid",  # Optional, defaults to "vivid"
    output_dir="/path/to/save/images",  # Optional
    api_key="[YOUR_API_KEY]",  # Optional, defaults to OPENAI_API_KEY env var
    filename_prefix="landscape"  # Optional, prefix for saved file
)

# Check if the generation was successful
if result["success"]:
    print(f"Image URL: {result['image_url']}")
    if result["saved_path"]:
        print(f"Image saved to: {result['saved_path']}")
else:
    print(f"Error: {result['error']}")
```

## Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| prompt | str | Text description of the image to generate | (required) |
| size | str | Image size, one of "256x256", "512x512", "1024x1024", "1792x1024", "1024x1792" | "1024x1024" |
| quality | str | Image quality, one of "standard" or "hd" | "standard" |
| style | str | Image style, one of "vivid" or "natural" | "vivid" |
| output_dir | str | Directory to save the generated image | None |
| api_key | str | OpenAI API key | None (uses env var) |
| filename_prefix | str | Prefix for the saved image filename | "" |

## Return Value

The function returns a dictionary with the following keys:

On success:
```python
{
    "success": True,
    "image_url": "https://...",  # URL to the generated image
    "saved_path": "/path/to/image.png",  # Path to saved image (if output_dir provided)
    "prompt": "The prompt that was used",
    "size": "1024x1024",
    "quality": "standard",
    "style": "vivid"
}
```

On failure:
```python
{
    "success": False,
    "error": "Error message",
    "prompt": "The prompt that was used"
}
``` 