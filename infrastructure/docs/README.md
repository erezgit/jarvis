# Jarvis Voice Generation

This module provides tools for converting text to speech using OpenAI's text-to-speech API. It allows Jarvis to speak to you rather than just displaying text responses.

## Features

- Text-to-speech conversion using OpenAI's TTS models
- Multiple voice options
- Automatic summarization for long responses
- File watching capabilities for automatic conversion
- Audio playback functionality

## Components

1. **Core Generator** (`tools/src/core/voice_generation/generator.py`) - Base functionality for TTS conversion
2. **CLI Tool** (`tools/src/cli/generate_voice.py`) - Command-line tool for generating speech from text
3. **Response Processor** (`tools/src/cli/jarvis_speak.py`) - Tool to process and convert Jarvis responses
4. **Auto-Responder** (`tools/src/cli/auto_respond.py`) - Automatically watches for and converts new responses

## Usage Examples

### Basic Voice Generation

```bash
# Generate speech from a text string
python tools/src/cli/generate_voice.py "Hello, I am Jarvis, your AI assistant."

# Specify voice, model and format
python tools/src/cli/generate_voice.py "I can speak in different voices." --voice echo --model tts-1-hd --format mp3

# Save to a specific directory
python tools/src/cli/generate_voice.py "The audio will be saved in a custom location." --output-dir workspace/my_audio
```

### Processing Jarvis Responses

```bash
# Convert a file containing a Jarvis response to speech
python tools/src/cli/jarvis_speak.py --file path/to/response.txt

# Extract and speak only the summary section
python tools/src/cli/jarvis_speak.py --file path/to/response.txt --summary-only

# Pipe text directly to the tool
echo "This is a test message from Jarvis." | python tools/src/cli/jarvis_speak.py

# Customize voice and auto-play
python tools/src/cli/jarvis_speak.py --file path/to/response.txt --voice shimmer --auto-play
```

### Automatic Response Conversion

```bash
# Watch a specific file for changes
python tools/src/cli/auto_respond.py --watch-file path/to/response.txt

# Watch a directory for changes in .txt files
python tools/src/cli/auto_respond.py --watch-dir path/to/responses/

# Configure voice and playback options
python tools/src/cli/auto_respond.py --watch-dir path/to/responses/ --voice nova --summary-only --no-auto-play
```

## Voice Options

The following voices are available:

- `alloy` - Neutral and balanced
- `echo` - Deep and resonant 
- `fable` - Animated and lively
- `onyx` - Authoritative and clear
- `nova` - Warm and friendly (default)
- `shimmer` - Bright and energetic

## Integration with Cursor

To integrate with Cursor and have Jarvis responses automatically converted to speech:

1. Set up a file in your workspace that you'll use to save Jarvis responses
2. Run the auto-responder tool to watch this file:
   ```bash
   python tools/src/cli/auto_respond.py --watch-file path/to/response_file.txt
   ```
3. When you want to hear a Jarvis response, save it to this file and it will automatically be converted and played

You can also manually convert responses by copying them to a file or using the pipe method.

## Improving Response Quality

For optimal speech quality:

1. Use the `--summary-only` flag to extract only the most important information
2. Keep responses concise where possible
3. Use the `tts-1-hd` model for higher quality speech (with slower generation)
4. Adjust the speech speed with `--speed` (0.25 to 4.0, default is 1.0)
5. Try different voices to find one that works best for your environment 