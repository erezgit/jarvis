#!/usr/bin/env python3
"""
Environment verification script for Jarvis.

This script checks for all required components, API keys, and configurations
to ensure Jarvis is properly set up and ready to use.
"""
import os
import sys
import subprocess
import platform
from pathlib import Path
import json
from typing import Dict, List, Tuple, Any

# Add the project root to sys.path to enable imports
PROJECT_ROOT = Path(__file__).parent.parent.parent.parent
sys.path.insert(0, str(PROJECT_ROOT))

try:
    import openai
    from dotenv import load_dotenv
    REQUIRED_PACKAGES_INSTALLED = True
except ImportError:
    REQUIRED_PACKAGES_INSTALLED = False

class VerificationCheck:
    """
    Represents a verification check with a name, result, and optional details.
    """
    def __init__(self, name: str, success: bool, message: str, details: Any = None):
        self.name = name
        self.success = success
        self.message = message
        self.details = details

def check_project_structure() -> VerificationCheck:
    """
    Verify the Jarvis project structure exists and is properly organized.
    """
    required_dirs = [
        PROJECT_ROOT / "tools",
        PROJECT_ROOT / "tools" / "config",
        PROJECT_ROOT / "tools" / "src",
        PROJECT_ROOT / "tools" / "src" / "cli",
        PROJECT_ROOT / "tools" / "src" / "core",
        PROJECT_ROOT / "workspace",
        PROJECT_ROOT / "workspace" / "generated_audio",
        PROJECT_ROOT / "workspace" / "generated_images",
        PROJECT_ROOT / "instructions"
    ]
    
    missing_dirs = [str(d) for d in required_dirs if not d.exists() or not d.is_dir()]
    
    if missing_dirs:
        return VerificationCheck(
            "Project Structure", 
            False,
            f"Missing {len(missing_dirs)} required directories",
            missing_dirs
        )
    
    return VerificationCheck(
        "Project Structure",
        True,
        "All required directories are present"
    )

def check_openai_api_key() -> VerificationCheck:
    """
    Verify the OpenAI API key is set and valid.
    """
    # Check if .env file exists
    env_file = PROJECT_ROOT / "tools" / "config" / ".env"
    if not env_file.exists():
        return VerificationCheck(
            "OpenAI API Key",
            False,
            ".env file not found in tools/config/",
            {"path": str(env_file)}
        )
    
    # Load environment variables
    load_dotenv(dotenv_path=env_file)
    
    # Check if OPENAI_API_KEY is set
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        return VerificationCheck(
            "OpenAI API Key",
            False,
            "OPENAI_API_KEY not found in .env file",
            {"env_file": str(env_file)}
        )
    
    # Check if API key has the right format (basic check)
    if not api_key.startswith(("sk-", "proj-")):
        return VerificationCheck(
            "OpenAI API Key",
            False,
            "API key doesn't have the expected format",
            {"key_prefix": api_key[:5]}
        )
    
    # Try a simple API call to validate
    try:
        client = openai.OpenAI(api_key=api_key)
        # Get list of models or a simple API call to validate
        models = client.models.list()
        return VerificationCheck(
            "OpenAI API Key",
            True,
            "OpenAI API key is valid and working",
            {"key_prefix": f"{api_key[:5]}...{api_key[-4:]}"}
        )
    except Exception as e:
        return VerificationCheck(
            "OpenAI API Key",
            False,
            "OpenAI API key validation failed",
            {"error": str(e)}
        )

def check_voice_tools() -> VerificationCheck:
    """
    Verify the voice tools are available and executable.
    """
    required_files = [
        PROJECT_ROOT / "tools" / "src" / "core" / "voice_generation" / "generator.py",
        PROJECT_ROOT / "tools" / "src" / "cli" / "auto_jarvis_voice.py",
        PROJECT_ROOT / "tools" / "src" / "cli" / "jarvis_speak.py",
        PROJECT_ROOT / "tools" / "src" / "cli" / "generate_voice.py",
        PROJECT_ROOT / "workspace" / "tools" / "jarvis_voice.sh",
        PROJECT_ROOT / "workspace" / "tools" / "claude_voice_integration.py"
    ]
    
    missing_files = [str(f) for f in required_files if not f.exists()]
    
    if missing_files:
        return VerificationCheck(
            "Voice Tools",
            False,
            f"Missing {len(missing_files)} voice tool files",
            missing_files
        )
    
    # Check if shell scripts are executable
    shell_script = PROJECT_ROOT / "workspace" / "tools" / "jarvis_voice.sh"
    if not os.access(shell_script, os.X_OK):
        return VerificationCheck(
            "Voice Tools",
            False,
            "jarvis_voice.sh is not executable",
            {"path": str(shell_script)}
        )
    
    return VerificationCheck(
        "Voice Tools",
        True,
        "All voice tools are available and executable"
    )

