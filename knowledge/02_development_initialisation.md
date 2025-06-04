# Development Workflow Initialization

## Overview

This document defines the standardized workflow for initializing development processes, understanding ticket management, and preparing for implementation. It ensures that Jarvis has the necessary context about development workflows, ticket structure, and implementation methodologies before starting work.

## Development Workflow Principles

### Core Development Philosophy

- Take ownership of mistakes and learn from them
- Document learnings to build institutional knowledge
- Continuously improve processes and code quality
- Maintain clear communication with concise, insightful messages
- Follow structured workflows for predictable outcomes

### Communication Style Guidelines

All communications during development should follow these principles:
- **Concise**: Keep messages short and direct
- **Insightful**: Provide valuable technical observations
- **Educational**: Help improve understanding of concepts
- **Goal-oriented**: Focus on moving the project forward
- **Forward-looking**: Suggest next steps and options

For extended explanations, create markdown documents rather than lengthy messages.

## Ticket Structure and Management

### Ticket Directory Structure

Tickets follow a standardized structure:
```
agent-workspace/tickets/{ticket-number}-{short-name}/
```

Where:
- `{ticket-number}` follows sequential numbering (e.g., "017", "018")
- `{short-name}` is a brief hyphenated description (e.g., "design-board-grid-layout")

### Standard Documentation Files

Each ticket contains standardized documentation files:

1. **Product Requirements Document (01-PRD.md)**
   - Problem statement
   - Feature requirements
   - Success criteria
   - User impact
   - Constraints and considerations

2. **Architecture and Design Document (02-ADD.md)**
   - System components and relationships
   - Data flow
   - API design (if applicable)
   - Integration with existing architecture

3. **Detailed Implementation Plan (03-DIP.md)**
   - Step-by-step implementation tasks organized in phases
   - Each task must have an empty checkbox for tracking progress
   - Files to modify with specific changes required
   - Testing strategy with verification steps
   
   **Critical DIP Format Requirements:**
   - Always organize implementation in clear phases (Phase 1, Phase 2, etc.)
   - Each phase should contain specific tasks (Task 1.1, Task 1.2, etc.)
   - Each step must have an empty checkbox that will be updated to ✅ when completed
   - Include code snippets where appropriate showing exactly what needs to be changed
   - Always include a testing strategy section
   
   **Example DIP Format:**
   ```markdown
   ### Phase 1: Database Schema Updates
   
   #### Task 1.1: Review Existing Schema
   - [ ] Analyze current database schema in `lib/db/schema.ts`
   - [ ] Document entity relationships and constraints
   - [ ] Identify fields that need modification
   
   #### Task 1.2: Create Migration Script
   - [ ] Create new migration file in `lib/db/migrations/`
   - [ ] Implement schema changes:
   ```sql
   ALTER TABLE products ADD COLUMN description TEXT;
   ```
   - [ ] Test migration script in development environment
   
   ### Phase 2: Backend Implementation
   
   #### Task 2.1: Update API Endpoints
   - [ ] Modify product endpoint in `app/api/products/route.ts`
   - [ ] Add validation for new fields
   - [ ] Update tests in `app/api/products/tests/`
   ```
   
   **Progress Tracking:**
   - As tasks are completed, update empty checkboxes `[ ]` to green checkmarks `[✅]` or simply `✅`
   - Example of completed task:
   ```markdown
   #### Task 1.1: Review Existing Schema
   - ✅ Analyze current database schema in `lib/db/schema.ts`
   - ✅ Document entity relationships and constraints
   - ✅ Identify fields that need modification
   ```

### Ticket Lifecycle Management

Tickets follow a consistent lifecycle:
1. **Creation**: Opening with clear requirements
2. **Design**: Architecture and implementation planning 
3. **Implementation**: Executing the implementation plan
4. **Testing**: Verifying functionality
5. **Completion**: Final review and closure

## Implementation Methodologies

### Implementation Preparation

Before beginning implementation:
1. **Understand Requirements**: Fully comprehend the problem and solution
2. **Review Design**: Understand architectural implications
3. **Analyze Dependencies**: Identify related components and dependencies
4. **Plan Implementation**: Break down into manageable steps

### Implementation Process

The standard implementation process follows these steps:
1. **Review the Implementation Plan**
2. **Research Code Components**
3. **Execute Implementation Steps Sequentially**
4. **Track Progress** by updating checkboxes to ✅ as tasks are completed
5. **Document Changes and Lessons Learned**

### Development Rules

1. **Always seek confirmation before code development**
2. **Verify changes are made to project files, not documentation**
3. **Follow project coding standards and patterns**
4. **Make changes incrementally and verify at each step**
5. **Document any lessons learned or unexpected challenges**

## Documentation Standards

### Markdown Format Standards

