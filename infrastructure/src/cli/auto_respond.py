#!/usr/bin/env python3
"""
Auto-response tool for automatically converting Jarvis text responses to speech.

This script sets up a simple file watcher to monitor a specific file or directory
for changes in Jarvis responses, then automatically converts new responses to speech.
"""
import os
import sys
import time
import argparse
import json
import tempfile
from pathlib import Path
import subprocess
from typing import Optional, Dict, Any
import re
import hashlib

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

from tools.src.core.voice_generation.generator import generate_voice

class ResponseWatcher:
    """Class to watch for and process Jarvis responses."""
    
    def __init__(
        self,
        watch_file: Optional[str] = None,
        watch_dir: Optional[str] = None,
        output_dir: str = "workspace/generated_audio",
        voice: str = "nova",
        model: str = "tts-1",
        response_format: str = "mp3",
        speed: float = 1.0,
        auto_play: bool = True,
        max_length: int = 1000,
        summary_only: bool = False,
        api_key: Optional[str] = None,
        polling_interval: float = 1.0
    ):
        """
        Initialize the response watcher.
        
        Args:
            watch_file: Specific file to watch for changes
            watch_dir: Directory to watch for new/modified files
            output_dir: Directory to save generated audio
            voice: Voice to use for speech
            model: TTS model to use
            response_format: Audio format
            speed: Speech speed
            auto_play: Whether to automatically play audio
            max_length: Maximum text length before summarization
            summary_only: Whether to only use summary sections
            api_key: OpenAI API key
            polling_interval: How often to check for changes (seconds)
        """
        if not watch_file and not watch_dir:
            raise ValueError("Either watch_file or watch_dir must be provided")
        
        self.watch_file = Path(watch_file) if watch_file else None
        self.watch_dir = Path(watch_dir) if watch_dir else None
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        self.voice = voice
        self.model = model
        self.response_format = response_format
        self.speed = speed
        self.auto_play = auto_play
        self.max_length = max_length
        self.summary_only = summary_only
        self.api_key = api_key
        self.polling_interval = polling_interval
        
        # Store file hashes to detect changes
        self.file_hashes = {}
        
        # Initialize file tracking
        if self.watch_file:
            if self.watch_file.exists():
                self.file_hashes[str(self.watch_file)] = self._get_file_hash(self.watch_file)
        elif self.watch_dir:
            for file_path in self._get_relevant_files():
                self.file_hashes[str(file_path)] = self._get_file_hash(file_path)
    
    def _get_relevant_files(self):
        """Get list of relevant files in the watch directory."""
        if not self.watch_dir or not self.watch_dir.exists():
            return []
        
        return [f for f in self.watch_dir.glob("*.txt") if f.is_file()]
    
    def _get_file_hash(self, file_path: Path) -> str:
        """Calculate hash of file contents to detect changes."""
        if not file_path.exists():
            return ""
        
        with open(file_path, "rb") as f:
            return hashlib.md5(f.read()).hexdigest()
    
    def _extract_summary(self, text: str) -> Optional[str]:
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
    
    def _summarize_text(self, text: str) -> str:
        """Summarize text if it's too long."""
        if len(text) <= self.max_length:
            return text
        
        # For now, just truncate
        return text[:self.max_length] + "... [Content truncated for brevity]"
    
    def _process_text(self, text: str) -> str:
        """Process text for conversion to speech."""
        if self.summary_only:
            summary = self._extract_summary(text)
            if summary:
                print(f"Using extracted summary ({len(summary)} chars)")
                text = summary
        
        if len(text) > self.max_length:
            original_length = len(text)
            text = self._summarize_text(text)
            print(f"Text was summarized from {original_length} to {len(text)} characters")
        
        return text
    
    def _generate_speech(self, text: str, source_file: str) -> Dict[str, Any]:
        """Generate speech from processed text."""
        print(f"Generating speech for: {source_file}")
        
        # Create a filename based on the source
        source_basename = Path(source_file).stem
        
        result = generate_voice(
            text=text,
            voice=self.voice,
            model=self.model,
            response_format=self.response_format,
            speed=self.speed,
            output_dir=str(self.output_dir),
            api_key=self.api_key,
            filename_prefix=f"jarvis_{source_basename}"
        )
        
        return result
    
    def _play_audio(self, audio_path: str):
        """Play the audio file."""
        if sys.platform == "darwin":  # macOS
            subprocess.run(["afplay", audio_path])
        elif sys.platform == "linux":
            subprocess.run(["xdg-open", audio_path])
        elif sys.platform == "win32":
            os.startfile(audio_path)
        else:
            print(f"Auto-play not supported on this platform. Audio saved to: {audio_path}")
    
    def _process_file(self, file_path: Path):
        """Process a file if it has changed."""
        current_hash = self._get_file_hash(file_path)
        old_hash = self.file_hashes.get(str(file_path), "")
        
        if current_hash != old_hash:
            print(f"Detected changes in: {file_path}")
            self.file_hashes[str(file_path)] = current_hash
            
            # Read the file
            with open(file_path, "r", encoding="utf-8") as f:
                text = f.read()
            
            # Process the text
            processed_text = self._process_text(text)
            
            # Generate speech
            result = self._generate_speech(processed_text, str(file_path))
            
            if result["success"]:
                print(f"Audio generated successfully: {result['saved_path']}")
                
                # Play the audio if requested
                if self.auto_play:
                    print("Playing audio...")
                    self._play_audio(result["saved_path"])
            else:
                print(f"Error generating audio: {result['error']}")
    
    def watch(self):
        """Start watching for changes."""
        print(f"Watching for Jarvis responses...")
        if self.watch_file:
            print(f"Watching file: {self.watch_file}")
        else:
            print(f"Watching directory: {self.watch_dir}")
        
        try:
            while True:
                if self.watch_file:
                    if self.watch_file.exists():
                        self._process_file(self.watch_file)
                else:
                    current_files = self._get_relevant_files()
                    for file_path in current_files:
                        self._process_file(file_path)
                
                time.sleep(self.polling_interval)
        except KeyboardInterrupt:
            print("\nStopping watcher")

