# Jarvis: DALL-E Image Generator Tool

## Overview
This tool enables Jarvis to generate images using OpenAI's DALL-E model and automatically save them to the project directory.

## Capabilities
- Generate images based on text prompts
- Control image size, quality, and style
- Save images with consistent naming to designated folders
- Securely handle API credentials

## Tool Location
- Script: `/generate_image.py`
- Output: `/generated_images/`
- Configuration: `.env` (from template `sample.env`)

## Usage Pattern

```
python generate_image.py "your prompt here" [options]
```

### Options
- `--size`: Image size (256x256, 512x512, 1024x1024, 1792x1024, 1024x1792)
- `--output`: Output directory for saving images
- `--n`: Number of images to generate (1-10)
- `--quality`: Image quality (standard, hd)
- `--style`: Image style (vivid, natural)

## Workflow Integration

### Input Sources
- Direct human prompts
- Content briefs from marketing plans
- Product descriptions
- Social media campaign themes

### Output Usage
- Marketing materials
- Product visualizations
- Website content
- Social media posts

## Extension Points
- Image post-processing (add text, filters, etc.)
- Batch generation for multiple variations
- Integration with social posting tools
- Size/format adaptation for different platforms

## Security Considerations
- API key stored in `.env` file (not in version control)
- Uses environment variables for sensitive data
- Follows OpenAI usage policies

## Implementation Details
- Implemented in Python
- Uses OpenAI's official Python client
- Handles errors gracefully
- Includes proper logging

## Examples

### Basic Usage
```bash
python generate_image.py "a futuristic business dashboard with glowing blue elements"
```

### Advanced Usage
```bash
python generate_image.py "a happy French bulldog smiling in a sunny park" --size 1024x1024 --quality hd --style natural --output ./assets/marketing/images
``` 