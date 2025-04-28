#!/usr/bin/env python3
"""
Test script to verify environment variables are being loaded correctly.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent
CONFIG_PATH = PROJECT_ROOT / "tools" / "config" / ".env"

print(f"Looking for .env file at: {CONFIG_PATH}")
print(f"File exists: {CONFIG_PATH.exists()}")

# Try to load the .env file
load_dotenv(dotenv_path=CONFIG_PATH)

# Check if the API key was loaded
api_key = os.getenv("OPENAI_API_KEY")
if api_key:
    print(f"API key loaded successfully: {api_key[:5]}...{api_key[-5:]}")
else:
    print("Failed to load API key") 