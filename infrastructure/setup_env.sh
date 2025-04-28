#!/bin/bash
# Jarvis Environment Setup Script
# This script helps set up the necessary environment for Jarvis

# Colors for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Jarvis Environment Setup${NC}"
echo "This script will help you set up your environment for Jarvis"
echo ""

# Create config directory if it doesn't exist
mkdir -p infrastructure/config

# Check if .env file already exists
if [ -f "infrastructure/config/.env" ]; then
  echo -e "${YELLOW}A infrastructure/config/.env file already exists.${NC}"
  read -p "Do you want to overwrite it? (y/n): " overwrite
  if [[ $overwrite != "y" && $overwrite != "Y" ]]; then
    echo "Keeping existing .env file."
  else
    create_env=true
  fi
else
  create_env=true
fi

# Create or update .env file
if [ "$create_env" = true ]; then
  echo -e "${GREEN}Creating infrastructure/config/.env file...${NC}"
  
  # Get the OpenAI API key from the user
  read -p "Enter your OpenAI API key: " api_key
  
  # Create the .env file with the API key
  cat > infrastructure/config/.env << EOL
# Jarvis Environment Variables
# This file contains sensitive information and should never be committed to Git

# OpenAI API Key
OPENAI_API_KEY=[YOUR_API_KEY]

# Default voice settings
DEFAULT_VOICE=echo
DEFAULT_MODEL=tts-1
DEFAULT_FORMAT=mp3
DEFAULT_SPEED=1.0

# Output directories
OUTPUT_DIR=workspace/generated_audio
IMAGES_OUTPUT_DIR=workspace/generated_images

# Length settings
MAX_LENGTH=1000
EOL
  
  echo -e "${GREEN}Created infrastructure/config/.env file with your API key.${NC}"
fi

# Create .env.example file if it doesn't exist
if [ ! -f "infrastructure/infrastructure/config/.env.example" ]; then
  echo -e "${GREEN}Creating infrastructure/infrastructure/config/.env.example template file...${NC}"
  
  # Create the .env.example file
  cat > infrastructure/infrastructure/config/.env.example << EOL
# Jarvis Environment Variables - EXAMPLE FILE
# Copy this file to .env and update with your actual values
# This template file can be committed to Git as it doesn't contain sensitive information

# OpenAI API Key (replace with your own)
OPENAI_API_KEY=[YOUR_API_KEY]

# Default voice settings
DEFAULT_VOICE=echo
DEFAULT_MODEL=tts-1
DEFAULT_FORMAT=mp3
DEFAULT_SPEED=1.0

# Output directories
OUTPUT_DIR=workspace/generated_audio
IMAGES_OUTPUT_DIR=workspace/generated_images

# Length settings
MAX_LENGTH=1000
EOL
  
  echo -e "${GREEN}Created infrastructure/infrastructure/config/.env.example template file.${NC}"
fi

# Setup jarvis_voice.sh
echo -e "${GREEN}Setting up jarvis_voice.sh...${NC}"

if [ -f "workspace/tools/jarvis_voice.sh" ]; then
  mv workspace/tools/jarvis_voice.sh workspace/tools/jarvis_voice.sh.bak
  echo -e "${YELLOW}Backed up existing jarvis_voice.sh to jarvis_voice.sh.bak${NC}"
fi

# Create a new jarvis_voice.sh that uses environment variables
cat > workspace/tools/jarvis_voice.sh << EOL
#!/bin/bash
# Jarvis Voice Response System
# This script standardizes the process of generating voice responses from text

# Load environment variables from .env file if it exists
if [ -f "\$(dirname \$(dirname \$(dirname "\$0")))/infrastructure/config/.env" ]; then
  source "\$(dirname \$(dirname \$(dirname "\$0")))/infrastructure/config/.env"
fi

