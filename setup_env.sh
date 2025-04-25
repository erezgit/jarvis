#!/bin/bash
# Jarvis Environment Setup Script
# This script centralizes API key and environment configuration for Jarvis

echo "===== Jarvis Environment Setup ====="
echo "This script will set up your environment for Jarvis"
echo ""

# Check if running from project root
if [ ! -d "infrastructure" ] || [ ! -d "workspace" ] || [ ! -d "knowledge" ]; then
    echo "Error: This script must be run from the Jarvis project root directory."
    echo "Please cd to the root directory and try again."
    exit 1
fi

# Create infrastructure/config directory if it doesn't exist
mkdir -p infrastructure/config

# Create api_keys.template if it doesn't exist
if [ ! -f "infrastructure/config/api_keys.template" ]; then
    echo "Creating api_keys.template in infrastructure/config/..."
    cat > infrastructure/config/api_keys.template << 'EOL'
# Jarvis Central Configuration
# IMPORTANT: Copy this file to infrastructure/config/.env and update with your actual values
# The .env file is excluded from Git to keep your keys secure

# OpenAI API Keys
OPENAI_API_KEY=your_openai_api_key_here

# Voice Configuration
DEFAULT_VOICE=echo  # Options: alloy, echo, fable, onyx, nova, shimmer
DEFAULT_MODEL=tts-1  # Options: tts-1, tts-1-hd
OUTPUT_DIR=workspace/generated_audio

# Other API Keys
# Add any additional service API keys below
# GITHUB_TOKEN=your_github_token_here
# RUNWAY_API_KEY=your_runway_api_key_here
EOL
    echo "Created api_keys.template."
fi

# Create or update .env file in infrastructure/config
if [ ! -f "infrastructure/config/.env" ]; then
    echo "Creating new .env file in infrastructure/config/..."
    cp infrastructure/config/api_keys.template infrastructure/config/.env
    echo "Created .env file."
else
    echo ".env file already exists in infrastructure/config/."
fi

# Prompt user to edit the .env file
echo ""
echo "Please enter your OpenAI API key (press Enter to skip if already configured):"
read -r api_key

# Update .env file if API key was provided
if [ -n "$api_key" ]; then
    # Use sed to replace the API key line in the .env file
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS requires an empty string for -i
        sed -i '' "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|" infrastructure/config/.env
    else
        # Linux and other systems
        sed -i "s|OPENAI_API_KEY=.*|OPENAI_API_KEY=$api_key|" infrastructure/config/.env
    fi
    echo "API key updated in infrastructure/config/.env file."
fi

# Ensure jarvis_voice.sh exists and is up to date
if [ ! -f "workspace/tools/jarvis_voice.sh" ]; then
    echo "Creating jarvis_voice.sh..."
    cp workspace/tools/jarvis_voice.template.sh workspace/tools/jarvis_voice.sh
    chmod +x workspace/tools/jarvis_voice.sh
else
    echo "jarvis_voice.sh already exists."
fi

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p workspace/generated_audio
mkdir -p workspace/generated_images

# Explain the directory structure and path conventions
echo ""
echo "===== Jarvis Directory Structure ====="
echo "Jarvis maintains three main directories:"
echo ""
echo "1. infrastructure/ - Core system components"
echo "   - Contains API handling, voice generation, and system tools"
echo "   - Configuration stored in infrastructure/config/.env"
echo ""
echo "2. workspace/ - Working files and outputs"
echo "   - Contains generated audio/images and application code"
echo ""
echo "3. knowledge/ - Knowledge and memory systems"
echo "   - Contains semantic memory, episodic memory, and other knowledge"
echo ""
echo "===== Path Convention Notice ====="
echo "There are two path conventions used in Jarvis:"
echo ""
echo "1. Implementation paths (used in code)"
echo "   Example: workspace/generated_audio"
echo "   These are the direct filesystem paths."
echo ""
echo "2. User-facing paths (used in docs and instructions)"
echo "   Example: ./Jarvis/workspace/tools/jarvis_voice.sh"
echo "   These are used for consistency in user commands."
echo ""
echo "All implementation follows the three-directory structure,"
echo "keeping the codebase organized and maintainable."
echo ""

# Source the .env file to activate the environment variables
echo "Activating environment variables..."
source infrastructure/config/.env

# Verify the setup
echo ""
echo "===== Verification ====="

# Check if API key is set
if [ -z "$OPENAI_API_KEY" ]; then
    echo "⚠️ WARNING: OPENAI_API_KEY is not set. Voice generation will not work."
    echo "Please edit infrastructure/config/.env file and add your API key."
else
    echo "✅ OPENAI_API_KEY is set."
fi

# Check if output directories exist
if [ -d "workspace/generated_audio" ]; then
    echo "✅ Audio output directory exists."
else
    echo "❌ Audio output directory is missing."
fi

if [ -d "workspace/generated_images" ]; then
    echo "✅ Image output directory exists."
else
    echo "❌ Image output directory is missing."
fi

# Check if voice script exists
if [ -f "workspace/tools/jarvis_voice.sh" ]; then
    echo "✅ Voice script exists."
else
    echo "❌ Voice script is missing."
fi

# Remove root .env if it exists (now using infrastructure/config/.env)
if [ -f ".env" ]; then
    echo "Moving root .env to .env.old (using infrastructure/config/.env instead)"
    mv .env .env.old
fi

echo ""
echo "===== Setup Complete ====="
echo ""
echo "To use Jarvis voice, run:"
echo "  ./workspace/tools/jarvis_voice.sh \"Hello, I am Jarvis\""
echo ""
echo "To activate environment variables in the current shell:"
echo "  source infrastructure/config/.env"
echo "" 