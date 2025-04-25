#!/usr/bin/env python3
"""
Task definitions and management for CrewAI newsletter team.
"""
import os
import yaml
from typing import Dict, List, Optional, Any
from crewai import Task, Agent


def load_task_config(task_type: str) -> Dict[str, Any]:
    """
    Load task configuration from YAML file.
    
    Args:
        task_type: The type of task to load (e.g., "newsletter_planning")
        
    Returns:
        Dictionary containing the task configuration
        
    Raises:
        ValueError: If task_type is not found in the configuration
    """
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'tasks.yaml')
    
    with open(config_path, 'r') as file:
        configs = yaml.safe_load(file)
    
    if task_type not in configs:
        valid_types = list(configs.keys())
        raise ValueError(f"Unknown task type: '{task_type}'. Valid types: {', '.join(valid_types)}")
    
    return configs[task_type]


def format_task_config(config: Dict[str, Any], format_args: Dict[str, Any]) -> Dict[str, Any]:
    """
    Format any placeholders in the task config using the provided arguments.
    
    Args:
        config: The task configuration dictionary
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


def create_task(
    task_type: str,
    agents: Dict[str, Agent],
    format_args: Optional[Dict[str, Any]] = None,
    context: Optional[str] = None,
    output_file: Optional[str] = None
) -> Task:
    """
    Create a CrewAI task based on its type.
    
    Args:
        task_type: Type of task to create (e.g., "newsletter_planning")
        agents: Dictionary of available agents indexed by name
        format_args: Optional dictionary for formatting task properties
        context: Optional context to pass to the task
        output_file: Optional file path to save task output
        
    Returns:
        Configured CrewAI Task
    """
    # Load the task configuration
    config = load_task_config(task_type)
    
    # Format any placeholder values in the config
    if format_args:
        config = format_task_config(config, format_args)
    
    # Get the agent for this task
    agent_name = config.get("agent")
    if agent_name not in agents:
        raise ValueError(f"Agent '{agent_name}' not found for task '{task_type}'")
    
    agent = agents[agent_name]
    
    # Create task
    task = Task(
        description=config.get("description"),
        expected_output=config.get("expected_output"),
        agent=agent,
        context=context,
        output_file=output_file
    )
    
    return task


def create_sequential_tasks(
    agents: Dict[str, Agent],
    topic: str,
    output_dir: Optional[str] = None
) -> List[Task]:
    """
    Create a sequence of tasks for newsletter creation.
    
    Args:
        agents: Dictionary of available agents
        topic: The newsletter topic
        output_dir: Optional directory to save task outputs
        
    Returns:
        List of tasks in sequential order
    """
    format_args = {"topic": topic}
    tasks = []
    
    # 1. Planning task (CEO)
    planning_task = create_task("newsletter_planning", agents, format_args)
    tasks.append(planning_task)
    
    # 2. Research task (Content Manager)
    research_task = create_task("content_research", agents, format_args)
    tasks.append(research_task)
    
    # 3. Creative concept task (Creative Manager)
    concept_task = create_task("creative_concept", agents, format_args)
    tasks.append(concept_task)
    
    # 4. Visual design task (Designer)
    design_task = create_task("visual_design", agents, format_args)
    tasks.append(design_task)
    
    # 5. Article writing task (Writer)
    # Save to output file if directory is provided
    output_file = None
    if output_dir:
        os.makedirs(output_dir, exist_ok=True)
        # Create a safe filename from the topic
        safe_topic = "".join(c if c.isalnum() or c in [' ', '_'] else '_' for c in topic)
        safe_topic = safe_topic.replace(' ', '_')[:30]  # Limit length
        output_file = os.path.join(output_dir, f"{safe_topic}_article.md")
    
    writing_task = create_task("article_writing", agents, format_args, output_file=output_file)
    tasks.append(writing_task)
    
    # 6. Final review task (CEO)
    review_task = create_task("final_review", agents, format_args)
    tasks.append(review_task)
    
    return tasks 