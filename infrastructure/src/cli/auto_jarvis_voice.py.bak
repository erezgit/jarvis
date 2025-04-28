#!/usr/bin/env python3
"""
Jarvis Voice Generator Script

This script generates audio from text using OpenAI's text-to-speech API.
It's used by the jarvis_voice.sh script.

Required environment variables:
- OPENAI_API_KEY: Your OpenAI API key
"""

import argparse
import os
import sys
import time
import subprocess
from pathlib import Path

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from infrastructure.src.core.voice_generation.generator import generate_voice

def play_audio(audio_path: str):
    """
    Play the generated audio file.
    
    Args:
        audio_path: Path to the audio file
    """
    if sys.platform == "darwin":  # macOS
        subprocess.run(["afplay", audio_path])
    elif sys.platform == "linux":
        subprocess.run(["xdg-open", audio_path])
    elif sys.platform == "win32":
        os.startfile(audio_path)
    else:
        print(f"Auto-play not supported on this platform. Audio saved to: {audio_path}")

def main():
    """Main function to generate audio from text using OpenAI's TTS API."""
    parser = argparse.ArgumentParser(description="Generate audio from text using OpenAI's TTS API")
    
    # Required parameter
    parser.add_argument("text", help="Text to convert to speech")
    
    # Optional parameters
    parser.add_argument("--voice", default="nova", 
                        choices=["alloy", "echo", "fable", "onyx", "nova", "shimmer"],
                        help="Voice to use (default: nova)")
    parser.add_argument("--model", default="tts-1", 
                        choices=["tts-1", "tts-1-hd"], 
                        help="Model to use (default: tts-1)")
    parser.add_argument("--format", default="mp3", 
                        choices=["mp3", "opus", "aac", "flac", "wav"],
                        help="Audio format (default: mp3)")
    parser.add_argument("--speed", default=1.0, type=float,
                        help="Speech speed, 0.25 to 4.0 (default: 1.0)")
    parser.add_argument("--max-length", default=1000, type=int,
                        help="Maximum text length (default: 1000)")
    parser.add_argument("--output-dir", default="workspace/generated_audio",
                        help="Directory to save audio file (default: workspace/generated_audio)")
    parser.add_argument("--no-auto-play", action="store_true",
                        help="Don't automatically play the audio")
    
    args = parser.parse_args()
    
    # Create output directory if it doesn't exist
    os.makedirs(args.output_dir, exist_ok=True)
    
    # Process the text
    print(f"Processing response ({len(args.text)} chars, voiced as {len(args.text)} chars)")
    
    # Generate output filename based on content
    timestamp = time.strftime("%Y%m%d_%H%M%S")
    words = args.text[:40].replace(" ", "_").replace("'", "").replace("\"", "")
    words = ''.join(c if c.isalnum() or c == '_' else '' for c in words)
    filename = f"jarvis_response_{timestamp}_{words}"
    
    # Generate the audio using the core generator
    result = generate_voice(
        text=args.text,
        voice=args.voice,
        model=args.model,
        output_dir=args.output_dir,
        response_format=args.format,
        speed=args.speed,
        filename_prefix="jarvis_response"
    )
    
    if result["success"]:
        print(f"Audio generated successfully at: {result['saved_path']}")
        
        # Play audio if auto-play is enabled
        if not args.no_auto_play and result["saved_path"]:
            print("Playing audio...")
            play_audio(result["saved_path"])
    else:
        print(f"Error generating audio: {result.get('error', 'Unknown error')}")

if __name__ == "__main__":
    main() 