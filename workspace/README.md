# Jarvis Workspace

This directory contains the active working environment for Jarvis, including tools, generated content, and the web application interface.

## Directory Structure

- **tools/**: Utility scripts and command-line tools
  - `jarvis_voice.sh`: Script for generating voice responses
  - `initialize_jarvis.sh`: Script for initializing Jarvis environment
  - Other utility scripts

- **design/**: Design documents and standards
  - Documentation standards
  - UI design guidelines
  - Design templates

- **generated_audio/**: Directory for storing generated audio responses
  - This directory is automatically created and populated when Jarvis generates voice responses
  - Files in this directory are excluded from Git by default

- **generated_images/**: Directory for storing generated images
  - This directory is automatically created and populated when using image generation features
  - Files in this directory are excluded from Git by default

- **jarvis-app/**: Web application interface for Jarvis
  - Next.js application for browser-based interaction with Jarvis
  - Memory browser and management interface
  - Voice interface and conversation history

## Usage

### Working with Tools

Most tools in the `tools/` directory are designed to be called from the command line:

```bash
# Generate voice response
./workspace/tools/jarvis_voice.sh "Hello, I'm Jarvis."

# Generate with custom voice
./workspace/tools/jarvis_voice.sh --voice echo "This is in a different voice."
```

### Running the Web Application

To start the Jarvis web application:

```bash
cd workspace/jarvis-app
npm install
npm run dev
```

The web application will be available at http://localhost:3000 