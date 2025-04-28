# Jarvis Voice Feature Setup Guide

This guide explains how to implement an auto-playing voice feature similar to Jarvis in another project.

## Prerequisites

- Python 3.8+ installed
- OpenAI API key with access to TTS models
- macOS, Windows, or Linux

## Installation Steps

1. **Set up Python Environment**

   ```bash
   # Create a virtual environment
   python3 -m venv venv
   
   # Activate it
   # On macOS/Linux:
   source venv/bin/activate
   # On Windows:
   venv\Scripts\activate
   
   # Install required packages
   pip install openai python-dotenv requests
   ```

2. **Create Configuration Directory**

   ```bash
   mkdir -p config
   ```

3. **Create Environment File**

   Create a file at `config/.env` with the following content:

   ```
   OPENAI_API_KEY=[YOUR_API_KEY]
   ```

   Replace `[YOUR_API_KEY]` with your actual OpenAI API key.

4. **Create Core Generator Module**

   Create a file at `src/voice_generation/generator.py`:

   ```python
   #!/usr/bin/env python3
   """
   Core voice generation functionality using OpenAI text-to-speech models.
   """
   import os
   import sys
   from pathlib import Path
   from datetime import datetime
   from typing import Dict, Any, Optional, Literal
   import openai
   import traceback
   from dotenv import load_dotenv
   
   # Define type aliases for better documentation and type checking
   VoiceType = Literal["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
   AudioFormat = Literal["mp3", "opus", "aac", "flac", "wav"]
   
   def generate_voice(
       text: str,
       voice: VoiceType = "nova",
       model: str = "tts-1",
       output_dir: Optional[str] = None,
       api_key: Optional[str] = None,
       response_format: AudioFormat = "mp3",
       speed: float = 1.0,
       filename_prefix: str = "",
   ) -> Dict[str, Any]:
       """
       Generate audio from text using OpenAI's text-to-speech model.
       
       Args:
           text: The text to convert to speech
           voice: Voice to use (alloy, echo, fable, onyx, nova, shimmer)
           model: TTS model to use (tts-1, tts-1-hd)
           output_dir: Directory to save the generated audio
           api_key: OpenAI API key (falls back to environment variable)
           response_format: Audio format (mp3, opus, aac, flac, wav)
           speed: Speed of the generated audio (0.25 to 4.0)
           filename_prefix: Optional prefix for the output filename
           
       Returns:
           Dictionary containing status and file path
       """
       try:
           # Load environment variables if not done already
           load_dotenv()
           
           # Set up OpenAI API key - IMPORTANT: strip any whitespace
           api_key = api_key or os.getenv("OPENAI_API_KEY")
           if api_key:
               api_key = api_key.strip()
           
           if not api_key:
               return {
                   "success": False,
                   "error": "OpenAI API key not found. Please provide it as a parameter or set OPENAI_API_KEY environment variable.",
                   "text": text[:100] + "..." if len(text) > 100 else text
               }
           
           client = openai.OpenAI(api_key=api_key)
           
           # Validate parameters
           valid_voices = ["alloy", "echo", "fable", "onyx", "nova", "shimmer"]
           valid_models = ["tts-1", "tts-1-hd"]
           valid_formats = ["mp3", "opus", "aac", "flac", "wav"]
           
           if voice not in valid_voices:
               raise ValueError(f"Invalid voice: {voice}. Must be one of {valid_voices}")
           
           if model not in valid_models:
               raise ValueError(f"Invalid model: {model}. Must be one of {valid_models}")
               
           if response_format not in valid_formats:
               raise ValueError(f"Invalid format: {response_format}. Must be one of {valid_formats}")
               
           if speed < 0.25 or speed > 4.0:
               raise ValueError(f"Invalid speed: {speed}. Must be between 0.25 and 4.0")
           
           # Generate the audio
           response = client.audio.speech.create(
               model=model,
               voice=voice,
               input=text,
               response_format=response_format,
               speed=speed
           )
           
           # Save the audio locally if output_dir is specified
           saved_path = None
           if output_dir:
               # Create output directory if it doesn't exist
               output_path = Path(output_dir)
               output_path.mkdir(parents=True, exist_ok=True)
               
               # Generate a filename based on the timestamp and a simplified text
               timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
               simplified_text = "".join(c for c in text[:30] if c.isalnum() or c.isspace()).strip().replace(" ", "_")
               
               # Use prefix if provided
               if filename_prefix:
                   filename = f"{filename_prefix}_{timestamp}_{simplified_text}.{response_format}"
               else:
                   filename = f"{timestamp}_{simplified_text}.{response_format}"
                   
               filepath = output_path / filename
               
               # Save the audio
               with open(filepath, "wb") as f:
                   f.write(response.read())
               saved_path = str(filepath)
               
           return {
               "success": True,
               "saved_path": saved_path,
               "text": text[:100] + "..." if len(text) > 100 else text,
               "voice": voice,
               "model": model,
               "format": response_format,
               "speed": speed
           }
           
       except Exception as e:
           error_details = f"{str(e)}\n{traceback.format_exc()}"
           print(f"Error in generate_voice: {error_details}")
           return {
               "success": False,
               "error": str(e),
               "error_details": error_details,
               "text": text[:100] + "..." if len(text) > 100 else text
           }
   ```

