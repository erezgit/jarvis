#!/usr/bin/env python3
"""
CLI tool for generating voice audio using OpenAI TTS models.

This script provides a command-line interface to the core voice generation functionality.
"""
import os
import sys
import json
import argparse
from pathlib import Path

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.src.core.voice_generation.generator import generate_voice

def main():
    """
    Main entry point for the voice generation CLI tool.
    """
    parser = argparse.ArgumentParser(description="Generate speech audio from text using OpenAI's TTS model")
    parser.add_argument("text", help="Text to convert to speech")
    parser.add_argument("--voice", choices=["alloy", "echo", "fable", "onyx", "nova", "shimmer"], 
                        default="nova", help="Voice to use")
    parser.add_argument("--model", choices=["tts-1", "tts-1-hd"], default="tts-1", 
                        help="TTS model to use")
    parser.add_argument("--format", choices=["mp3", "opus", "aac", "flac", "wav"], 
                        default="mp3", dest="response_format", help="Audio format")
    parser.add_argument("--speed", type=float, default=1.0, 
                        help="Speed of speech (0.25 to 4.0)")
    parser.add_argument("--output-dir", help="Directory to save the generated audio",
                        default="workspace/generated_audio")
    parser.add_argument("--api-key", help="OpenAI API key (defaults to OPENAI_API_KEY environment variable)")
    parser.add_argument("--prefix", help="Prefix for the output filename", default="")
    parser.add_argument("--format-output", choices=["json", "text"], default="text", 
                        help="Output format (json or text)")
    
    args = parser.parse_args()
    
    # Create the output directory if it doesn't exist
    if args.output_dir:
        os.makedirs(args.output_dir, exist_ok=True)
    
    # Call the core function
    result = generate_voice(
        text=args.text,
        voice=args.voice,
        model=args.model,
        response_format=args.response_format,
        speed=args.speed,
        output_dir=args.output_dir,
        api_key=args.api_key,
        filename_prefix=args.prefix
    )
    
    # Format and output the result
    if args.format_output == "json":
        print(json.dumps(result, indent=2))
    else:
        # Text format
        if result["success"]:
            print(f"Audio generated successfully!")
            print(f"Text: {result['text']}")
            
            if result["saved_path"]:
                print(f"Audio saved to: {result['saved_path']}")
        else:
            print(f"Error generating audio: {result['error']}")
            print(f"Text: {result['text']}")

if __name__ == "__main__":
    main() 