#!/usr/bin/env python3
"""
Image generation tool that integrates with CrewAI.
"""
import os
import sys
from pathlib import Path
from typing import Optional, Dict, Any

# Add the parent directory to sys.path to enable imports from core
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

from crewai import Tool
from src.core.image_generation.generator import generate_image, ImageSize, ImageQuality, ImageStyle

class ImageGenerationTool(Tool):
    """
    A CrewAI tool for generating images using OpenAI's DALL-E model.
    """
    name: str = "Image Generation Tool"
    description: str = "Generate images based on text descriptions using DALL-E"
    
    def __init__(
        self,
        output_dir: str = "workspace/generated_images",
        api_key: Optional[str] = None,
    ):
        """
        Initialize the Image Generation Tool.
        
        Args:
            output_dir: Directory where the generated images will be saved.
            api_key: OpenAI API key. If None, it will use the OPENAI_API_KEY environment variable.
        """
        self.output_dir = Path(output_dir).expanduser().resolve()
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.api_key = api_key or os.environ.get("OPENAI_API_KEY")
        
        super().__init__(
            name=self.name,
            description=self.description,
            func=self._generate_image
        )

    def _generate_image(
        self,
        prompt: str,
        size: ImageSize = "1024x1024",
        quality: ImageQuality = "standard",
        style: ImageStyle = "vivid",
        filename_prefix: str = "image",
    ) -> Dict[str, Any]:
        """
        Generate an image based on the provided text prompt.
        
        Args:
            prompt: The text description to generate an image from.
            size: Size of the generated image (1024x1024, 1024x1792, or 1792x1024).
            quality: Quality of the generated image (standard or hd).
            style: Style of the generated image (vivid or natural).
            filename_prefix: Prefix for the output filename.
            
        Returns:
            A dictionary containing the path to the generated image and status information.
        """
        result = generate_image(
            prompt=prompt,
            size=size,
            quality=quality,
            style=style,
            output_dir=str(self.output_dir),
            api_key=self.api_key,
            filename_prefix=filename_prefix,
        )
        
        if result["success"]:
            return {
                "status": "success",
                "message": f"Image generated successfully and saved to {result['saved_path']}",
                "image_path": result["saved_path"],
                "image_url": result["image_url"],
                "prompt": prompt
            }
        else:
            return {
                "status": "failure",
                "message": f"Failed to generate image: {result['error']}",
                "prompt": prompt
            } 