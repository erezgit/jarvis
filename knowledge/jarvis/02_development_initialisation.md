# Development Workflow Initialization

## Purpose & Scope

This document defines the initialization procedure for development workflows and methodologies. It serves as the second stage (Stage 2) in the unified initialization workflow for the Knowledge Assistant.

## Unified Initialization Context

This document is Stage 2 in the 4-stage unified initialization workflow for the Knowledge Assistant:

1. **Stage 1**: Jarvis Initialization (`knowledge/jarvis/01_jarvis_initialization.md`)
2. **Stage 2**: Development Workflow (THIS DOCUMENT)
3. **Stage 3**: Project Initialization (`knowledge-assistant/agent-workspace/project-standards/01-architecture.md`)
4. **Stage 4**: History Initialization (Knowledge Assistant ticket history)

For the complete unified workflow, refer to:
`knowledge/jarvis/00_unified_initialization.md`

## Core Development Philosophy

- Take ownership of mistakes and learn from them
- Document learnings to build institutional knowledge
- Continuously improve processes and code quality
- Maintain clear communication with concise, insightful messages
- Follow structured workflows for predictable outcomes

## Communication Style

### Chat Communication Guidelines

All chat communications should follow these principles:
- **Concise**: Keep messages short and direct
- **Insightful**: Provide valuable technical observations
- **Educational**: Help improve understanding of concepts
- **Goal-oriented**: Focus on moving the project forward
- **Forward-looking**: Suggest next steps and options

For extended explanations, create markdown documents rather than lengthy chat messages.

## Ticket Management Workflow

### Opening a New Ticket

When initiating a new development task with the trigger phrase "Let's open a ticket for this":

1. **Create Ticket Directory**
   ```
   agent-workspace/tickets/{ticket-number}-{short-name}
   ```
   Where:
   - `{ticket-number}` follows sequential numbering
   - `{short-name}` is 2-3 words describing the feature/fix

2. **Create Required Documentation Files**:

   a. **Product Requirements Document (01-PRD.md)**
      - Clear problem statement
      - Detailed feature requirements
      - Success criteria
      - User impact
      - Constraints and considerations

   b. **Architectural Design Document (02-ADD.md)**
      - Reference project-standards/architecture.md
      - System components and relationships
      - Data flow
      - API design (if applicable)
      - Alignment with existing architecture

   c. **Detailed Implementation Plan (03-DIP.md)**
      - Phased implementation approach organized by logical steps
      - Step-by-step tasks with empty checkboxes to track progress
      - Files to modify with clear explanations of what needs to change
      - Testing strategy and verification steps
      - Rollback plan for handling implementation issues

3. **Implementation Readiness**
   - Before stating readiness, ensure 95% preparation
   - Research all necessary code components
   - Understand dependencies and potential impacts
   - Have all required resources identified

## Implementation Process

### Starting Implementation

Upon receiving authorization to begin implementation:

1. **Review the Implementation Plan**
   - Confirm approach is still valid
   - Check for any missed dependencies

2. **Research Code Components**
   - Analyze relevant code in detail
   - Understand architectural context
   - Identify potential side effects

3. **Execute Implementation**
   - Follow steps outlined in DIP
   - Implement changes directly in project (not in agent-workspace)
   - Make atomic, focused changes

4. **Track Progress**
   - You MUST!! Mark completed steps with ✅ in DIP document

   - Document any deviations from original plan

### Development Rules

1. **Always seek confirmation before code development**
2. **Verify changes are made to project files, not documentation**
3. **Follow project coding standards and patterns**
4. **Make changes incrementally and verify at each step**
5. **Document any lessons learned or unexpected challenges**

## Documentation Standards

### Creating Reports and Summaries

When extended documentation is needed:

1. **Use Structured Markdown**
   - Clear headings and subheadings
   - Consistent formatting
   - Code blocks with language specification
   - Tables where appropriate for structured data

2. **Standard Sections**
   - Executive summary
   - Background/context
   - Detailed analysis/findings
   - Recommendations
   - Next steps

3. **File Placement**
   - Store in relevant ticket directory
   - Use clear, descriptive filenames

## Detailed Implementation Plan (DIP) Format

### Structure and Content Guidelines

1. **Phased Approach**
   - Organize implementation into logical phases (e.g., Analysis, Setup, Core Implementation, Testing)
   - Each phase should have a clear purpose and estimated time requirement
   - Example: `## Phase 1: Setup and Analysis (2 hours)`

2. **Task Breakdown**
   - Break down each phase into specific, actionable tasks
   - Use hierarchical structure with H3 headings for tasks within phases
   - Example: `### Task 1.1: Review Existing Implementation`

3. **Checkbox Format**
   - Every task should start with an empty checkbox: `- [ ]`
   - As work progresses, update completed tasks with green checkmarks: `- [x]`
   - This provides clear visual indication of progress

