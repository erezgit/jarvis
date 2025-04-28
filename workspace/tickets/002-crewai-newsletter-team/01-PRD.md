# CrewAI Newsletter Team - Product Requirements Document

## Overview
Leverage CrewAI to create an autonomous team of AI agents that work collaboratively to generate AI newsletter content. The system will allow users to initiate the AI team through Cursor, similar to how they currently trigger image generation, and receive completed content after a specified runtime period.

## Requirements

### Functional Requirements
1. Create a command-line interface for initiating and interacting with CrewAI agents
2. Implement a hierarchical team structure:
   - Design CEO (top-level manager)
   - Team Managers (design, content, creative)
   - Team Members (designers, writers, creative specialists)
3. Enable agents to collaborate by:
   - Sharing information and outputs between agents
   - Following a hierarchical approval process
   - Generating complementary components of the newsletter
4. Support agent interaction with external tools:
   - DALL-E image generation (using existing image service)
   - Dropbox file access for retrieving assets and templates
   - Web search capabilities for research
5. Implement time-limited execution (approximately 2 minutes)
6. Provide results back to the user via Cursor interface

### Non-Functional Requirements
1. **Usability**: Ensure simple command-line interface similar to existing image generation tool
2. **Efficiency**: Complete execution within defined time constraints
3. **Reliability**: Graceful handling of execution timeouts and errors
4. **Modularity**: Design components to be reusable for other agent team applications
5. **Security**: Secure handling of API keys and generated content

## User Experience
1. User initiates the agent team by running a command in Cursor:
   ```
   python tools/src/services/crewai/run_crew.py "Create a newsletter section about recent AI advancements" --time_limit 120
   ```
2. System provides real-time feedback on execution progress
3. Upon completion, system returns the generated content
4. User can interact with specific agents through additional commands:
   ```
   python tools/src/services/crewai/run_crew.py "Refine the section on large language models" --agent content_manager
   ```

## Integration Points
1. CrewAI framework for agent orchestration
2. Existing image generation service for visual content
3. Dropbox API for asset management
4. Web search capabilities for research
5. Cursor IDE for user interaction

## Acceptance Criteria
1. Command-line tool successfully initiates and runs CrewAI agent teams
2. Agents collaboratively generate newsletter content
3. Execution completes within specified time limits
4. User can interact with specific agents through command-line interface
5. Results are properly formatted and returned to the user
6. External tools (image generation, file access) are properly integrated

## Constraints
1. Operation within Cursor environment
2. API rate limits for external services
3. Time constraints for execution
4. Computational resources for running multiple agents simultaneously

## Dependencies
1. CrewAI framework installation and configuration
2. External API access (OpenAI, Dropbox)
3. Python environment setup 