5. **Create Module Init File**

   Create a file at `src/voice_generation/__init__.py`:

   ```python
   """
   Voice generation module for converting text to speech.
   """
   
   from .generator import generate_voice, VoiceType, AudioFormat
   
   __all__ = ["generate_voice", "VoiceType", "AudioFormat"]
   ```

6. **Create Auto Voice Tool**

   Create a file at `src/cli/auto_voice.py`:

   ```python
   #!/usr/bin/env python3
   """
   Auto-voice tool that processes responses and converts them to speech.
   """
   import os
   import sys
   import argparse
   import subprocess
   from pathlib import Path
   import re
   from typing import Optional
   
   # Add the project root to sys.path to enable imports
   PROJECT_ROOT = Path(__file__).parent.parent.parent
   sys.path.insert(0, str(PROJECT_ROOT))
   
   from src.voice_generation.generator import generate_voice
   
   def extract_summary(text: str) -> Optional[str]:
       """Extract summary section from text."""
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
       """Create a conversational summary of the response."""
       # First try to find an explicit summary section
       summary = extract_summary(text)
       
       # If no summary found and text is long, create a simple one
       if not summary and len(text) > max_length:
           first_para = text.split('\n\n')[0].strip()
           length = len(text.split())
           
           if len(first_para) < 200:
               summary = f"{first_para} I've written a detailed response with about {length} words covering the key points."
           else:
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
       
       CRITICAL: This function is key to auto-playing audio on different platforms
       """
       if sys.platform == "darwin":  # macOS
           subprocess.run(["afplay", audio_path])
       elif sys.platform == "linux":
           subprocess.run(["xdg-open", audio_path])
       elif sys.platform == "win32":
           # On Windows, use the built-in os.startfile
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
       """Process a response and convert to speech."""
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
           filename_prefix=f"response"
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
       """Main entry point for the auto voice tool."""
       parser = argparse.ArgumentParser(description="Automatically convert responses to speech")
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
                           default="generated_audio")
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
   ```

7. **Make Scripts Executable**

   ```bash
   chmod +x src/cli/auto_voice.py
   ```

## Common Setup Issues and Solutions

### Auto-Playing Not Working

1. **Platform-Specific Playback Issues**:
   - **macOS**: Uses `afplay` command which is built-in
   - **Linux**: Uses `xdg-open` which may need to be installed
   - **Windows**: Uses `os.startfile()` which is built-in to Python

   On Linux, you may need to install additional tools:
   ```bash
   sudo apt-get install xdg-utils
   ```

2. **Whitespace in API Key**:
   Ensure your API key is stripped of all whitespace:
   ```python
   api_key = api_key.strip()
   ```

3. **File Permissions**:
   Ensure your output directory is writable:
   ```bash
   mkdir -p generated_audio
   chmod 755 generated_audio
   ```

### Integration in Other Projects

To integrate this into an existing project:

1. **Copy the Core Files**:
   - `src/voice_generation/generator.py`
   - `src/voice_generation/__init__.py`
   - `src/cli/auto_voice.py`

2. **Update Import Paths**:
   Adjust the import paths in `auto_voice.py` to match your project structure:
   ```python
   # Change this line:
   from src.voice_generation.generator import generate_voice
   
   # To match your structure, e.g.:
   from myproject.voice_generation.generator import generate_voice
   ```

3. **Call from Your Code**:
   ```python
   # Example integration
   from src.cli.auto_voice import process_response
   
   def my_function():
       response = "This is my response text"
       process_response(
           text=response,
           output_dir="generated_audio",
           voice="nova",
           model="tts-1",
           response_format="mp3",
           speed=1.0,
           auto_play=True,
           max_length=1000,
           api_key=None  # Will use environment variable
       )
   ```

## Testing the Setup

To test if everything is working:

```bash
# Activate your environment
source venv/bin/activate

# Test basic functionality
python src/cli/auto_voice.py "This is a test of the auto-playing voice system"

# Test piping text
echo "This is a piped test" | python src/cli/auto_voice.py
```

## Troubleshooting

If you encounter errors:

1. Check that your OpenAI API key is valid and has access to TTS models
2. Make sure there are no trailing whitespaces in your API key
3. Verify that the required playback utilities are available on your system
4. Ensure all required packages are installed: `openai`, `python-dotenv`, `requests`
5. Check console output for detailed error messages

## Key Differences from File-Based Approach

The reason this approach auto-plays (instead of just creating files you need to click):

1. It directly calls platform-specific playback commands rather than relying on file associations
2. It uses a synchronous playback method that waits for the audio to complete
3. It handles the audio file stream correctly without any encoding/decoding issues
4. It handles API key whitespace issues that might cause connection errors

By following this guide, you should be able to implement the same auto-playing voice capability in any Python project. 