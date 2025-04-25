#!/usr/bin/env python3
"""
Example demonstrating how to use the ImageGenerationTool with CrewAI.
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from crewai import Agent, Task, Crew

# Add the project root to sys.path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent.parent))

# Import the tool from the new location
from tools.src.integrations.crewai.tools.image_tool import ImageGenerationTool

# Load environment variables
load_dotenv()

# Create the image generation tool
image_tool = ImageGenerationTool(output_dir="workspace/generated_images")

# Create an agent that can generate images
artist_agent = Agent(
    role="Digital Artist",
    goal="Create beautiful and creative images based on descriptions",
    backstory="""You are an expert digital artist with years of experience
    creating stunning visuals. You have a keen eye for detail and can transform
    text descriptions into captivating images.""",
    verbose=True,
    tools=[image_tool]
)

# Create a task for the agent
image_task = Task(
    description="""
    Generate an image of a futuristic city with flying cars and tall 
    skyscrapers under a sunset sky. Make it visually stunning with 
    vibrant colors in a cinematic style.
    
    After generating the image, provide a brief description of what you created.
    """,
    agent=artist_agent
)

# Create the crew with the artist agent
artist_crew = Crew(
    agents=[artist_agent],
    tasks=[image_task],
    verbose=True
)

# Run the crew
result = artist_crew.kickoff()

print("\n==== Final Result ====")
print(result) 