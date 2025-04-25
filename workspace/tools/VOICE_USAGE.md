# Jarvis Voice Integration Guide

This guide explains how to use the standardized voice response system for Jarvis.

## Quick Start

Use the `jarvis_voice.sh` script to generate voice responses:

```bash
./Jarvis/workspace/tools/jarvis_voice.sh "Hello, I'm Jarvis."
```

Or use the Python integration script:

```bash
python3 Jarvis/workspace/tools/claude_voice_integration.py "Hello from Claude with voice integration."
```

## Integration Methods

### 1. Direct Terminal Usage

The simplest way to use Jarvis voice:

```bash
./Jarvis/workspace/tools/jarvis_voice.sh "Your message here"
```

Options:
- `--voice VALUE` - Choose voice (alloy, echo, fable, onyx, nova, shimmer)
- `--model VALUE` - Choose model (tts-1, tts-1-hd)
- `--speed VALUE` - Set speech speed (0.25 to 4.0)
- `--no-auto-play` - Generate audio without playing it
- `--help` - Show all options

### 2. Python Integration

For integration with other Python scripts:

```bash
python3 Jarvis/workspace/tools/claude_voice_integration.py "Your message here"
```

The Python script also accepts piped input:

```bash
echo "This text will be spoken" | python3 Jarvis/workspace/tools/claude_voice_integration.py
```

### 3. Claude/Cursor Integration

To automatically voice all Claude/Cursor responses:

1. Copy your Claude/Cursor response
2. Execute: `python3 Jarvis/workspace/tools/claude_voice_integration.py "Pasted response here"`

## Voice Options

Available voices:
- `nova` (default) - Clear, balanced female voice
- `alloy` - Neutral, versatile voice
- `echo` - Deep, resonant male voice
- `fable` - Expressive, bright voice 
- `onyx` - Deep, authoritative male voice
- `shimmer` - Warm, welcoming female voice

## Troubleshooting

If you encounter issues:

1. **API Key Issues**: Check that the API key in the script is valid and has access to OpenAI's TTS models
2. **Path Issues**: Make sure you're running the scripts from the project root directory
3. **Python Environment**: The scripts use `python3` command - ensure it's available in your PATH

## Output Files

All generated audio files are saved to:
```
Jarvis/workspace/generated_audio/
```

The files follow this naming pattern:
```
jarvis_response_YYYYMMDD_HHMMSS_First_few_words_of_text.mp3
```

You can access these files later for playback if needed. 