def main():
    """Main entry point for the auto-response tool."""
    parser = argparse.ArgumentParser(description="Automatically convert Jarvis responses to speech")
    parser.add_argument("--watch-file", help="Specific file to watch for changes")
    parser.add_argument("--watch-dir", help="Directory to watch for new/modified files")
    parser.add_argument("--output-dir", help="Directory to save the generated audio",
                        default="workspace/generated_audio")
    parser.add_argument("--voice", choices=["alloy", "echo", "fable", "onyx", "nova", "shimmer"], 
                        default="nova", help="Voice to use")
    parser.add_argument("--model", choices=["tts-1", "tts-1-hd"], default="tts-1", 
                        help="TTS model to use")
    parser.add_argument("--format", choices=["mp3", "opus", "aac", "flac", "wav"], 
                        default="mp3", dest="response_format", help="Audio format")
    parser.add_argument("--speed", type=float, default=1.0, 
                        help="Speed of speech (0.25 to 4.0)")
    parser.add_argument("--api-key", help="OpenAI API key (defaults to OPENAI_API_KEY environment variable)")
    parser.add_argument("--polling-interval", type=float, default=1.0,
                        help="How often to check for changes (seconds)")
    parser.add_argument("--no-auto-play", action="store_true", 
                        help="Don't automatically play audio after generation")
    parser.add_argument("--summary-only", action="store_true", 
                        help="Try to extract and convert only the summary section")
    parser.add_argument("--max-length", type=int, default=1000,
                        help="Maximum text length before summarization")
    
    args = parser.parse_args()
    
    if not args.watch_file and not args.watch_dir:
        parser.error("Either --watch-file or --watch-dir must be provided")
    
    watcher = ResponseWatcher(
        watch_file=args.watch_file,
        watch_dir=args.watch_dir,
        output_dir=args.output_dir,
        voice=args.voice,
        model=args.model,
        response_format=args.response_format,
        speed=args.speed,
        auto_play=not args.no_auto_play,
        max_length=args.max_length,
        summary_only=args.summary_only,
        api_key=args.api_key,
        polling_interval=args.polling_interval
    )
    
    watcher.watch()

if __name__ == "__main__":
    main() 