4. **Task Descriptions**
   - Tasks should be specific and actionable
   - Clearly state what needs to be done, not how to do it
   - Focus on the required outcome, not the implementation details
   - Example: `- [ ] Analyze the AgentPanel.tsx component to identify how client creation is implemented`

5. **File References**
   - Reference specific files that need to be modified
   - Indicate what changes are needed without including code examples
   - Example: `- [ ] Update components/crm/AgentPanel.tsx to add the new knowledge creation handler`

6. **Investigation Steps**
   - Include explicit steps for necessary investigation and analysis
   - Example: `- [ ] Review how the React Query cache invalidation is triggered in existing components`

7. **Verification Steps**
   - Include explicit steps to verify that changes work as expected
   - Example: `- [ ] Test that a knowledge item created through the agent appears in the knowledge list`

8. **Avoid Code Examples**
   - DIPs should not contain code examples or implementations
   - Focus on what needs to be done, not the specific code to implement it
   - Implementation details should be determined during the development process

### Example Format

```markdown
## Phase 1: Analysis and Preparation (2 hours)

### Task 1.1: Analyze Current Implementation
- [ ] Review ComponentA.tsx to understand the existing pattern
- [ ] Identify dependency relationships between components
- [ ] Document the current data flow

### Task 1.2: Environment Setup
- [ ] Create branch feature/xyz from main
- [ ] Configure local environment for testing
- [ ] Set up logging for debugging
```

### Updating DIP During Implementation

1. **Progress Tracking**
   - Update empty checkboxes `- [ ]` to green checkmarks `- [x]` as tasks are completed
   - This creates a clear visual record of progress

2. **Task Adjustments**
   - If implementation reveals the need for additional tasks, add them to the DIP
   - Mark any obsolete tasks as such rather than removing them
   - Document reasons for significant deviations from the plan

3. **Issue Documentation**
   - Document any challenges or unexpected issues encountered
   - Include lessons learned for future reference

## Learning Process

### Capturing Lessons Learned

When mistakes or learning opportunities occur:

1. **Document the Learning**
   - Create or update memory.md in agent-workspace
   - Clearly describe what happened
   - Explain the correct approach
   - Note any patterns to watch for

2. **Apply Learnings**
   - Actively incorporate lessons in future work
   - Reference previous learnings when applicable
   - Update processes to prevent similar issues

## Completion Verification

Upon successful initialization, Jarvis should:

1. Deliver a voice response confirming development workflow initialization is complete
2. Indicate readiness to proceed to the next stage
3. Pass on loaded context to the next stage

## Next Steps

After this initialization stage is complete, the unified workflow continues with:

1. **Notify Completion**: Provide voice confirmation of development workflow initialization completion
2. **Prepare for Stage 3**: Signal readiness to proceed to Knowledge Assistant Project Initialization
3. **Pass Context**: Maintain all loaded context for subsequent initialization stages

## Git Account Management

### Knowledge Assistant Project Git Configuration

The Knowledge Assistant project must use the following Git account:
- **Username**: erezgit
- **Email**: erezfern@gmail.com

### Git Configuration Verification

Before making any commits or pushes to the Knowledge Assistant project:

1. **Verify Git Configuration**
   ```bash
   git config user.name
   git config user.email
   ```

2. **Set Correct Configuration** (if needed)
   ```bash
   git config user.name "erezgit"
   git config user.email "erezfern@gmail.com"
   ```

3. **Repository-Specific Configuration** (recommended)
   ```bash
   # Run these commands in the knowledge-assistant directory
   git config --local user.name "erezgit"
   git config --local user.email "erezfern@gmail.com"
   ```

### Working with Multiple Cursor Windows

When working with multiple projects across different Cursor windows:

1. **Always Verify Repository Context**
   - Check the current directory path to confirm which project you're in
   - Verify Git configuration matches the project requirements
   - Confirm remote repository URLs are correct

2. **Pre-Commit Checks**
   - Always run `git config user.email` before committing to confirm identity
   - Review changed files to ensure they belong to the intended project
   - Verify remote URL with `git remote -v` before pushing

3. **Separate Terminal Sessions**
   - Use dedicated terminal sessions for each project
   - Set clear window titles or labels to identify project context

### Remote Repository Management

1. **Verify Remote URLs**
   ```bash
   git remote -v
   ```

2. **Update Remote URL** (if incorrect)
   ```bash
   git remote set-url origin https://github.com/erezgit/knowledge-assistant.git
   ```

3. **Push Confirmation Process**
   - Always check the repository name in the push output
   - Note any repository move messages
   - Verify changes appear in the correct GitHub repository after pushing

## Implementation Notes

- This procedure should be followed for all development tasks
- Adaptations may be necessary for project-specific requirements
- All documentation should maintain a consistent voice and style
- Prioritize clarity and correctness over speed
- Always verify changes in the correct repository before finalizing 