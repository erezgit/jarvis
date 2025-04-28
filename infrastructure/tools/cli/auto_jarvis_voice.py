#!/usr/bin/env python3
"""
Auto-voice tool for Jarvis that processes responses and converts them to speech.

This script can be used to automatically voice all Jarvis responses.
"""
import os
import sys
import time
import argparse
import tempfile
import subprocess
from pathlib import Path
import re
from typing import Optional

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

<<<<<<< HEAD
from tools.src.core.voice_generation.generator import generate_voice
=======
from infrastructure.tools.src.core.voice_generation.generator import generate_voice
>>>>>>> d134973a2aae995af8886803452e0e7fb2d5385d

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

def create_conversational_summary(text: str, max_length: int = 500) -> str:
    """
    Create a conversational summary of the response.
    
    If the text has a summary section, use that. Otherwise, create a simple
    summary based on the content.
    
    Args:
        text: The text to summarize
        max_length: Maximum length for the summary
        
    Returns:
        A conversational summary
    """
    # First try to find an explicit summary section
    summary = extract_summary(text)
    
    # If no summary found and text is long, create a simple one
    if not summary and len(text) > max_length:
        # For very long texts, summarize based on first paragraph and length
        first_para = text.split('\n\n')[0].strip()
        length = len(text.split())
        
        if len(first_para) < 200:
            # Use first paragraph as intro to summary
            summary = f"{first_para} I've written a detailed response with about {length} words covering the key points."
        else:
            # Create generic summary
            summary = f"I've written a detailed response with about {length} words analyzing this topic thoroughly."
    
    # If we have a summary, return it (truncated if needed)
    if summary:
        if len(summary) > max_length:
            return summary[:max_length] + "..."
        return summary
        
    # If text is short enough, just return it directly
    if len(text) <= max_length:
        return text
        
    # Otherwise, truncate the text
    return text[:max_length] + "..."

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

def process_response(
    text: str, 
    output_dir: str, 
    voice: str, 
    model: str, 
    response_format: str, 
    speed: float,
    auto_play: bool,
    max_length: int,
    api_key: Optional[str] = None
) -> str:
    """
    Process a response and convert to speech.
    
    Args:
        text: Text response to process
        output_dir: Directory to save audio
        voice: Voice to use
        model: TTS model to use
        response_format: Audio format
        speed: Speech speed
        auto_play: Whether to auto-play the audio
        max_length: Max length for summarization
        api_key: OpenAI API key
        
    Returns:
        Path to the generated audio file or error message
    """
    # Clean API key (remove whitespace)
    if api_key:
        api_key = api_key.strip()
    
    # Create conversational summary if needed
    conversational_text = create_conversational_summary(text, max_length)
    print(f"Processing response ({len(text)} chars, voiced as {len(conversational_text)} chars)")
    
    # Generate the audio
    result = generate_voice(
        text=conversational_text,
        voice=voice,
        model=model,
        response_format=response_format,
        speed=speed,
        output_dir=output_dir,
        api_key=api_key,
        filename_prefix=f"jarvis_response"
    )
    
    if result["success"]:
        print(f"Audio generated successfully at: {result['saved_path']}")
        
        # Play the audio if requested
        if auto_play and result["saved_path"]:
            print("Playing audio...")
            play_audio(result["saved_path"])
            
        return result["saved_path"]
    else:
        print(f"Error generating audio: {result.get('error', 'Unknown error')}")
        return ""

def main():
    """
    Main entry point for the auto Jarvis voice tool.
    """
    parser = argparse.ArgumentParser(description="Automatically convert Jarvis responses to speech")
    parser.add_argument("text", nargs="?", help="Text to convert to speech (alternatively use stdin)")
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
    parser.add_argument("--no-auto-play", action="store_true", 
                        help="Don't automatically play audio after generation")
    parser.add_argument("--max-length", type=int, default=1000,
                        help="Maximum text length before summarization")
    
    args = parser.parse_args()
    
    # Get the text content
    text = args.text
    if not text:
        # If no text provided, try to read from stdin (pipe)
        if not sys.stdin.isatty():
            text = sys.stdin.read()
        else:
            parser.error("Either provide text as an argument or pipe text via stdin")
    
    # Process the response
    process_response(
        text=text,
        output_dir=args.output_dir,
        voice=args.voice,
        model=args.model,
        response_format=args.response_format,
        speed=args.speed,
        auto_play=not args.no_auto_play,
        max_length=args.max_length,
        api_key=args.api_key or os.environ.get("OPENAI_API_KEY")
    )

if __name__ == "__main__":
    main() 