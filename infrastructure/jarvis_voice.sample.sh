#!/bin/bash
# Jarvis Voice Response System
# This script standardizes the process of generating voice responses from text

# Set variables from environment variables
# You need to set OPENAI_API_KEY in your environment
VOICE="nova"
MODEL="tts-1"
FORMAT="mp3"
SPEED="1.0"
OUTPUT_DIR="Jarvis/workspace/generated_audio"
MAX_LENGTH="1000"

# Function to show usage information
show_usage() {
  echo "Usage: ./jarvis_voice.sh [options] \"Your text message here\""
  echo ""
  echo "Options:"
  echo "  --voice VALUE    Set voice (alloy, echo, fable, onyx, nova, shimmer). Default: nova"
  echo "  --model VALUE    Set model (tts-1, tts-1-hd). Default: tts-1"
  echo "  --format VALUE   Set format (mp3, opus, aac, flac, wav). Default: mp3"
  echo "  --speed VALUE    Set speed (0.25 to 4.0). Default: 1.0"
  echo "  --max-length N   Maximum text length before summarization. Default: 1000"
  echo "  --no-auto-play   Don't play audio automatically"
  echo "  --help           Show this help message"
  echo ""
  echo "Examples:"
  echo "  ./jarvis_voice.sh \"Hello, I'm Jarvis.\""
  echo "  ./jarvis_voice.sh --voice echo \"This is in a different voice.\""
  exit 1
}

# Parse command line arguments
POSITIONAL_ARGS=()
AUTO_PLAY="true"

while [[ $# -gt 0 ]]; do
  case $1 in
    --voice)
      VOICE="$2"
      shift 2
      ;;
    --model)
      MODEL="$2"
      shift 2
      ;;
    --format)
      FORMAT="$2"
      shift 2
      ;;
    --speed)
      SPEED="$2"
      shift 2
      ;;
    --max-length)
      MAX_LENGTH="$2"
      shift 2
      ;;
    --no-auto-play)
      AUTO_PLAY="false"
      shift
      ;;
    --help)
      show_usage
      ;;
    -*|--*)
      echo "Unknown option $1"
      show_usage
      ;;
    *)
      POSITIONAL_ARGS+=("$1")
      shift
      ;;
  esac
done

# Restore positional arguments
set -- "${POSITIONAL_ARGS[@]}"

# Check if text is provided
if [ $# -eq 0 ]; then
  echo "Error: No text provided for voice generation."
  show_usage
fi

# Build the command
CMD="python3 $(dirname $(dirname $(dirname "$0")))/infrastructure/src/cli/auto_jarvis_voice.py"

# Add text (joining all remaining arguments with spaces)
TEXT="$*"
CMD="$CMD \"$TEXT\""

# Add options
CMD="$CMD --voice $VOICE"
CMD="$CMD --model $MODEL"
CMD="$CMD --format $FORMAT"
CMD="$CMD --speed $SPEED"
CMD="$CMD --max-length $MAX_LENGTH"
CMD="$CMD --output-dir $OUTPUT_DIR"

# Use environment variable instead of hardcoded API key
if [ -z "$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY environment variable is not set."
  echo "Please set it with: export OPENAI_API_KEY='your-api-key'"
  exit 1
fi

if [ "$AUTO_PLAY" = "false" ]; then
  CMD="$CMD --no-auto-play"
fi

# Run the command (using eval to handle quotes properly)
echo "Generating Jarvis voice response..."
eval $CMD

exit 0 