Documentation follows these formatting standards:
- Clear hierarchical heading structure (H1, H2, H3)
- Code blocks with appropriate language specification
- Proper list formatting (ordered and unordered)
- Tables for structured data
- Emphasis and strong emphasis for important points

### Standard Document Sections

Standard documents include these core sections:
- Executive summary/overview
- Background/context
- Detailed content specific to document purpose
- Conclusion/next steps

## Git Repository Management

### Glassworks Website Project Git Configuration

The Glassworks website project must use the following Git account:
- **Username**: erezgw
- **Email**: erez@glassworks.io
- **Repository**: git@github.com:Glassworks-TLV/glassworks-website.git

### SSH Key Configuration

The Glassworks website repository requires SSH authentication with the following key:
- **Key Type**: RSA 4096-bit
- **Key Fingerprint**: `SHA256:Gh+SOA4i97UMLoEOnqrNxX/xw6G8/OKloRT8dFc0IGU`
- **Email**: erez@glassworks.io
- **Key Location**: `~/.ssh/glassworks_github_rsa`

#### SSH Key Setup Process

1. **Generate SSH Key** (if not already present):
   ```bash
   ssh-keygen -t rsa -b 4096 -C "erez@glassworks.io" -f ~/.ssh/glassworks_github_rsa
   ```

2. **Add Key to SSH Agent**:
   ```bash
   ssh-add ~/.ssh/glassworks_github_rsa
   ```

3. **Copy Public Key to GitHub**:
   ```bash
   cat ~/.ssh/glassworks_github_rsa.pub | pbcopy
   ```
   Then add to GitHub: Settings → SSH and GPG keys → New SSH key

4. **Verify Key Fingerprint**:
   ```bash
   ssh-keygen -l -f ~/.ssh/glassworks_github_rsa.pub
   ```
   Should return: `256 SHA256:Gh+SOA4i97UMLoEOnqrNxX/xw6G8/OKloRT8dFc0IGU erez@glassworks.io (RSA)`

### Repository Management for Glassworks Website

The glassworks-website directory has specific Git configuration requirements:

1. **Repository-Specific Configuration**
   - Always ensure the correct Git identity is configured for the Glassworks website repository
   - Git operations should be performed within the glassworks-website directory
   - Maintain proper separation between different project repositories

2. **Glassworks Website Repository Operations**
   ```bash
   # Always change into the glassworks-website directory first
   cd glassworks-website
   
   # Check status of the repository
   git status
   
   # Verify the correct git user configuration
   git config --local user.name  # Should return "erezgw"
   git config --local user.email  # Should return "erez@glassworks.io"
   
   # Configure the correct git user if needed
   git config --local user.name "erezgw"
   git config --local user.email "erez@glassworks.io"
   
   # Ensure the correct remote repository URL is set
   git remote -v
   # If incorrect, update to the correct URL:
   git remote set-url origin git@github.com:Glassworks-TLV/glassworks-website.git
   
   # Add, commit and push changes
   git add [files]
   git commit -m "Clear descriptive message"
   git push origin main
   ```

3. **Handling .env and Sensitive Files**
   - Never commit .env files or files containing sensitive information
   - The .gitignore already contains rules for .env files
   - Double-check file lists before committing to avoid accidental inclusion of sensitive data

### Git Configuration Verification

Before making any commits or pushes to the Glassworks website project:

1. **Verify Git Configuration**
   ```bash
   cd glassworks-website
   git config --local user.name
   git config --local user.email
   ```

2. **Set Correct Configuration** (if needed)
   ```bash
   cd glassworks-website
   git config --local user.name "erezgw"
   git config --local user.email "erez@glassworks.io"
   ```

### Remote Repository Management

1. **Verify Remote URLs**
   ```bash
   cd glassworks-website
   git remote -v
   ```

2. **Update Remote URL** (if incorrect)
   ```bash
   git remote set-url origin git@github.com:Glassworks-TLV/glassworks-website.git
   ```

3. **Push Confirmation Process**
   - Always check the repository name in the push output
   - Verify changes appear in the correct GitHub repository after pushing
   - Ensure you're not inadvertently pushing to a personal fork or different repository

4. **Branch Management**
   - Create feature branches for new development work
   - Use a clear naming convention: `feature/[description]` or `fix/[description]`
   - Ensure branches are created from and merged back to the correct base branch
   - Delete local branches after they've been merged to keep the repository clean

## Implementation Notes

- This initialization workflow must be completed before beginning any development work
- Understanding the ticket structure is essential for proper development context
- The initialization process ensures consistent approach to all development tasks
- All documentation should maintain consistent voice and style
- Development workflows should prioritize clarity and correctness over speed 
- DIPs must always include proper checkbox tracking for all implementation steps 