# Migration Plan for Jarvis Reorganization

This document outlines the step-by-step process to migrate from the current structure to the new Rule of Five structure without disrupting ongoing development.

## Phase 1: Create the Core Structure (1-2 days)

1. Create the five top-level directories:
   ```bash
   mkdir -p Jarvis/{core,tools,workspace,projects,docs}
   ```

2. Create the initial subdirectories in each main directory:
   ```bash
   # Core structure
   mkdir -p Jarvis/core/{engine,config,docs,memory,resources}
   
   # Tools structure
   mkdir -p Jarvis/tools/{voice,image,knowledge,templates,scripts}
   
   # Workspace structure
   mkdir -p Jarvis/workspace/{discovery,outputs,planning,design,presentations}
   
   # Projects structure
   mkdir -p Jarvis/projects/{_templates,_shared}
   
   # Docs structure
   mkdir -p Jarvis/docs/{guides,api,examples,reference,contributing}
   ```

## Phase 2: Migrate Core Assets (2-3 days)

1. Move existing instructions to core/docs:
   ```bash
   cp -r Jarvis/instructions/* Jarvis/core/docs/
   ```

2. Move existing tools to the appropriate folders:
   ```bash
   cp -r Jarvis/tools/src/* Jarvis/tools/
   cp -r Jarvis/tools/config/* Jarvis/core/config/
   cp -r Jarvis/tools/docs/* Jarvis/docs/
   ```

3. Move workspace artifacts:
   ```bash
   cp -r Jarvis/workspace/discovery/* Jarvis/workspace/discovery/
   cp -r Jarvis/workspace/generated_audio/* Jarvis/workspace/outputs/audio/
   cp -r Jarvis/workspace/generated_images/* Jarvis/workspace/outputs/images/
   cp -r Jarvis/workspace/memory/* Jarvis/core/memory/
   cp -r Jarvis/workspace/project-standards/* Jarvis/docs/reference/standards/
   cp -r Jarvis/workspace/tickets/* Jarvis/workspace/planning/tickets/
   ```

## Phase 3: Prepare the TodoList Project (1 day)

1. Create the todolist project directory:
   ```bash
   mkdir -p Jarvis/projects/todolist-agent/{src,docs,config,tests,artifacts}
   ```

2. Create a symbolic link for development:
   ```bash
   # This allows continuing work on the project while we transition
   ln -s /Users/erezfern/Workspace/todolist-agent Jarvis/projects/todolist-agent/current
   ```

3. Prepare the project.json manifest:
   ```bash
   touch Jarvis/projects/todolist-agent/project.json
   ```

## Phase 4: Test and Validate (1-2 days)

1. Run a simple end-to-end test to ensure tools still work:
   ```bash
   cd Jarvis
   ./tools/scripts/test-voice.sh
   ```

2. Validate the README and documentation:
   ```bash
   cp README.md Jarvis/README.md
   # Update paths and references
   ```

3. Create symbolic links for backward compatibility:
   ```bash
   ln -s Jarvis/core/docs Jarvis/instructions
   ln -s Jarvis/tools Jarvis/tools
   ```

## Phase 5: Complete Migration (1-2 days)

1. Set up the project's memory integration:
   ```bash
   mkdir -p Jarvis/core/memory/projects/todolist-agent/{episodic,semantic}
   touch Jarvis/core/memory/projects/todolist-agent/metadata.json
   ```

2. Set up shared components:
   ```bash
   mkdir -p Jarvis/projects/_shared/todolist-agent
   ```

3. Move the actual project:
   ```bash
   # When ready to fully migrate
   rsync -av --exclude='.git' --exclude='node_modules' /Users/erezfern/Workspace/todolist-agent/ Jarvis/projects/todolist-agent/src/
   ```

## Phase 6: Switch to New Structure (1 day)

1. Update environment variables and paths:
   ```bash
   cd Jarvis
   # Update .env files with new paths
   ```

2. Test running the project from new location:
   ```bash
   cd Jarvis/projects/todolist-agent/src
   npm run dev
   ```

3. Update any CI/CD configurations:
   ```bash
   # Update any deployment scripts with new paths
   ```

## Timeline

- **Total estimated time**: 7-11 days
- **Parallel work possible**: Yes, can continue development during migration
- **Rollback strategy**: Keep original structure until migration is complete

## Success Criteria

1. All tools and functionality work in the new structure
2. The todolist project runs successfully from the new location
3. Documentation is updated to reflect new paths and organization
4. Integration between Jarvis core and the project is functioning

## Post-Migration

1. Create a project template based on todolist-agent
2. Set up recurring audits to ensure the structure remains clean
3. Document lessons learned for future projects 