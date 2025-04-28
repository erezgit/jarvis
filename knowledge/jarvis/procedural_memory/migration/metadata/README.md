# Jarvis Migration Metadata

This directory contains metadata mapping files that document how components in the current Jarvis structure will map to the hybrid cognitive architecture. These metadata files serve as a planning tool and reference during the phased migration.

## Purpose

The metadata enhancement phase (Phase 1) serves several important purposes:

1. Create a clear mapping between current files and their future locations
2. Document the cognitive function of each component
3. Establish a plan for migration without disrupting functionality
4. Provide a reference for determining dependencies between components

## Metadata Format

Each metadata mapping file uses the following format:

```yaml
current_path: path/to/current/file.md
cognitive_path: Cognitive/Category/Subcategory/file.md
cognitive_function: Description of the cognitive purpose this file serves
dependencies:
  - path/to/dependency1
  - path/to/dependency2
migration_phase: Phase number when this should be migrated (1-5)
migration_notes: Any special considerations for migrating this file
```

## Directory Structure

The metadata directory is organized to mirror the current Jarvis structure:

```
metadata/
├── instructions/  # Metadata for core instructions 
├── memory/        # Metadata for memory components
├── project/       # Metadata for project components
├── tools/         # Metadata for tools components
└── workspace/     # Metadata for workspace components
```

## Implementation Plan

1. Create metadata mapping files for all core components
2. Add metadata headers to actual files (as comments appropriate to the file type)
3. Create scripts to validate mappings and identify potential conflicts
4. Use these mappings to guide the subsequent migration phases

## Migration Phases

As a reminder, the overall migration follows these phases:

1. **Metadata Enhancement** (Current Phase, 1-2 weeks)
   - Add metadata without changing directory structure

2. **Memory System Alignment** (2-3 weeks)
   - Refactor memory system to cognitive process model

3. **Cognitive Directory Creation** (2-3 weeks)
   - Create structure and use symbolic links for backward compatibility

4. **Domain Specialization** (3-4 weeks)
   - Create and organize domain-specific knowledge and skills

5. **Complete Migration** (2-3 weeks)
   - Replace symbolic links with physical files and update references 