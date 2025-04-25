#!/usr/bin/env python3
"""
Claude Voice Integration

This script provides a way to integrate voice responses with Claude/Cursor.
It processes text input (either piped or direct) and sends it to the Jarvis
voice system.
"""
import os
import sys
import subprocess
import argparse
from pathlib import Path

def speak_text(text, voice="nova", model="tts-1", speed=1.0, auto_play=True):
    """
    Convert text to speech using the jarvis_voice.sh script
    
    Args:
        text: Text to convert to speech
        voice: Voice to use
        model: TTS model to use
        speed: Speech speed
        auto_play: Whether to auto-play the audio
    """
    # Get the script directory
    script_dir = Path(__file__).parent.absolute()
    voice_script = script_dir / "jarvis_voice.sh"
    
    # Build the command
    cmd = [str(voice_script)]
    
    # Add options
    cmd.extend(["--voice", voice])
    cmd.extend(["--model", model])
    cmd.extend(["--speed", str(speed)])
    
    if not auto_play:
        cmd.append("--no-auto-play")
    
    # Add the text
    cmd.append(text)
    
    # Execute the command
    try:
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error executing voice script: {e}")
        return False

def main():
    """
    Main function to process arguments and text
    """
    parser = argparse.ArgumentParser(description="Convert Claude/Cursor responses to voice")
    parser.add_argument("text", nargs="?", help="Text to convert to speech")
    parser.add_argument("--voice", choices=["alloy", "echo", "fable", "onyx", "nova", "shimmer"], 
                      default="nova", help="Voice to use")
    parser.add_argument("--model", choices=["tts-1", "tts-1-hd"], default="tts-1", 
                      help="TTS model to use")
    parser.add_argument("--speed", type=float, default=1.0, 
                      help="Speed of speech (0.25 to 4.0)")
    parser.add_argument("--no-auto-play", action="store_true", 
                      help="Don't automatically play audio after generation")
    
    args = parser.parse_args()
    
    # Get the text content
    text = args.text
    if not text:
        # If no text provided, try to read from stdin (pipe)
        if not sys.stdin.isatty():
            text = sys.stdin.read()
        else:
            parser.error("Either provide text as an argument or pipe text via stdin")
    
    # Speak the text
    speak_text(
        text=text,
        voice=args.voice,
        model=args.model,
        speed=args.speed,
        auto_play=not args.no_auto_play
    )

if __name__ == "__main__":
    main() 