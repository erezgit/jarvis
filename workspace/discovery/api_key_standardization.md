# API Key Standardization for Jarvis Tools

## Current Situation

We've identified inconsistencies in how different Jarvis tools access and use the OpenAI API key:

1. **Voice Generation**: Currently hardcodes the API key in `jarvis_voice.sh`:
   ```bash
   API_KEY="sk-your-api-key-goes-here"
   ```

2. **Image Generation**: Attempts to read from environment variables or config file:
   ```python
   # From generator.py
   api_key = api_key or os.getenv("OPENAI_API_KEY")
   if not api_key:
       return {
           "success": False,
           "error": "OpenAI API key not found. Please provide it as a parameter or set OPENAI_API_KEY environment variable.",
           "prompt": prompt
       }
   ```

3. **Config Location**: A `.env` file exists at `/Jarvis/tools/config/.env` but isn't consistently used by all tools.

## Issues with Current Approach

1. **Redundancy**: The API key is duplicated in multiple locations
2. **Maintenance Challenges**: Updates require changes in multiple files
3. **Environment Mismatches**: Different tools using different methods to access the key
4. **Security Concerns**: Hardcoded keys in scripts are less secure than environment variables

## Proposed Solution: Centralized API Key Management

### 1. Standardize Environment Variable

Establish `OPENAI_API_KEY` as the standard environment variable for all tools.

### 2. Centralize Configuration

Create a central configuration loader at `/Jarvis/tools/src/core/config.py`:

```python
#!/usr/bin/env python3
"""
Centralized configuration management for Jarvis tools.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Determine the project root
PROJECT_ROOT = Path(__file__).parent.parent.parent

def load_config():
    """
    Load environment variables and configuration settings.
    Returns a dictionary of configuration values.
    """
    # Try loading from .env file in config directory
    env_path = PROJECT_ROOT / "config" / ".env"
    load_dotenv(dotenv_path=env_path)
    
    # Get OpenAI API key with fallbacks
    openai_api_key = os.getenv("OPENAI_API_KEY")
    
    return {
        "openai_api_key": openai_api_key,
        # Add other configuration values as needed
    }

def get_openai_api_key():
    """
    Helper function to get the OpenAI API key.
    Returns the API key as a string.
    """
    config = load_config()
    return config["openai_api_key"]
```

### 3. Update Tools to Use Centralized Configuration

#### Update Image Generation Tool:

```python
# In generator.py
from core.config import get_openai_api_key

# Replace:
api_key = api_key or os.getenv("OPENAI_API_KEY")

# With:
api_key = api_key or get_openai_api_key()
```

#### Update Voice Generation Tool:

Modify `jarvis_voice.sh` to read the API key from environment:

```bash
# Replace hardcoded API_KEY with:
API_KEY=${OPENAI_API_KEY}

# And ensure it's passed to the Python script:
CMD="$CMD --api-key \"$API_KEY\""
```

### 4. Environment Setup Script

Create a setup script at `/Jarvis/tools/setup.sh`:

```bash
#!/bin/bash
# Setup script for Jarvis environment

# Create .env file if it doesn't exist
ENV_FILE="$(dirname "$0")/config/.env"
if [ ! -f "$ENV_FILE" ]; then
    echo "Creating new .env file..."
    cp "$(dirname "$0")/config/sample.env" "$ENV_FILE"
    echo "Please edit $ENV_FILE to add your OpenAI API key"
else
    echo ".env file already exists at $ENV_FILE"
fi

# Activate virtual environment
source "$(dirname "$0")/venv/bin/activate"

# Set environment variable for current session
export OPENAI_API_KEY=$(grep OPENAI_API_KEY "$ENV_FILE" | cut -d '=' -f2)
echo "Environment configured successfully."
```

## Implementation Plan

1. Create the centralized configuration module
2. Update image generation tool to use it
3. Modify voice generation script to read from environment 
4. Create the environment setup script
5. Update documentation to explain the standardized approach
6. Test all tools to ensure they work with the centralized configuration

## Benefits

- **Single Source of Truth**: One location for the API key
- **Consistency**: All tools will use the same access method
- **Security**: Key stored in environment or configuration file, not hardcoded
- **Maintainability**: Easier to update or rotate keys
- **Better Error Handling**: Consistent error messages when key is missing

## Additional Considerations

- Consider implementing a key rotation mechanism
- Add validation of API key format before using 
- Add more configuration options (model preferences, output directories, etc.)
- Implement secure storage for the API key (OS keychain integration)

---

By standardizing API key management across all Jarvis tools, we'll reduce errors, improve security, and make the system more maintainable. 