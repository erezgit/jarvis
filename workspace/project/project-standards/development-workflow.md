# Development Workflow

This document outlines our development workflow, from feature planning to deployment.

## Feature Development Lifecycle

1. **Planning**
   - Identify the business domain(s) the feature belongs to
   - Determine requirements and scope
   - Create tickets with clear acceptance criteria

2. **Implementation**
   - Follow domain-driven architecture for new features
   - Maintain legacy patterns when modifying existing code
   - Write tests according to testing standards

3. **Code Review**
   - Submit PR with comprehensive description
   - Address review feedback
   - Ensure all checks pass before merging

4. **Deployment**
   - Merge to main branch
   - Verify in staging environment
   - Monitor after production deployment

## Pull Request Process

### PR Title Format

Use conventional commit format:
```
<type>(<scope>): <description>

Examples:
feat(billing): add credit purchase confirmation
fix(chat): resolve message loading issue
refactor(user): improve profile data loading
```

### PR Description

Include:
- Summary of changes
- Link to related ticket
- Testing approach
- Screenshots (if applicable)
- Any deployment considerations

### PR Checklist

```
- [ ] Code follows project coding standards
- [ ] Tests added or updated for changes
- [ ] Documentation updated if necessary
- [ ] UI changes include screenshots in the PR
- [ ] Changes maintain or improve accessibility
- [ ] Performance impact considered
```

## Code Review Guidelines

### Review Checklist

**Architecture**
- [ ] Follows domain-driven architecture for new features
- [ ] Maintains consistency with surrounding code for existing features
- [ ] Respects domain boundaries and communication patterns
- [ ] Uses appropriate patterns for the feature's complexity

**Code Quality**
- [ ] Follows coding standards
- [ ] Is maintainable and readable
- [ ] Error handling is appropriate
- [ ] Edge cases are considered
- [ ] No unnecessary complexity

**Testing**
- [ ] Unit tests for business logic and utilities
- [ ] Component tests for UI components
- [ ] Integration tests for critical flows
- [ ] Tests are reliable (not flaky)
- [ ] Edge cases and error scenarios covered

**Performance**
- [ ] No unnecessary re-renders
- [ ] Expensive operations are optimized
- [ ] Appropriate loading states
- [ ] Proper handling of large datasets

**Security**
- [ ] Input validation
- [ ] Authentication/authorization checks
- [ ] No sensitive data exposure
- [ ] No vulnerable dependencies

### Constructive Feedback

- Be specific and clear
- Focus on the code, not the person
- Suggest alternative approaches
- Explain reasoning behind feedback
- Acknowledge good solutions

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <description>

Types:
- feat: New feature
- fix: Bug fix
- docs: Documentation changes
- style: Formatting changes
- refactor: Code changes that neither fix bugs nor add features
- test: Adding or updating tests
- chore: Maintenance tasks
```

### Best Practices

- Keep commits focused on a single change
- Write clear, descriptive messages
- Reference ticket numbers when applicable
- Separate refactoring from feature changes
- Use present tense ("add feature" not "added feature")

## Branching Strategy

### Branch Naming

```
<type>/<ticket-number>-<short-description>

Examples:
feature/BILL-123-credit-purchase
bugfix/CHAT-456-message-loading
refactor/USER-789-profile-data
```

### Workflow

1. Create feature branch from main
2. Make changes with regular commits
3. Rebase on main before PR if needed
4. Squash commits when merging to main (if appropriate)
5. Delete branch after merging

## Testing Strategy

### Testing Requirements

- **80% code coverage** minimum for new code
- **Unit tests** for utilities and business logic
- **Component tests** for UI components
- **Integration tests** for critical user flows

### Test-Driven Development (Recommended)

1. Write failing test(s) for the feature/fix
2. Implement code to make tests pass
3. Refactor while ensuring tests stay green
4. Repeat for next slice of functionality 