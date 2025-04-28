# Jarvis Project Template Structure

This document outlines a standardized structure for projects that live within the Jarvis ecosystem. Using this template ensures consistency across multiple projects and facilitates knowledge sharing.

## Project Directory Structure

```
/Jarvis/projects/[project-name]/
├── src/                   # Source code
│   ├── api/               # API endpoints
│   ├── components/        # Reusable components
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   └── types/             # Type definitions
│
├── docs/                  # Project-specific documentation
│   ├── architecture/      # Architecture documentation
│   ├── api/               # API documentation
│   └── guides/            # Usage guides
│
├── config/                # Project configuration
│   ├── .env.example       # Example environment variables
│   ├── settings.js        # Application settings
│   └── dependencies.json  # Dependency management
│
├── tests/                 # Test suite
│   ├── unit/              # Unit tests
│   ├── integration/       # Integration tests
│   └── fixtures/          # Test data
│
└── artifacts/             # Project artifacts
    ├── designs/           # Design assets
    ├── discovery/         # Discovery documents
    ├── planning/          # Planning documents
    └── outputs/           # Generated outputs
```

## Project Metadata

Each project should include the following metadata files:

1. **README.md**: Overview, setup instructions, and quick links
2. **project.json**: Machine-readable project metadata
3. **CHANGELOG.md**: Version history and changes
4. **LICENSE**: License information

## project.json Schema

```json
{
  "name": "project-name",
  "version": "0.1.0",
  "description": "Brief project description",
  "owner": "Primary owner/team",
  "dependencies": {
    "jarvis-core": "version",
    "jarvis-tools": "version"
  },
  "integrations": [
    "voice",
    "image-generation",
    "memory"
  ],
  "resources": {
    "memory": {
      "allocation": "standard"
    },
    "compute": {
      "tier": "standard"
    }
  },
  "status": "development"
}
```

## Integration with Jarvis

Projects should define how they integrate with Jarvis core capabilities:

### Memory Integration

Each project can define its unique memory structure, extending the base Jarvis memory architecture:

```
/Jarvis/core/memory/projects/[project-name]/
├── episodic/             # Project-specific episodic memory
├── semantic/             # Project-specific knowledge base
└── metadata.json         # Memory configuration
```

### Tool Integration

Projects should specify which Jarvis tools they use:

```json
{
  "tools": {
    "voice": {
      "enabled": true,
      "default_voice": "echo",
      "custom_prompts": "./config/voice_prompts.json"
    },
    "image": {
      "enabled": true,
      "styles": ["vivid", "natural"],
      "max_resolution": "1024x1024"
    }
  }
}
```

### Shared Components

Projects can publish components to be shared across other projects:

```
/Jarvis/projects/_shared/[project-name]/
├── components/            # Reusable UI components
├── utils/                 # Utility functions
└── README.md              # Documentation
```

## Project Lifecycle

Projects in the Jarvis ecosystem follow this lifecycle:

1. **Initialization**: Created from template with `jarvis create project`
2. **Development**: Active development with Jarvis assistance
3. **Integration**: Integrated with Jarvis core and tools
4. **Deployment**: Deployed as standalone or integrated with Jarvis
5. **Maintenance**: Ongoing updates and improvements
6. **Archive**: Deprecated and archived when no longer active

## Best Practices

1. **Consistent Naming**: Use kebab-case for directory and file names
2. **Documentation First**: Document architecture and APIs before implementation
3. **Interface Definitions**: Define clear interfaces between project and Jarvis
4. **Memory Strategy**: Plan memory requirements and structure early
5. **Tool Utilization**: Leverage existing Jarvis tools rather than creating new ones

## Creating a New Project

To create a new project using this template:

1. Initialize the project structure
2. Configure project.json
3. Set up memory integration
4. Define tool requirements
5. Document architecture and interfaces

This template ensures that projects within the Jarvis ecosystem are structured consistently, making it easier to maintain multiple projects and share knowledge between them. 