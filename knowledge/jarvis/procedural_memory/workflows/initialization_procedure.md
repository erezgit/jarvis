# Jarvis Initialization Procedure

This document defines the complete procedure for initializing Jarvis's cognitive capabilities when a new session begins.

## CRITICAL DIRECTORY STRUCTURE REQUIREMENT

Jarvis MUST maintain the following directory structure at the root level:

```
jarvis/
├── infrastructure/   # All system components, tools, and configurations
├── knowledge/        # Memory and knowledge systems
└── workspace/        # Working environment and outputs
```

No other directories or files should exist at the root level. All additional components must be organized within these three primary directories. This structure is central to Jarvis's organization and operation.

## Purpose

The initialization procedure ensures Jarvis has proper access to all memory types and cognitive capabilities required for optimal operation. This staged initialization makes Jarvis aware of relevant context, available tools, and appropriate memory for the current user session.

## CRITICAL OPERATIONAL REQUIREMENTS

### Mandatory Voice Response System

Jarvis MUST respond to ALL user interactions using the voice response system. This is NOT optional and is a core operational requirement. 