def check_python_environment() -> VerificationCheck:
    """
    Verify the Python environment has all required packages.
    """
    required_packages = ["openai", "python-dotenv", "requests"]
    
    if not REQUIRED_PACKAGES_INSTALLED:
        return VerificationCheck(
            "Python Environment",
            False,
            "Required packages are missing",
            {"required": required_packages}
        )
    
    # Check Python version
    python_version = sys.version_info
    if python_version.major < 3 or (python_version.major == 3 and python_version.minor < 8):
        return VerificationCheck(
            "Python Environment",
            False,
            f"Python version {python_version.major}.{python_version.minor} is below required 3.8",
            {"current": f"{python_version.major}.{python_version.minor}", "required": "3.8+"}
        )
    
    return VerificationCheck(
        "Python Environment",
        True,
        f"Python {python_version.major}.{python_version.minor} with all required packages"
    )

def check_audio_playback() -> VerificationCheck:
    """
    Verify the system can play audio files.
    """
    system = platform.system()
    
    if system == "Darwin":  # macOS
        try:
            result = subprocess.run(["which", "afplay"], capture_output=True, text=True)
            if result.returncode == 0:
                return VerificationCheck(
                    "Audio Playback",
                    True,
                    "macOS audio playback (afplay) is available"
                )
            else:
                return VerificationCheck(
                    "Audio Playback",
                    False,
                    "macOS audio playback (afplay) not found",
                    {"system": system}
                )
        except Exception as e:
            return VerificationCheck(
                "Audio Playback",
                False,
                "Could not verify audio playback on macOS",
                {"error": str(e)}
            )
    elif system == "Linux":
        try:
            result = subprocess.run(["which", "xdg-open"], capture_output=True, text=True)
            if result.returncode == 0:
                return VerificationCheck(
                    "Audio Playback",
                    True,
                    "Linux audio playback (xdg-open) is available"
                )
            else:
                return VerificationCheck(
                    "Audio Playback",
                    False,
                    "Linux audio playback (xdg-open) not found",
                    {"system": system}
                )
        except Exception as e:
            return VerificationCheck(
                "Audio Playback",
                False,
                "Could not verify audio playback on Linux",
                {"error": str(e)}
            )
    elif system == "Windows":
        # Windows uses os.startfile which is built into Python
        return VerificationCheck(
            "Audio Playback",
            True,
            "Windows audio playback is available"
        )
    else:
        return VerificationCheck(
            "Audio Playback",
            False,
            f"Unsupported system: {system}",
            {"system": system}
        )

def run_all_checks() -> List[VerificationCheck]:
    """
    Run all verification checks.
    """
    checks = [
        check_project_structure(),
        check_python_environment(),
        check_openai_api_key(),
        check_voice_tools(),
        check_audio_playback()
    ]
    return checks

def format_check_result(check: VerificationCheck) -> str:
    """
    Format a verification check result for display.
    """
    status = "✅ PASS" if check.success else "❌ FAIL"
    result = f"{status} | {check.name}: {check.message}"
    
    if not check.success and check.details:
        if isinstance(check.details, list):
            details = "\n  - " + "\n  - ".join(check.details)
        elif isinstance(check.details, dict):
            details = "\n  - " + "\n  - ".join([f"{k}: {v}" for k, v in check.details.items()])
        else:
            details = f"\n  - {check.details}"
        result += details
    
    return result

def generate_summary(checks: List[VerificationCheck]) -> str:
    """
    Generate a summary of all verification checks.
    """
    total = len(checks)
    passed = sum(1 for check in checks if check.success)
    
    if passed == total:
        return f"✅ All {total} checks passed! Jarvis is properly configured and ready to use."
    else:
        return f"⚠️ {passed}/{total} checks passed. Please fix the issues to ensure Jarvis works correctly."

def main():
    """
    Main function to run all verification checks and display results.
    """
    print("\n🤖 JARVIS ENVIRONMENT VERIFICATION\n")
    print("Running checks to verify Jarvis is properly configured...\n")
    
    checks = run_all_checks()
    
    # Display results
    for check in checks:
        print(format_check_result(check))
    
    # Display summary
    print("\n" + generate_summary(checks) + "\n")
    
    # Return success status for script usage
    return all(check.success for check in checks)

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1) 