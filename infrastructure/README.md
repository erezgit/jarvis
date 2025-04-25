# Jarvis Infrastructure

This directory contains the core infrastructure components for Jarvis.

## Directory Structure

- **config/**: Configuration files and templates
- **docs/**: Documentation for infrastructure components
- **src/**: Source code for core infrastructure
  - **cli/**: Command-line interface tools
  - **core/**: Core functionality modules
    - **voice_generation/**: Voice generation services
    - **image_generation/**: Image generation services
  - **integrations/**: Integration with external services

## Setup

The infrastructure components are automatically set up by the main `setup.sh` script at the root of the repository. This includes:

1. Environment configuration
2. Required Python packages
3. Script permissions

## Usage

Most infrastructure components are not used directly but are called through the scripts in the `workspace/tools/` directory.

## Development

When developing new infrastructure components:

1. Add appropriate documentation in the `docs/` directory
2. Create tests for your components
3. Update the setup script if necessary
4. Ensure no API keys or credentials are hardcoded 