# Set variables from environment variables or defaults
VOICE="\${DEFAULT_VOICE:-echo}"
MODEL="\${DEFAULT_MODEL:-tts-1}"
FORMAT="\${DEFAULT_FORMAT:-mp3}"
SPEED="\${DEFAULT_SPEED:-1.0}"
OUTPUT_DIR="\${OUTPUT_DIR:-workspace/generated_audio}"
MAX_LENGTH="\${MAX_LENGTH:-1000}"

# Function to show usage information
show_usage() {
  echo "Usage: ./jarvis_voice.sh [options] \"Your text message here\""
  echo ""
  echo "Options:"
  echo "  --voice VALUE    Set voice (alloy, echo, fable, onyx, nova, shimmer). Default: \$VOICE"
  echo "  --model VALUE    Set model (tts-1, tts-1-hd). Default: \$MODEL"
  echo "  --format VALUE   Set format (mp3, opus, aac, flac, wav). Default: \$FORMAT"
  echo "  --speed VALUE    Set speed (0.25 to 4.0). Default: \$SPEED"
  echo "  --max-length N   Maximum text length before summarization. Default: \$MAX_LENGTH"
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

while [[ \$# -gt 0 ]]; do
  case \$1 in
    --voice)
      VOICE="\$2"
      shift 2
      ;;
    --model)
      MODEL="\$2"
      shift 2
      ;;
    --format)
      FORMAT="\$2"
      shift 2
      ;;
    --speed)
      SPEED="\$2"
      shift 2
      ;;
    --max-length)
      MAX_LENGTH="\$2"
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
      echo "Unknown option \$1"
      show_usage
      ;;
    *)
      POSITIONAL_ARGS+=("\$1")
      shift
      ;;
  esac
done

# Restore positional arguments
set -- "\${POSITIONAL_ARGS[@]}"

# Check if text is provided
if [ \$# -eq 0 ]; then
  echo "Error: No text provided for voice generation."
  show_usage
fi

# Build the command
CMD="python3 \$(dirname \$(dirname \$(dirname "\$0")))/infrastructure/src/cli/auto_jarvis_voice.py"

# Add text (joining all remaining arguments with spaces)
TEXT="\$*"
CMD="\$CMD \"\$TEXT\""

# Add options
CMD="\$CMD --voice \$VOICE"
CMD="\$CMD --model \$MODEL"
CMD="\$CMD --format \$FORMAT"
CMD="\$CMD --speed \$SPEED"
CMD="\$CMD --max-length \$MAX_LENGTH"
CMD="\$CMD --output-dir \$OUTPUT_DIR"

# Check if API key is set
if [ -z "\$OPENAI_API_KEY" ]; then
  echo "Error: OPENAI_API_KEY environment variable is not set."
  echo "Please run ./setup_env.sh to configure your environment."
  exit 1
fi

if [ "\$AUTO_PLAY" = "false" ]; then
  CMD="\$CMD --no-auto-play"
fi

# Run the command (using eval to handle quotes properly)
echo "Generating Jarvis voice response..."
eval \$CMD

exit 0
EOL

# Make the script executable
chmod +x workspace/tools/jarvis_voice.sh

echo -e "${GREEN}Created workspace/tools/jarvis_voice.sh that uses environment variables.${NC}"

# Update .gitignore
echo -e "${GREEN}Checking .gitignore...${NC}"

if ! grep -q "infrastructure/config/.env" .gitignore; then
  echo "infrastructure/config/.env" >> .gitignore
  echo -e "${GREEN}Added infrastructure/config/.env to .gitignore${NC}"
fi

echo -e "${GREEN}Environment setup complete!${NC}"
echo ""
echo -e "To test your setup, run: ${YELLOW}./workspace/tools/jarvis_voice.sh \"Hello, I'm Jarvis.\"${NC}"
echo ""
echo -e "${YELLOW}Important:${NC}"
echo "1. Never commit files with API keys directly in the code"
echo "2. The infrastructure/config/.env file is ignored by Git for security"
echo "3. New team members should run ./setup_env.sh to set up their environment"

# Make this script executable
chmod +x setup_env.sh 