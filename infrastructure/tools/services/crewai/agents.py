#!/usr/bin/env python3
"""
Agent definitions and management for CrewAI newsletter team.
"""
import os
import sys
import yaml
from pathlib import Path
from typing import Dict, List, Optional, Any
from crewai import Agent
from crewai_tools import WebSearchTool, SerperDevTool

# Add the project root to sys.path for imports
sys.path.insert(0, str(Path(__file__).parent.parent.parent.parent))

from tools.src.integrations.crewai.tools.image_tool import ImageGenerationTool
from .tools.dropbox_tool import DropboxAccessTool


def load_agent_config(agent_type: str) -> Dict[str, Any]:
    """
    Load agent configuration from YAML file.
    
    Args:
        agent_type: The type of agent to load (e.g., "design_ceo")
        
    Returns:
        Dictionary containing the agent configuration
        
    Raises:
        ValueError: If agent_type is not found in the configuration
    """
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'agents.yaml')
    
    with open(config_path, 'r') as file:
        configs = yaml.safe_load(file)
    
    if agent_type not in configs:
        valid_types = list(configs.keys())
        raise ValueError(f"Unknown agent type: '{agent_type}'. Valid types: {', '.join(valid_types)}")
    
    return configs[agent_type]


def format_config_values(config: Dict[str, Any], format_args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format any placeholders in the config using the provided arguments.
    
    Args:
        config: The agent configuration dictionary
        format_args: Dictionary of values to use for formatting
        
    Returns:
        Dictionary with formatted values
    """
    formatted_config = {}
    
    for key, value in config.items():
        if isinstance(value, str):
            try:
                formatted_config[key] = value.format(**format_args)
            except KeyError:
                # If formatting fails, keep the original value
                formatted_config[key] = value
        else:
            formatted_config[key] = value
            
    return formatted_config


def create_agent(
    agent_type: str, 
    tools: Optional[List[Any]] = None,
    format_args: Optional[Dict[str, Any]] = None
) -> Agent:
    """
    Create a CrewAI agent based on its type with appropriate tools.
    
    Args:
        agent_type: Type of agent to create (e.g., "design_ceo")
        tools: Optional list of tools to give the agent
        format_args: Optional dictionary for formatting agent properties
        
    Returns:
        Configured CrewAI Agent
    """
    # Load the agent configuration
    config = load_agent_config(agent_type)
    
    # Format any placeholder values in the config
    if format_args:
        config = format_config_values(config, format_args)
    
    # Determine which tools to give the agent based on its role
    agent_tools = tools or []
    
    # Add role-specific tools
    if agent_type in ["design_ceo", "content_manager"]:
        # These roles need search capabilities
        agent_tools.append(SerperDevTool())
    
    if agent_type in ["designer", "creative_manager"]:
        # These roles need image generation capabilities
        agent_tools.append(ImageGenerationTool())
    
    # Create and return the agent
    return Agent(
        role=config.get("role"),
        goal=config.get("goal"),
        backstory=config.get("backstory"),
        tools=agent_tools,
        verbose=True
    )


def create_all_agents(format_args: Optional[Dict[str, Any]] = None) -> Dict[str, Agent]:
    """
    Create all agents for the newsletter team.
    
    Args:
        format_args: Optional dictionary for formatting agent properties
        
    Returns:
        Dictionary of agent names to Agent instances
    """
    # Initialize tools
    search_tool = SerperDevTool()
    image_tool = ImageGenerationTool()
    
    # Try to create Dropbox tool if environment variable exists
    dropbox_tool = None
    if os.getenv("DROPBOX_ACCESS_TOKEN"):
        try:
            dropbox_tool = DropboxAccessTool()
        except Exception as e:
            print(f"Warning: Failed to initialize DropboxAccessTool: {e}")
    
    # Create all agents with appropriate tools
    agents = {}
    
    # Create CEO agent
    ceo_tools = [search_tool]
    if dropbox_tool:
        ceo_tools.append(dropbox_tool)
    agents["design_ceo"] = create_agent("design_ceo", ceo_tools, format_args)
    
    # Create manager agents
    agents["design_manager"] = create_agent("design_manager", [image_tool], format_args)
    agents["content_manager"] = create_agent("content_manager", [search_tool], format_args)
    agents["creative_manager"] = create_agent("creative_manager", [image_tool, search_tool], format_args)
    
    # Create team member agents
    agents["designer"] = create_agent("designer", [image_tool], format_args)
    agents["writer"] = create_agent("writer", [search_tool], format_args)
    agents["creative"] = create_agent("creative", [search_tool], format_args)
    
    return agents 