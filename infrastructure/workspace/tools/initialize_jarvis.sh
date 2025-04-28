#!/bin/bash
# Jarvis Initialization Script
# This script handles the initialization of Jarvis, including environment verification
# and voice setup.

# Set default voice
VOICE="echo"
LAUNCH_APP=true

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --voice)
      VOICE="$2"
      shift 2
      ;;
    --verify-only)
      VERIFY_ONLY=true
      shift
      ;;
    --no-app)
      LAUNCH_APP=false
      shift
      ;;
    --help)
      echo "Usage: ./initialize_jarvis.sh [options]"
      echo ""
      echo "Options:"
      echo "  --voice VALUE    Set voice (alloy, echo, fable, onyx, nova, shimmer). Default: echo"
      echo "  --verify-only    Only verify the environment without initializing"
      echo "  --no-app         Don't launch the Jarvis web app"
      echo "  --help           Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help to see available options"
      exit 1
      ;;
  esac
done

# Get project root directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"

# Print banner
echo ""
echo "=========================================================="
echo "                JARVIS INITIALIZATION                     "
echo "=========================================================="
echo ""

# Verify environment
echo "🔍 Verifying Jarvis environment..."
python3 "$PROJECT_ROOT/tools/src/cli/verify_environment.py"
VERIFY_RESULT=$?

if [ $VERIFY_RESULT -ne 0 ]; then
  echo "❌ Environment verification failed. Please fix the issues and try again."
  exit 1
fi

# Stop if only verification was requested
if [ "$VERIFY_ONLY" = true ]; then
  exit 0
fi

# Launch web app if enabled
if [ "$LAUNCH_APP" = true ]; then
  echo ""
  echo "🚀 Launching Jarvis web app on port 3000..."
  "$SCRIPT_DIR/run_jarvis_app.sh" &
  echo ""
fi

# Set up voice
echo ""
echo "🔊 Setting up voice with $VOICE..."
"$SCRIPT_DIR/jarvis_voice.sh" --voice "$VOICE" "Jarvis initialized successfully with $VOICE voice. I am ready to assist you with your development workflow. How can I help you today?"

echo ""
echo "✅ Jarvis initialization complete!"
echo "   - Voice: $VOICE"
if [ "$LAUNCH_APP" = true ]; then
  echo "   - Web app: http://localhost:3000"
fi
echo "   - All systems operational"
echo ""
echo "You can now interact with Jarvis through normal queries or"
echo "by using any of the special commands documented in:"
echo "$PROJECT_ROOT/instructions/jarvis.md"
echo ""

exit 0 