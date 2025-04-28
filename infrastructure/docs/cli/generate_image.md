# CLI Image Generation Tool

The `generate_image.py` script provides a command-line interface for generating images using OpenAI's DALL-E model.

## Usage

```bash
# Basic usage
python tools/src/cli/generate_image.py "A beautiful mountain landscape with a lake"

# With additional options
python tools/src/cli/generate_image.py "A beautiful mountain landscape with a lake" \
  --size 1024x1024 \
  --quality standard \
  --style vivid \
  --output-dir workspace/generated_images \
  --prefix landscape \
  --format text
```

## Arguments

| Argument | Description | Default |
|----------|-------------|---------|
| prompt | Text description of the image to generate | (required) |
| --size | Image size, one of "256x256", "512x512", "1024x1024", "1792x1024", "1024x1792" | "1024x1024" |
| --quality | Image quality, one of "standard" or "hd" | "standard" |
| --style | Image style, one of "vivid" or "natural" | "vivid" |
| --output-dir | Directory to save the generated image | None |
| --api-key | OpenAI API key (defaults to OPENAI_API_KEY environment variable) | None |
| --prefix | Prefix for the output filename | "" |
| --format | Output format, either "json" or "text" | "json" |

## Output

### JSON Format (default)

```json
{
  "success": true,
  "image_url": "https://...",
  "saved_path": "/path/to/image.png",
  "prompt": "A beautiful mountain landscape with a lake",
  "size": "1024x1024",
  "quality": "standard",
  "style": "vivid"
}
```

### Text Format

On success:
```
Image generated successfully!
Prompt: A beautiful mountain landscape with a lake
Image URL: https://...
Image saved to: /path/to/image.png
```

On failure:
```
Error generating image: [error message]
Prompt: A beautiful mountain landscape with a lake
```

## Examples

### Generate an image and save it to a specific directory

```bash
python tools/src/cli/generate_image.py "A futuristic city with flying cars" --output-dir workspace/images
```

### Generate a high-quality image in natural style

```bash
python tools/src/cli/generate_image.py "A serene forest at dawn" --quality hd --style natural
```

### Generate an image with text output format

```bash
python tools/src/cli/generate_image.py "A cat playing with a ball of yarn" --format text
``` 