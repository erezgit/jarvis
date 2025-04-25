# Jarvis Directory Reorganization Proposal

## Current Structure Analysis

The current Jarvis directory structure consists of:

```
/Jarvis
├── workspace/             # Planning and work artifacts
│   ├── discovery/         # Research and exploration documents  
│   ├── generated_audio/   # Generated voice outputs
│   ├── generated_images/  # Generated image outputs
│   ├── memory/            # Memory storage
│   ├── project-standards/ # Guidelines and standards
│   ├── tickets/           # Feature tickets
│   ├── tools/             # Workspace-specific tools
│   ├── design/            # Design assets and guidelines
│   └── Jarvis-presentation/ # Presentation materials
│
├── tools/                 # Operational code and implementation
│   ├── config/            # Configuration files
│   ├── src/               # Source code
│   ├── venv/              # Python virtual environment
│   └── docs/              # Technical documentation
│
├── instructions/          # Guidelines and documentation
│   ├── jarvis.md          # Comprehensive instructions
│   ├── about.md           # User-facing introduction
│   ├── rules.md           # Operational guidelines
│   └── voice.md           # Voice implementation details
│
└── project/               # Project-specific content (VideoGen, etc.)
    ├── discovery/         # Project discovery
    ├── project-standards/ # Project guidelines
    ├── tickets/           # Project tickets
    └── VideoGen*/         # Specific project folders
```

This structure has evolved organically but has several issues:

1. **Overlapping Responsibilities**: Both `workspace` and `project` contain similar content (tickets, standards)
2. **Unclear Boundaries**: The distinction between Jarvis core capabilities and project-specific content is blurred
3. **Deep Nesting**: Important files are buried in deep directory structures
4. **Scalability Concerns**: Current structure would be difficult to extend to multiple projects

## Rule of Five Proposal

I propose reorganizing the Jarvis directory structure to follow the Rule of Five, with clear separation of responsibilities and better support for multiple projects:

```
/Jarvis
├── core/                  # Core Jarvis capabilities
│   ├── engine/            # Implementation code (Python, etc.)
│   ├── config/            # Configuration and environment
│   ├── docs/              # Documentation and instructions
│   ├── memory/            # Memory system and storage
│   └── resources/         # Shared assets (templates, etc.)
│
├── tools/                 # Utility tools and generators
│   ├── voice/             # Voice generation
│   ├── image/             # Image generation
│   ├── knowledge/         # Knowledge extraction tools
│   ├── templates/         # Project templates
│   └── scripts/           # Utility scripts
│
├── workspace/             # Active work and outputs
│   ├── discovery/         # Research and exploration
│   ├── outputs/           # Generated outputs (audio, images)
│   ├── planning/          # Architecture and plans
│   ├── design/            # Design assets
│   └── presentations/     # Presentation materials
│
├── projects/              # Multiple project repositories
│   ├── todolist-agent/    # Current todolist project
│   ├── videogen/          # VideoGen project
│   ├── _templates/        # Project templates
│   └── _shared/           # Shared components between projects
│
└── docs/                  # User-facing documentation
    ├── guides/            # How-to guides
    ├── api/               # API documentation
    ├── examples/          # Example use cases
    ├── reference/         # Reference documentation
    └── contributing/      # Contribution guidelines
```

## Rationale for the New Structure

### 1. Core

The `core` directory contains everything essential to Jarvis's core functionality:

- **Engine**: The implementation code that powers Jarvis
- **Config**: Configuration files, environment variables, API keys
- **Docs**: Internal documentation for core capabilities
- **Memory**: The central memory system that preserves context
- **Resources**: Shared resources that core functionality depends on

### 2. Tools

The `tools` directory contains utilities and generators:

- **Voice**: Voice generation capabilities
- **Image**: Image generation capabilities
- **Knowledge**: Tools for knowledge extraction and organization
- **Templates**: Reusable templates for various outputs
- **Scripts**: Utility scripts for automation

### 3. Workspace

The `workspace` directory is for active work and outputs:

- **Discovery**: Research and exploration documents
- **Outputs**: Generated content like images and audio
- **Planning**: Architecture and planning documents
- **Design**: Design assets and standards
- **Presentations**: Materials for presenting Jarvis

### 4. Projects

The `projects` directory contains multiple project repositories:

- **todolist-agent**: Current project
- **videogen**: VideoGen project
- **_templates**: Templates for new projects
- **_shared**: Components shared between projects

### 5. Docs

The `docs` directory contains user-facing documentation:

- **Guides**: How-to guides for using Jarvis
- **API**: API documentation
- **Examples**: Example use cases
- **Reference**: Reference documentation
- **Contributing**: Guidelines for contributing

## Migration Path

To implement this reorganization with minimal disruption:

1. Create the new directory structure
2. Move files to their appropriate locations
3. Update references in documentation
4. Create symbolic links for backward compatibility if needed
5. Update any scripts or tools that depend on specific paths

## Multiple Projects Strategy

This structure allows multiple projects to live within Jarvis while maintaining clear separation:

1. **Project Independence**: Each project in the `projects/` directory is self-contained
2. **Shared Capabilities**: All projects can leverage Jarvis's core capabilities and tools
3. **Consistent Structure**: Projects follow a consistent structure for improved maintainability
4. **Deployment Flexibility**: Projects can be deployed independently
5. **Knowledge Transfer**: Knowledge and patterns can be shared between projects

## Next Steps

If this proposal is approved, I recommend:

1. Create a detailed migration plan with specific file mappings
2. Implement the reorganization in a staged approach
3. Update any path references in code and documentation
4. Create a project template for future projects

This reorganization will provide a cleaner, more scalable foundation for Jarvis as it continues to evolve and support multiple projects. 