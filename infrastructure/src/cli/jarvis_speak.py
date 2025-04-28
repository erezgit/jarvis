#!/usr/bin/env python3
"""
Tool for converting Jarvis text responses to speech.

This script takes text input either from a file or direct input and converts it to speech.
It also includes functionality to automatically summarize longer texts to make them more
suitable for audio consumption.
"""
import os
import sys
import json
import argparse
from pathlib import Path
import re
import tempfile
import subprocess
from typing import Optional

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.src.core.voice_generation.generator import generate_voice

def summarize_text(text: str, max_length: int = 1000) -> str:
    """
    Summarize text if it exceeds the max_length.
    
    This is a placeholder function that simply truncates the text.
    In a future version, this could use an AI model to create a proper summary.
    
    Args:
        text: The text to summarize
        max_length: Maximum length for the text
        
    Returns:
        Summarized text
    """
    if len(text) <= max_length:
        return text
    
    # For now, simply truncate with a note
    return text[:max_length] + "... [Content truncated for brevity]"

def extract_summary(text: str) -> Optional[str]:
    """
    Attempt to extract a summary section from the text.
    
    Looks for sections labeled as summary, conclusion, or similar.
    
    Args:
        text: Text to extract summary from
        
    Returns:
        Extracted summary or None if not found
    """
    # Try to find summary section with various headers
    patterns = [
        r'(?i)## *summary.*?\n(.*?)(?:\n##|\Z)',
        r'(?i)### *summary.*?\n(.*?)(?:\n###|\Z)',
        r'(?i)## *conclusion.*?\n(.*?)(?:\n##|\Z)',
        r'(?i)### *conclusion.*?\n(.*?)(?:\n###|\Z)',
        r'(?i)summary:.*?\n(.*?)(?:\n\n|\Z)',
        r'(?i)in summary[,:]+(.*?)(?:\n\n|\Z)',
        r'(?i)to summarize[,:]+(.*?)(?:\n\n|\Z)'
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.DOTALL)
        if match:
            summary = match.group(1).strip()
            return summary
    
    return None

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
    """
    Main entry point for the Jarvis speech tool.
    """
    parser = argparse.ArgumentParser(description="Convert Jarvis text responses to speech")
    parser.add_argument("--file", help="File containing text to convert to speech")
    parser.add_argument("--text", help="Text to convert to speech")
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
    parser.add_argument("--output-file", help="Specific filename for the output file")
    parser.add_argument("--api-key", help="OpenAI API key (defaults to OPENAI_API_KEY environment variable)")
    parser.add_argument("--auto-play", action="store_true", 
                        help="Automatically play the audio after generation")
    parser.add_argument("--summary-only", action="store_true", 
                        help="Try to extract and convert only the summary section")
    parser.add_argument("--max-length", type=int, default=1000,
                        help="Maximum text length before summarization")
    
    args = parser.parse_args()
    
    # Get the text content
    text = None
    if args.file:
        with open(args.file, 'r') as f:
            text = f.read()
    elif args.text:
        text = args.text
    else:
        # If no file or text provided, try to read from stdin (pipe)
        if not sys.stdin.isatty():
            text = sys.stdin.read()
        else:
            parser.error("Either --file or --text must be provided, or pipe text via stdin")
    
    if not text:
        print("Error: No text content to process")
        sys.exit(1)
    
    # Process the text content
    if args.summary_only:
        summary = extract_summary(text)
        if summary:
            text = summary
            print(f"Using extracted summary ({len(text)} chars)")
        else:
            print("No summary section found, using full text")
    
    # Summarize if text is too long
    if len(text) > args.max_length:
        original_length = len(text)
        text = summarize_text(text, args.max_length)
        print(f"Text was summarized from {original_length} to {len(text)} characters")
    
    # Determine output file
    output_file = None
    if args.output_file:
        output_file = args.output_file
        output_dir = str(Path(output_file).parent)
    else:
        output_dir = args.output_dir
    
    # Generate the audio
    result = generate_voice(
        text=text,
        voice=args.voice,
        model=args.model,
        response_format=args.response_format,
        speed=args.speed,
        output_dir=output_dir,
        api_key=args.api_key,
        filename_prefix="jarvis"
    )
    
    if result["success"]:
        print(f"Audio generated successfully!")
        print(f"Audio saved to: {result['saved_path']}")
        
        # Play the audio if requested
        if args.auto_play and result["saved_path"]:
            print("Playing audio...")
            play_audio(result["saved_path"])
    else:
        print(f"Error generating audio: {result['error']}")

if __name__ == "__main__":
    main() 