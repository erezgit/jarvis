# CrewAI Newsletter Team - Detailed Implementation Plan

## Implementation Phases

### Phase 1: Environment Setup and Basic Framework ⬜

- [ ] Install CrewAI and dependencies
  ```bash
  pip install crewai
  pip install 'crewai[tools]'
  ```
- [ ] Create base directory structure
  ```
  tools/src/services/crewai/
  ├── __init__.py
  ├── run_crew.py
  ├── agents.py
  ├── tasks.py
  └── tools/
      ├── __init__.py
      ├── image_tool.py
      ├── dropbox_tool.py
      └── search_tool.py
  ```
- [ ] Configure environment variables
  - Add CrewAI-related variables to `.env` file
  - Update environment loading in relevant scripts

### Phase 2: Agent Structure Implementation ⬜

- [ ] Define agent roles in `agents.py`
  - Design CEO 
  - Team Managers (Design, Content, Creative)
  - Team Members (Designer, Writer, Creative Specialist)
- [ ] Define agent relationships and hierarchy
- [ ] Create YAML configurations for agent properties
  ```yaml
  # Example agent configuration
  design_ceo:
    role: "Design Agency CEO"
    goal: "Lead a creative team to produce high-quality content"
    backstory: "You are an experienced design executive..."
  ```
- [ ] Implement agent initialization from configurations

### Phase 3: Task Definition and Management ⬜

- [ ] Define task structure in `tasks.py`
- [ ] Implement task delegation patterns
- [ ] Create task templates for common newsletter activities
- [ ] Set up task sequencing for hierarchical process
- [ ] Implement task timeout functionality

### Phase 4: Tool Integration ⬜

- [ ] Create wrapper for existing image generation service
  ```python
  class ImageGenerationTool(Tool):
      name: str = "ImageGenerationTool"
      description: str = "Generate images using DALL-E"
      
      def _run(self, prompt: str, size: str = "1024x1024", **kwargs) -> str:
          # Call the existing image generation script
          # Return the path to the generated image
  ```
- [ ] Implement Dropbox access tool
- [ ] Integrate web search capabilities
- [ ] Create utility tools for content creation and formatting

### Phase 5: Main Script Implementation ⬜

- [ ] Develop the main `run_crew.py` script
  - Command-line argument parsing
  - Agent and task initialization
  - Process configuration
  - Execution and timeout management
  - Result formatting and output
- [ ] Add execution logging for debugging
- [ ] Implement error handling and graceful failure modes

### Phase 6: Testing and Refinement ⬜

- [ ] Create test cases for agent interactions
- [ ] Test time-limited execution
- [ ] Validate tool integrations
- [ ] Perform end-to-end testing with different prompt types
- [ ] Optimize performance for target execution time

### Phase 7: Documentation and Deployment ⬜

- [ ] Document usage instructions
- [ ] Create examples for common use cases
- [ ] Update project README
- [ ] Create user guide
- [ ] Prepare for integration with other project components

## Technical Implementation Details

### Main Script Structure

```python
#!/usr/bin/env python3
import os
import argparse
import sys
import threading
import time
from crewai import Agent, Task, Crew, Process
from dotenv import load_dotenv

# Load configuration
load_dotenv()

def setup_args():
    """Parse command line arguments."""
    parser = argparse.ArgumentParser(description='Run CrewAI newsletter team')
    parser.add_argument('prompt', type=str, help='Prompt for the CrewAI team')
    parser.add_argument('--agent', type=str, default='ceo', help='Specific agent to interact with')
    parser.add_argument('--time_limit', type=int, default=120, help='Maximum execution time in seconds')
    parser.add_argument('--output', type=str, default='./crew_outputs', help='Output directory')
    parser.add_argument('--process', type=str, default='hierarchical', 
                        choices=['sequential', 'hierarchical'], help='Process type')
    return parser.parse_args()

def load_agents(agent_type):
    """Load agent definitions from configuration."""
    # Implementation here
    
def create_tasks(prompt, agent):
    """Create tasks based on the prompt and agent."""
    # Implementation here
    
def run_with_timeout(crew, time_limit):
    """Run the crew with a timeout."""
    # Implementation here
    
def main():
    args = setup_args()
    # Implementation here
    
if __name__ == "__main__":
    sys.exit(main())
```

### Agent Configuration Structure

```python
from crewai import Agent
import yaml
import os

def load_agent_config(agent_type):
    """Load agent configuration from YAML."""
    config_path = os.path.join(os.path.dirname(__file__), 'config', 'agents.yaml')
    with open(config_path, 'r') as file:
        configs = yaml.safe_load(file)
    
    if agent_type not in configs:
        raise ValueError(f"Unknown agent type: {agent_type}")
    
    return configs[agent_type]

def create_agent(agent_type, tools=None):
    """Create an agent based on its type."""
    config = load_agent_config(agent_type)
    
    return Agent(
        role=config.get('role'),
        goal=config.get('goal'),
        backstory=config.get('backstory'),
        tools=tools or [],
        verbose=True
    )
```

### Integration with Image Generation

```python
from crewai import Tool
import subprocess
import os

class ImageGenerationTool(Tool):
    name: str = "ImageGenerationTool"
    description: str = "Generate images using DALL-E based on descriptions"
    
    def _run(self, prompt: str, size: str = "1024x1024", **kwargs) -> str:
        """Generate an image using the existing image generation service."""
        script_path = os.path.join("tools", "src", "services", "image", "generate_image.py")
        
        try:
            cmd = ["python", script_path, prompt, "--size", size]
            
            # Add any additional arguments
            for key, value in kwargs.items():
                if value:
                    cmd.extend([f"--{key}", str(value)])
            
            # Run the command
            result = subprocess.run(cmd, capture_output=True, text=True, check=True)
            return result.stdout
        
        except subprocess.CalledProcessError as e:
            return f"Error generating image: {e.stderr}"
```

## Testing Plan

1. **Unit Testing**
   - Test agent creation and configuration loading
   - Test task creation and assignment
   - Test tool functionality (image generation, Dropbox access)
   - Test timeout mechanism

2. **Integration Testing**
   - Test the full agent hierarchy with multiple agents
   - Verify information flow between agents
   - Test tool integrations in the context of CrewAI

3. **End-to-End Testing**
   - Test with real prompts for newsletter content
   - Verify output quality and relevance
   - Test time limits with complex prompts
   - Verify error handling with intentional failures

## Success Metrics

1. **Functional Success**
   - All agents properly initialized and functional
   - Tasks executed in correct order
   - Results returned in expected format
   - External tools successfully integrated

2. **Performance Success**
   - Execution completes within specified time limits
   - Resource usage stays within acceptable bounds
   - API calls efficiently managed

3. **User Experience Success**
   - Command interface consistent with existing tools
   - Error messages clear and actionable
   - Results formatted for easy consumption 