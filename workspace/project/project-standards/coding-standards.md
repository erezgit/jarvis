# Coding Standards

This document outlines the essential coding standards, patterns, and guidelines for our project.

## Core Principles

- **Readability**: Write clear, self-documenting code
- **Consistency**: Follow established patterns
- **Simplicity**: Prefer simple solutions over complex ones
- **Maintainability**: Write code that's easy to change

## TypeScript Guidelines

### Types and Interfaces

```typescript
// Define clear, descriptive types
interface UserProfile {
  id: string;
  name: string;
  email: string;
  credits: number;
  freeMinutes: number;
  createdAt: Date;
}

// Use function type annotations
function getUserById(id: string): Promise<UserProfile> {
  // Implementation
}

// Avoid any when possible
function processData(data: unknown): void {
  if (typeof data === 'string') {
    // Type-safe operation on string
  }
}
```

### Type Safety

- Use TypeScript's type system to prevent runtime errors
- Avoid `any` type unless absolutely necessary
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Use type guards to narrow types when needed

## React Guidelines

### Components

- Use functional components with hooks
- Keep components focused on a single responsibility
- Extract complex logic into custom hooks
- Follow naming conventions:
  - Components: `PascalCase` 
  - Hooks: `useNounVerb`
  - Utilities: `camelCase`

```tsx
// Good component example
function UserProfile({ userId }: { userId: string }) {
  const { user, isLoading, error } = useUser(userId);
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error.message} />;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <p>{user.email}</p>
      </CardContent>
    </Card>
  );
}
```

### Hooks

- Custom hooks should encapsulate reusable logic
- Follow React Hook rules (top-level calls, consistent order)
- Use dependency arrays correctly in `useEffect`, `useMemo`, etc.

```tsx
// Good hook example
function useUserCredits(userId: string) {
  const [credits, setCredits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    let isMounted = true;
    
    async function fetchCredits() {
      try {
        setIsLoading(true);
        const data = await api.getUserCredits(userId);
        if (isMounted) {
          setCredits(data.credits);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error fetching credits:", error);
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchCredits();
    return () => { isMounted = false; };
  }, [userId]);
  
  return { credits, isLoading };
}
```

## Styling Guidelines

- Use Tailwind CSS for component styling
- Follow naming conventions for CSS classes if needed
- Avoid inline styles except for dynamic values
- Use design tokens/themes for colors and spacing

```tsx
// Good styling example
function Button({ variant = "primary", children }) {
  const baseStyles = "px-4 py-2 rounded font-medium";
  const variantStyles = {
    primary: "bg-blue-500 text-white hover:bg-blue-600",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    danger: "bg-red-500 text-white hover:bg-red-600"
  };
  
  return (
    <button className={`${baseStyles} ${variantStyles[variant]}`}>
      {children}
    </button>
  );
}
```

## Testing Requirements

### Minimum Testing Standards

- **Unit Tests**: Required for utility functions and hooks
- **Component Tests**: Required for shared/reusable components
- **Integration Tests**: Required for critical user flows
- **Test Coverage**: Aim for 80% code coverage

### Test Structure

```tsx
// Good test example
describe('UserProfile', () => {
  it('displays loading state initially', () => {
    render(<UserProfile userId="123" />);
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });
  
  it('displays user information when loaded', async () => {
    // Mock API response
    jest.spyOn(api, 'getUser').mockResolvedValue({
      id: '123',
      name: 'John Doe',
      email: 'john@example.com'
    });
    
    render(<UserProfile userId="123" />);
    
    // Wait for data to load
    expect(await screen.findByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
  });
});
```

## Code Organization

### File Structure

- One component per file
- Group related files in directories
- Use index files for exports
- Co-locate tests with implementation files

```
components/
├── Button/
│   ├── Button.tsx
│   ├── Button.test.tsx
│   └── index.ts
└── Card/
    ├── Card.tsx
    ├── CardHeader.tsx
    ├── CardContent.tsx
    ├── Card.test.tsx
    └── index.ts
```

### Import/Export Patterns

```typescript
// Prefer named exports for most utilities
export function formatDate(date: Date): string {
  // Implementation
}

// Use default exports for components
export default function Button({ children }: { children: React.ReactNode }) {
  // Implementation
}

// Use index files to simplify imports
// index.ts
export * from './Button';
export * from './Card';
```

## Error Handling

- Use try/catch for async operations
- Provide meaningful error messages
- Handle expected errors gracefully
- Use error boundaries for unexpected errors in React

```typescript
try {
  await api.saveData(data);
} catch (error) {
  if (error instanceof NetworkError) {
    // Handle network errors
    showNotification("Connection error. Please try again.");
  } else if (error instanceof ValidationError) {
    // Handle validation errors
    showFieldErrors(error.fields);
  } else {
    // Handle unexpected errors
    console.error("Unexpected error:", error);
    showNotification("Something went wrong. Please try again.");
  }
}
```

## Performance Guidelines

- Memoize expensive calculations with `useMemo`
- Optimize callback functions with `useCallback`
- Use virtualization for long lists
- Implement proper loading states
- Lazy load components when appropriate

## API Interaction

- Use custom hooks for API calls
- Handle loading, success, and error states
- Cancel requests when components unmount
- Implement retry logic for transient failures

## Security Considerations

- Validate all user inputs
- Never trust client-side data
- Use authentication tokens properly
- Sanitize data before rendering
- Follow OWASP security guidelines

## Documentation

- Document public APIs and complex functions
- Use JSDoc for function documentation
- Include examples for non-obvious usage
- Keep README files up to date

```typescript
/**
 * Formats a credit amount for display with proper currency symbol
 * @param amount - The credit amount to format
 * @param locale - The locale to use for formatting (default: 'en-US')
 * @returns Formatted credit string
 * 
 * @example
 * formatCredits(1000); // "1,000 Credits"
 * formatCredits(1000.5); // "1,000.5 Credits"
 */
export function formatCredits(amount: number, locale: string = 'en-US'): string {
  return `${amount.toLocaleString(locale)} Credits`;
}
```

## Commit Guidelines

- Write clear, descriptive commit messages
- Use conventional commits format:
  - `feat:` for new features
  - `fix:` for bug fixes
  - `docs:` for documentation
  - `refactor:` for refactoring
  - `test:` for tests
  - `chore:` for maintenance

## Code Review Checklist

Before submitting a PR, ensure your code:

- [ ] Follows project coding standards
- [ ] Has appropriate tests
- [ ] Handles error cases
- [ ] Is properly documented
- [ ] Has no console logs (except for errors)
- [ ] Is accessible and responsive
- [ ] Doesn't introduce performance issues

## Final Notes

These standards help us maintain a high-quality codebase. They are guidelines, not rigid rules; use your judgment when exceptions make sense, and discuss with the team when unsure. 