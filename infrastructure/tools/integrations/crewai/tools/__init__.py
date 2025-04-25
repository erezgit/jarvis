#!/usr/bin/env python3
"""
CrewAI tools module initialization.
"""
from .image_tool import ImageGenerationTool

# Dictionary of available tools that can be used by agents
AVAILABLE_TOOLS = {
    "image_generation": ImageGenerationTool(),
}

def get_tool(tool_name):
    """
    Get a tool by name.
    
    Args:
        tool_name: The name of the tool to retrieve
        
    Returns:
        Tool instance or None if the tool doesn't exist
    """
    return AVAILABLE_TOOLS.get(tool_name)

def get_tools_for_agent(agent_config):
    """
    Get a list of tools for an agent based on their configuration.
    
    Args:
        agent_config: The agent configuration dictionary
        
    Returns:
        List of Tool instances
    """
    tools = []
    
    # Add tools based on agent's allowed_tools configuration
    if "allowed_tools" in agent_config and agent_config["allowed_tools"]:
        for tool_name in agent_config["allowed_tools"]:
            tool = get_tool(tool_name)
            if tool:
                tools.append(tool)
    
    return tools
