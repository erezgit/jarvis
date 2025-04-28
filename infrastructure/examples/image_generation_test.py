#!/usr/bin/env python3
"""
Test script to demonstrate the usage of both the CLI and CrewAI integration
for the image generation tool.
"""
import os
import sys
import subprocess
from pathlib import Path
import json
from dotenv import load_dotenv

# Add parent directory to sys.path
sys.path.insert(0, str(Path(__file__).parent.parent))

# Load environment variables
load_dotenv()

# Directory to save generated images
OUTPUT_DIR = "workspace/generated_images/test"

# Test prompt
TEST_PROMPT = "A beautiful mountain landscape with a crystal clear lake at sunset"

def test_core_api():
    """Test the core image generation API directly."""
    print("\n=== Testing Core API ===")
    from src.core.image_generation.generator import generate_image
    
    result = generate_image(
        prompt=TEST_PROMPT,
        size="1024x1024",
        quality="standard",
        style="vivid",
        output_dir=OUTPUT_DIR,
        filename_prefix="core_test"
    )
    
    if result["success"]:
        print(f"✅ Core API test successful!")
        print(f"Image URL: {result['image_url']}")
        print(f"Saved to: {result['saved_path']}")
    else:
        print(f"❌ Core API test failed!")
        print(f"Error: {result['error']}")
        
    return result["success"]

def test_cli():
    """Test the command-line interface."""
    print("\n=== Testing CLI ===")
    cli_path = Path(__file__).parent.parent / "src" / "cli" / "generate_image.py"
    
    # Ensure the directory exists
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Run the CLI tool
    cmd = [
        "python", 
        str(cli_path), 
        TEST_PROMPT, 
        "--output-dir", OUTPUT_DIR,
        "--prefix", "cli_test",
        "--format", "json"
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        output = json.loads(result.stdout)
        
        if output["success"]:
            print(f"✅ CLI test successful!")
            print(f"Image URL: {output['image_url']}")
            print(f"Saved to: {output['saved_path']}")
            return True
        else:
            print(f"❌ CLI test failed!")
            print(f"Error: {output['error']}")
            return False
    except Exception as e:
        print(f"❌ CLI test failed with exception!")
        print(f"Error: {str(e)}")
        return False

def test_crewai():
    """Test the CrewAI integration."""
    print("\n=== Testing CrewAI Integration ===")
    try:
        from crewai import Agent, Task, Crew
        from src.integrations.crewai.tools.image_tool import ImageGenerationTool
        
        # Create the image generation tool
        image_tool = ImageGenerationTool(output_dir=OUTPUT_DIR)
        
        # Create a test agent
        agent = Agent(
            role="Test Agent",
            goal="Test the image generation tool",
            backstory="I am a test agent for the image generation tool.",
            tools=[image_tool],
            verbose=True
        )
        
        # Create a test task
        task = Task(
            description=f"Generate an image with the following description: {TEST_PROMPT}",
            agent=agent
        )
        
        # Create and run a crew
        crew = Crew(agents=[agent], tasks=[task], verbose=True)
        
        print("Running CrewAI test... (this may take a while)")
        result = crew.kickoff()
        
        print(f"✅ CrewAI test completed")
        print(f"Result: {result}")
        
        return True
    except Exception as e:
        print(f"❌ CrewAI test failed with exception!")
        print(f"Error: {str(e)}")
        return False

if __name__ == "__main__":
    # Create output directory
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    
    # Run tests
    core_success = test_core_api()
    cli_success = test_cli()
    
    # Only run CrewAI test if previous tests succeeded and CrewAI is installed
    if core_success and cli_success:
        try:
            import crewai
            crewai_success = test_crewai()
        except ImportError:
            print("\n⚠️ CrewAI not installed, skipping CrewAI test")
            crewai_success = None
    
    # Print summary
    print("\n=== Test Summary ===")
    print(f"Core API: {'✅ Success' if core_success else '❌ Failed'}")
    print(f"CLI: {'✅ Success' if cli_success else '❌ Failed'}")
    
    if crewai_success is not None:
        print(f"CrewAI: {'✅ Success' if crewai_success else '❌ Failed'}")
    else:
        print(f"CrewAI: ⚠️ Skipped") 