#!/bin/bash
# Jarvis Setup Script
# This script helps prepare your environment for using Jarvis

echo "===== Jarvis Setup ====="
echo "Setting up your Jarvis environment..."

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not installed."
    echo "Please install Python 3 and try again."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp api_keys.template .env
    echo "Please edit the .env file and add your API keys."
else
    echo ".env file already exists."
fi

# Create jarvis_voice.sh from template
if [ ! -f "workspace/tools/jarvis_voice.sh" ]; then
    echo "Creating jarvis_voice.sh from template..."
    cp workspace/tools/jarvis_voice.template.sh workspace/tools/jarvis_voice.sh
    chmod +x workspace/tools/jarvis_voice.sh
else
    echo "jarvis_voice.sh already exists."
fi

# Set up Python virtual environment
echo "Setting up Python virtual environment..."
python3 -m venv venv
source venv/bin/activate

# Install required packages
echo "Installing required Python packages..."
pip install --upgrade pip
pip install openai requests tqdm python-dotenv

# Create necessary directories
echo "Creating necessary directories..."
mkdir -p workspace/generated_audio
mkdir -p workspace/generated_images

echo
echo "Setup complete! To activate Jarvis:"
echo "1. Edit the .env file and add your API keys"
echo "2. Run: source .env"
echo "3. Test with: ./workspace/tools/jarvis_voice.sh \"Hello, I am Jarvis\""
echo
echo "Thank you for setting up Jarvis!" 