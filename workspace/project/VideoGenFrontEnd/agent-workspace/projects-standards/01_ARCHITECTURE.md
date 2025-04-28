# Video Generation Frontend - Technical Specification

## Overview
A modern single-page application (SPA) built with React that enables users to generate videos from images. The application communicates with our Auth API Server at video-gen-back-end-erezfern.replit.app.

## System Architecture

### Core Technologies
- **Framework**: React with TypeScript
- **State Management**: React Context for auth state
- **API Communication**: Fetch API with Bearer token
- **UI Framework**: Shadcn/UI (React components built on Radix UI and Tailwind)

### Key Features
- User authentication (login/signup)
- Protected dashboard interface
- Video generation requests
- Status monitoring for generation jobs

> **Note**: For detailed information about the project's directory structure and organization, please refer to [02-PROJECT_STRUCTURE.md](./02-PROJECT_STRUCTURE.md).

## Shell/Layout Architecture

### Application Shell Structure
The application uses a shell architecture pattern for consistent layout and navigation:

```
shell/
├── MainShell.tsx        # Main application layout wrapper
├── Sidebar.tsx          # Navigation sidebar component
└── components/          # Shell-specific components
    ├── Header.tsx       # Application header
    └── Footer.tsx       # Application footer
```

### Shell Responsibilities
- **MainShell**: 
  - Provides the base layout structure
  - Handles responsive layout management
  - Controls sidebar state (open/closed)
  - Manages layout-level animations

- **Sidebar**:
  - Navigation menu management
  - User profile section
  - Collapsible navigation items
  - Active route highlighting

### Layout Features
- Responsive design with mobile-first approach
- Collapsible sidebar for better space utilization
- Consistent spacing and layout across all pages
- Smooth transitions between routes

## CSS Strategy

### Styling Approach
Our application uses a hybrid styling approach:

1. **Tailwind CSS**
   - Utility-first CSS framework
   - Used for rapid UI development
   - Consistent spacing and colors
   - Responsive design utilities

2. **CSS Modules**
   - Scoped CSS for component-specific styles
   - Prevents style conflicts
   - Used for complex component styles
   - Naming pattern: `[component].module.css`

3. **Theme System**
   - CSS custom properties for theming
   - Semantic color tokens
   - Typography scale
   - Spacing and layout system
   - Component-specific theme variables

### Style Organization
```
src/styles/
├── global.css                # Global styles and Tailwind imports
├── theme/
│   ├── index.css            # Theme system entry point
│   ├── colors.css           # Color system
│   ├── typography.css       # Typography system
│   ├── layout.css           # Spacing and layout
│   └── animations.css       # Animation system
├── base/
│   ├── reset.css           # CSS reset
│   └── defaults.css        # Base element styles
└── utils/
    └── mixins.css          # Reusable style patterns
```

### Theme Management

#### Core Systems

1. **Color System**
We use HSL color values for better control:
```css
/* Base colors */
--background: 222.2 84% 4.9%;
--foreground: 210 40% 98%;
--card: 222.2 84% 4.9%;
--primary: 210 40% 98%;

/* Usage */
.element {
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
}
```

2. **Typography System**
```css
/* Scale */
--font-size-base: 1rem;
--line-height-base: 1.5;
--font-family-system: system-ui, -apple-system, ...;
```

3. **Layout System**
Our spacing scale follows a 4px base unit:
```css
/* Spacing */
--spacing-1: 0.25rem;  /* 4px */
--spacing-2: 0.5rem;   /* 8px */
--spacing-4: 1rem;     /* 16px */

/* Containers */
--container-sm: 640px;
--container-md: 768px;
--container-lg: 1024px;
```

#### Component Theming
We provide themed base components with consistent styling:
```css
/* Base components */
.btn {
  --btn-padding-x: var(--spacing-4);
  --btn-padding-y: var(--spacing-2);
  padding: var(--btn-padding-y) var(--btn-padding-x);
  border-radius: var(--radius-md);
}

/* Interactive states */
.hover\:elevated {
  transition: transform 0.2s, box-shadow 0.2s;
  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }
}

/* Focus states */
.focus-ring {
  --focus-ring-color: hsl(var(--ring));
  outline: none;
  &:focus-visible {
    box-shadow: 0 0 0 2px var(--focus-ring-color);
  }
}
```

### Best Practices

1. **Semantic Naming**
   - Use intention-based names (e.g., `--primary` over `--blue`)
   - Follow component-specific naming patterns

2. **Scale Adherence**
   - Use spacing variables instead of arbitrary values
   - Follow the type scale for font sizes

3. **Dark Mode**
   - Test components in both themes
   - Use HSL color values for consistency

4. **Performance**
   - Minimize style recalculations
   - Utilize CSS layers appropriately

### CSS Modules Usage
- One module per component when needed
- Used for complex animations
- Component-specific custom properties
- Dynamic style composition

## API Integration

### Backend Service
- **Base URL**: https://video-gen-back-end-erezfern.replit.app
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Authentication**: Bearer token

### API Structure

#### Resource-Based URL Pattern
All API endpoints follow a standardized resource-based pattern:
```typescript
// Standard URL Patterns
/[resource]                    // Collection operations (GET, POST)
/[resource]/:id               // Instance operations (GET, PUT, DELETE)
/[resource]/:id/[action]      // Special actions on instance
```

#### Service Endpoints

```typescript
interface APIEndpoints {
  // Project Management
  projects: {
    collection: '/projects',              // GET: List all, POST: Create new
    instance: '/projects/:id',            // GET, PUT, DELETE specific project
  },
  
  // Image Management
  images: {
    collection: '/images',                // GET: List all images
    upload: '/images/upload',             // POST: Upload new image
    status: '/images/:id/status',         // GET: Check upload status
  },
  
  // Video Management (upcoming)
  videos: {
    collection: '/videos',                // GET: List all videos
    generate: '/videos/generate',         // POST: Start video generation
    status: '/videos/:id/status',         // GET: Check generation status
  }
}
```

#### Response Structure
All API responses follow a consistent structure:
```typescript
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;                   // Present on success
  error?: {                   // Present on error
    code: ServiceErrorCode;
    message: string;
  };
}

type ServiceErrorCode =
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'UNAUTHORIZED'
  | 'SERVER_ERROR';
```

### Available Endpoints

#### Projects API
```typescript
// List Projects
GET /projects
Response: ServiceResponse<Project[]>

// Get Project
GET /projects/:id
Response: ServiceResponse<Project>

// Create Project
POST /projects
Body: CreateProjectInput
Response: ServiceResponse<Project>

// Update Project
PUT /projects/:id
Body: UpdateProjectInput
Response: ServiceResponse<Project>

// Delete Project
DELETE /projects/:id
Response: ServiceResponse<void>
```

#### Images API
```typescript
// Upload Image
POST /images/upload
Body: FormData (image: File, projectId?: string)
Response: ServiceResponse<ImageUploadResult>

// Check Upload Status
GET /images/:id/status
Response: ServiceResponse<UploadStatusResponse>
```

#### Videos API (upcoming)
```typescript
// Generate Video
POST /videos/generate
Body: {
  projectId: string;
  prompt: string;
}
Response: ServiceResponse<VideoGenerationResult>

// Check Generation Status
GET /videos/:id/status
Response: ServiceResponse<VideoGenerationStatus>
```

### Error Responses

#### Standard Error Codes
```typescript
// 404 Not Found
{
  status: 'error',
  error: {
    code: 'NOT_FOUND',
    message: 'Resource not found'
  }
}

// 401 Unauthorized
{
  status: 'error',
  error: {
    code: 'UNAUTHORIZED',
    message: 'Authentication required'
  }
}

// 400 Validation Error
{
  status: 'error',
  error: {
    code: 'VALIDATION_ERROR',
    message: 'Invalid input data'
  }
}

// 500 Server Error
{
  status: 'error',
  error: {
    code: 'SERVER_ERROR',
    message: 'Internal server error'
  }
}
```

### Rate Limiting
```typescript
// 429 Too Many Requests
{
  status: 'error',
  error: {
    code: 'RATE_LIMIT',
    message: 'Too many requests, please try again later'
  }
}
```

### Authentication Flow
1. **Token Storage**
   - Tokens are stored in sessionStorage for session persistence
   - Access token and refresh token managed by TokenService
   - Benefits:
     - Persists during browser session
     - Cleared when tab/window closes
     - Secure against XSS attacks
   - Implementation:
   ```typescript
   class TokenService {
     private static readonly ACCESS_TOKEN_KEY = 'access_token';
     private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
     private static readonly EXPIRES_IN_KEY = 'expires_in';

     storeTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
       sessionStorage.setItem(TokenService.ACCESS_TOKEN_KEY, accessToken);
       sessionStorage.setItem(TokenService.REFRESH_TOKEN_KEY, refreshToken);
       sessionStorage.setItem(TokenService.EXPIRES_IN_KEY, expiresIn.toString());
     }

     getAccessToken(): string | null {
       return sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
     }

     clearTokens(): void {
       sessionStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
       sessionStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
       sessionStorage.removeItem(TokenService.EXPIRES_IN_KEY);
     }
   }
   ```

2. **Authentication Process**
   ```typescript
   // 1. User logs in through Supabase
   const { data, error } = await supabase.auth.signInWithPassword({
     email,
     password
   });

   // 2. On successful login, set token in API client
   if (data.session) {
     api.setToken(data.session.access_token);
   }

   // 3. All subsequent service calls use API client
   class ImageUploadService {
     private api = ApiService.getInstance();

     async uploadImage(file: File) {
       // API client automatically includes token
       return this.api.post('/api/upload', formData);
     }
   }
   ```

3. **Error Handling**
   - 401 errors clear token and redirect to login
   - Services focus on business logic
   - API client handles auth errors consistently

4. **Security Benefits**
   - Single source of truth for auth state
   - No token persistence reduces security risks
   - Clear separation of concerns
   - Simple and predictable auth flow

## Service Architecture

### Overview
The application follows a centralized service architecture pattern with a single API client serving all services. This ensures consistent authentication and API communication across the application.

### Service Implementation Pattern

All services in the application MUST follow this standardized pattern:

1. **Core Structure**
```typescript
export class ServiceName extends BaseService {
  private static instance: ServiceName;

  private constructor() {
    super();
    this.log('constructor', 'ServiceName initialized');
  }

  public static getInstance(): ServiceName {
    if (!ServiceName.instance) {
      ServiceName.instance = new ServiceName();
    }
    return ServiceName.instance;
  }
}
```

2. **Method Pattern**
```typescript
async methodName(params): Promise<ServiceResponse<ResultType>> {
  // Start with logging
  this.log('methodName', { params });
  
  try {
    // Optional: Pre-request validation if needed
    this.validateInput?.(params);

    // Core request handling using handleRequest
    return this.handleRequest<ResultType>(() =>
      this.api.method('/endpoint', data)
    );
  } catch (error) {
    // Log error
    this.log('methodName error', { error }, 'error');
    
    // Standard error handling
    if (error instanceof ServiceError) {
      return {
        status: 'error',
        error: {
          code: error.code,
          message: error.message
        }
      };
    }
    return {
      status: 'error',
      error: {
        code: 'UNKNOWN_ERROR',
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      }
    };
  }
}
```

3. **Response Types**
```typescript
// All service responses must use this structure
interface ServiceResponse<T> {
  status: 'success' | 'error';
  data?: T;
  error?: {
    code: ServiceErrorCode;
    message: string;
  };
}
```

4. **Additional Patterns** (when needed)

a. **Pre-request Validation**
```typescript
protected validateInput(input: InputType): void {
  // Throw ServiceError for validation failures
  if (!isValid(input)) {
    throw new ServiceError(
      'Validation message',
      'VALIDATION_ERROR'
    );
  }
}
```

b. **Status Checking**
```typescript
async checkStatus(id: string): Promise<ServiceResponse<StatusType>> {
  this.log('checkStatus', { id });
  return this.handleRequest<StatusType>(() =>
    this.api.get(`/endpoint/${id}/status`)
  );
}
```

### Service Categories

Our application has three main types of services:

1. **Data Services** (e.g., ProjectService)
   - Focus on CRUD operations
   - Handle JSON data
   - Simple request/response patterns
   - Example: ProjectService

2. **File Handling Services** (e.g., ImageUploadService)
   - Handle file uploads
   - Include pre-upload validation
   - May include progress tracking
   - May include status polling
   - Example: ImageUploadService

3. **Process Services** (e.g., VideoGenerationService)
   - Initiate long-running processes
   - Include status polling
   - Handle multiple states
   - May include file handling
   - Example: VideoGenerationService (upcoming)

### Best Practices

1. **Service Implementation**
   - Always extend BaseService
   - Always use singleton pattern
   - Always use handleRequest for API calls
   - Always return ServiceResponse types
   - Always implement proper logging

2. **Error Handling**
   - Use ServiceError for known errors
   - Include appropriate error codes
   - Log all errors with context
   - Return standardized error responses

3. **Logging**
   - Log method entry with parameters
   - Log significant state changes
   - Log errors with full context
   - Use appropriate log levels

4. **API Communication**
   - Use the centralized API client
   - Never implement custom HTTP calls
   - Handle all responses consistently
   - Follow endpoint naming conventions

5. **State Management**
   - Keep services stateless
   - Use hooks for UI state
   - Pass state through parameters
   - Return new state in responses

## Environment Configuration
```
REACT_APP_API_URL=https://video-gen-back-end-erezfern.replit.app
```

## Security Considerations
1. **Token Storage**
   - Tokens are stored in sessionStorage for session persistence
   - Access token and refresh token managed by TokenService
   - Benefits:
     - Persists during browser session
     - Cleared when tab/window closes
     - Secure against XSS attacks
   - Implementation:
   ```typescript
   class TokenService {
     private static readonly ACCESS_TOKEN_KEY = 'access_token';
     private static readonly REFRESH_TOKEN_KEY = 'refresh_token';
     private static readonly EXPIRES_IN_KEY = 'expires_in';

     storeTokens(accessToken: string, refreshToken: string, expiresIn: number): void {
       sessionStorage.setItem(TokenService.ACCESS_TOKEN_KEY, accessToken);
       sessionStorage.setItem(TokenService.REFRESH_TOKEN_KEY, refreshToken);
       sessionStorage.setItem(TokenService.EXPIRES_IN_KEY, expiresIn.toString());
     }

     getAccessToken(): string | null {
       return sessionStorage.getItem(TokenService.ACCESS_TOKEN_KEY);
     }

     clearTokens(): void {
       sessionStorage.removeItem(TokenService.ACCESS_TOKEN_KEY);
       sessionStorage.removeItem(TokenService.REFRESH_TOKEN_KEY);
       sessionStorage.removeItem(TokenService.EXPIRES_IN_KEY);
     }
   }
   ```

2. **Request Security**
   - Include Authorization header for all protected routes
   - Never send tokens in URL parameters
   - Implement request timeout
   - Add CSRF protection if needed
   - Validate tokens before each request
   - Handle token refresh automatically

3. **Error Handling**
   - Handle token expiration gracefully
   - Implement retry logic with backoff
   - Monitor rate limits
   - Log authentication failures
   - Provide user-friendly error messages
   - Implement automatic token refresh on 401 responses

4. **Session Management**
   - Maintain session state in memory
   - Persist authentication tokens in sessionStorage
   - Implement proper session cleanup on logout
   - Handle multiple tabs/windows gracefully
   - Provide session timeout warnings
   - Allow session refresh when needed

5. **General Security**
   - Implement CORS properly
   - Sanitize all user inputs
   - Protect against XSS
   - Handle session timeouts
   - Use HTTPS only
   - Implement content security policy

## Future Enhancements
- Remember me functionality
- Password reset flow
- Profile management
- Enhanced error handling
- Loading states and feedback

## Styling & Theme

### Color Palette
```css
/* Base colors */
--black: #020817;      /* Darkest background */
--slate-900: #0f172a;  /* Main background */
--slate-800: #1e293b;  /* Secondary background */
--slate-700: #334155;  /* Tertiary background */
--slate-600: #475569;  /* Subtle borders */
--slate-500: #64748b;  /* Muted text */
--slate-400: #94a3b8;  /* Secondary text */
--slate-100: #f1f5f9;  /* Primary text */

/* Semantic colors */
--background: var(--black);
--card: var(--slate-900);
--popover: var(--slate-900);
--primary: var(--slate-100);
--secondary: var(--slate-800);
--muted: var(--slate-800);
--accent: var(--slate-800);
--border: var(--slate-600);

/* Text colors */
--text-primary: var(--slate-100);
--text-secondary: var(--slate-400);
--text-muted: var(--slate-500);

/* States */
--hover: var(--slate-700);
--active: var(--slate-600);
--focus-ring: var(--slate-500);
```

### Theme Configuration
- Dark theme by default
- Based on Shadcn/UI dark preset
- Consistent color naming for easier maintenance
- CSS variables for flexible theming

### UI Components
- Consistent dark mode styling across all components
- Subtle gradient effects for depth
- Minimal use of borders, separation through spacing and background colors
- Interactive elements with subtle hover states

## Coding Standards

### TypeScript Guidelines
- Strict TypeScript checking enabled
- Explicit type annotations for function parameters and returns
- Interface over Type where possible
- Proper type imports/exports
- No `any` types unless absolutely necessary

### Naming Conventions
- Components: PascalCase (e.g., `LoginForm.tsx`)
- Hooks: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- Utilities: camelCase (e.g., `formatDate.ts`)
- Interfaces: PascalCase with 'I' prefix (e.g., `IUser`)
- Types: PascalCase (e.g., `AuthResponse`)
- Constants: UPPER_SNAKE_CASE (e.g., `API_URL`)

### File Structure
- One component per file
- Component file structure:
  ```typescript
  // Imports
  import { ... } from '...';
  
  // Types/Interfaces
  interface IComponentProps { ... }
  
  // Component
  export function Component({ ... }: IComponentProps) { ... }
  
  // Styles (if needed)
  const styles = { ... }
  ```

### Component Guidelines
- Functional components only
- Props interface for every component
- Destructure props in component parameters
- Default exports for pages, named exports for components
- Keep components focused and small
- Extract reusable logic into custom hooks

### State Management
- Use React Context for global state
- Local state with useState for component-level state
- Custom hooks for reusable stateful logic
- Avoid prop drilling
- Document context providers and consumers

### Custom Hooks Architecture
Our application uses custom hooks to encapsulate and reuse stateful logic across components. This approach:

1. **State Logic Separation**
   - Isolates complex state management
   - Provides consistent state behavior
   - Enables easy testing of business logic
   - Reduces component complexity

2. **Core Hooks Categories**
   - **Authentication**: User session and permissions
   - **Form Management**: Form state and validation
   - **API Integration**: Data fetching and caching
   - **UI State**: Layout and theme management
   - **Feature-Specific**: Video generation workflow

3. **Hook Design Principles**
   - Single Responsibility: Each hook manages one aspect of functionality
   - Composable: Hooks can be combined for complex features
   - Stateful Logic Only: UI remains in components
   - Consistent Error Handling: Standard error patterns
   - TypeScript-First: Full type safety

4. **Common Hook Patterns**
   ```typescript
   // Authentication Hook Example
   function useAuth() {
     const [user, setUser] = useState<User | null>(null);
     const [loading, setLoading] = useState(true);

     // Authentication methods
     return { user, loading, login, logout };
   }

   // Form Hook Example
   function useForm<T>(initialState: T) {
     const [data, setData] = useState<T>(initialState);
     const [errors, setErrors] = useState<Record<keyof T, string>>({});

     // Form methods
     return { data, errors, handleChange, validate };
   }
   ```

### Error Handling
- Consistent error boundary usage
- Type-safe error objects
- Proper error logging
- User-friendly error messages

### Testing
- Manual testing approach
- Test scenarios documented in test plans
- Bug reporting through detailed logs
- User acceptance testing
- Cross-browser testing
- Mobile responsiveness testing

### Code Style
- ESLint + Prettier configuration
- 2 space indentation
- Single quotes for strings
- Semicolons required
- Max line length: 80 characters
- Trailing commas in multiline
- No console.logs in production code

### Documentation
- JSDoc comments for complex functions
- Inline comments for complex logic only when necessary

### Performance
- Lazy loading for routes
- Memoization where beneficial
- Bundle size monitoring
- Performance monitoring
- Image optimization

### Accessibility
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation support
- Color contrast compliance
- Screen reader compatibility

## Core Principles

1. **Instant Navigation (SPA)**
   - Application must feel instant with no perceptible loading between routes
   - Critical routes must be bundled with initial load
   - Only large or rarely accessed features should be lazy loaded
   - Route prefetching for anticipated user paths
   - No full page reloads during navigation

2. **Single Source of Truth**
   - Centralized state management
   - Consistent data flow
   - Predictable state updates

3. **Security First**
   - Protected routes and authentication
   - Secure data handling
   - Token management
   - XSS prevention

4. **Performance**
   - Optimized bundle sizes
   - Efficient resource loading
   - Minimal dependencies
   - Smart code splitting

## Performance Guidelines

### Route Loading Strategy
- **Initial Bundle**:
  - Core authentication components
  - Main dashboard
  - Frequently accessed routes
  - Navigation components
  - Common utilities

- **Lazy Loaded**:
  - Settings pages
  - Profile management
  - Advanced features
  - Large dependencies

### Navigation Performance
- Route prefetching on hover
- Preload critical assets
- Cache route components
- Maintain fluid UI during transitions

## Configuration Management Strategy

### Separation of Concerns

Our application uses a three-way separation of configuration concerns, each with its distinct responsibility:

1. **Deployment Environment Configuration** (.replit)
   - **Purpose**: Handle Replit-specific environment setup
   - **Responsibilities**:
     - Port forwarding and networking
     - Environment variables
     - Development server configuration
     - Replit-specific tooling setup
   - **Example**:
     ```toml
     run = "npm run dev"
     [[ports]]
     localPort = 3000
     ```

2. **Build and Development Configuration** (vite.config.js)
   - **Purpose**: Handle application bundling and development
   - **Responsibilities**:
     - Module bundling
     - Development server settings
     - Asset handling
     - Path aliases
     - Build optimizations
   - **Does NOT Handle**:
     - Environment-specific settings
     - Deployment configurations

3. **Package Management** (package.json)
   - **Purpose**: Dependency and script management
   - **Responsibilities**:
     - Package dependencies
     - Development dependencies
     - NPM scripts
     - Project metadata
   - **Does NOT Handle**:
     - Environment configurations
     - Build settings

### Configuration Hierarchy

1. **Top Level**: Deployment Environment (.replit)
   - Has final say on environment settings
   - Controls how the application runs in Replit
   - Overrides take precedence

2. **Middle Level**: Build Configuration (vite.config.js)
   - Handles how the application is built
   - Defers to environment settings
   - Focuses on bundling and development

3. **Base Level**: Package Management (package.json)
   - Fundamental project setup
   - Provides dependencies and scripts
   - Most generic configuration

### Best Practices

1. **Maintain Clear Boundaries**
   - Each configuration file should stick to its responsibilities
   - Avoid duplicating settings across files
   - When in doubt, prefer environment configuration

2. **Configuration Precedence**
   - Environment settings (.replit) take precedence
   - Build settings (vite.config.js) adapt to environment
   - Package settings (package.json) provide the foundation

3. **Avoid Cross-Configuration**
   - Don't override environment settings in build config
   - Keep package.json focused on dependencies
   - Let each tool do its job

### Common Pitfalls to Avoid

1. **Port Configuration Conflicts**
   - Always let .replit handle port settings
   - Don't hardcode ports in vite.config.js
   - Use environment variables when needed

2. **Module System Conflicts**
   - Stick to one module system (ESM or CommonJS)
   - Don't mix require() and import
   - Follow Replit's preferred patterns

3. **Environment Variable Confusion**
   - Define environment variables in .replit
   - Access them in other configs when needed
   - Don't duplicate environment settings

### Environment Management

Our application automatically manages development and production environments following these principles:

1. **Automatic Environment Detection**
   - Development mode is automatic when running dev server
   - Production mode is automatic during build and deployment
   - No manual environment setting needed

2. **Environment Triggers**
   ```
   npm run dev    → NODE_ENV=development
   npm run build  → NODE_ENV=production
   ```

3. **Tool-Specific Behavior**
   - Vite handles environment-specific optimizations
   - Replit handles deployment-specific settings
   - Build tools adjust based on environment

4. **Environment Variables Flow**
   ```
   Development:
   npm run dev → Vite → NODE_ENV=development
   
   Production:
   Replit deployment → npm run build → NODE_ENV=production
   ```

### Best Practices for Environment Management

1. **Let Tools Handle Environments**
   - Don't manually set NODE_ENV
   - Let npm scripts trigger correct environment
   - Trust deployment process for production

2. **Environment-Specific Features**
   - Development: Hot reloading, detailed errors
   - Production: Optimized builds, minimal logging
   - Testing: Isolated environment for tests

3. **Configuration Precedence**
   - Tool defaults take priority
   - Deployment process sets production
   - Development is the default for local

## Video Data Flow Architecture

### Overview
The video data in our application flows through a chain of components and hooks, starting from the project data fetched from the backend. The data is stored in Supabase and accessed through their storage API.

### Data Flow
1. **Project Data Fetching**
   - `useProjects` hook fetches project data from `/projects` endpoint
   - Response structure:
   ```typescript
   interface ProjectsResponse {
     status: "success";
     data: Project[];
   }
   ```
   - Each project contains:
   ```typescript
   interface Project {
     id: string;                 // e.g. "7f7ab542-3baf-46e6-b1a0-767ded520168"
     prompt: string;             // e.g. "yellow silky boxes"
     imageUrl: string;           // Supabase storage URL for project image
     videos: {
       id: string;              // e.g. "d7bbf606-5a2d-4033-b201-91d1bf87654b"
       url: string;             // Supabase storage URL for video
     }[];
   }
   ```

2. **Storage URLs**
   - Images are stored at: `https://xocrylrrpfnbzjppszes.supabase.co/storage/v1/object/public/projects/{user-id}/projects/{project-id}/{filename}`
   - Videos are stored at: `https://xocrylrrpfnbzjppszes.supabase.co/storage/v1/object/public/videos/videos/{video-id}/output.mp4`

3. **Video Data Extraction**
   - `useVideo` hook processes project data:
     - Flattens videos from all projects using `flatMap`
     - Filters for videos with valid URLs
     - Maps to standardized video format:
     ```typescript
     {
       id: string;              // Original video ID from Supabase
       url: string;             // Full Supabase storage URL
       status: 'completed';     // Hardcoded for now
       createdAt: string;       // Generated timestamp
       duration: number;        // Default to 0
     }
     ```

### Implementation Details
```typescript
// Example project data structure from Supabase
const exampleProject = {
  id: "7f7ab542-3baf-46e6-b1a0-767ded520168",
  imageUrl: "https://xocrylrrpfnbzjppszes.supabase.co/storage/v1/object/public/projects/.../DAB-CAI-SUN-005-IM1.png",
  prompt: "yellow silky boxes",
  videos: [
    {
      id: "d7bbf606-5a2d-4033-b201-91d1bf87654b",
      url: "https://xocrylrrpfnbzjppszes.supabase.co/storage/v1/object/public/videos/videos/.../output.mp4"
    }
  ]
};
```

### Data Transformation
1. **Project Level**
   - Projects are stored in Supabase with unique IDs
   - Each project has an associated image and optional prompt
   - Projects can have zero or more videos
   - Images and videos are stored in separate Supabase storage buckets

2. **Video Level**
   - Videos are stored in a dedicated videos bucket
   - Each video has a standardized output.mp4 filename
   - Videos are organized by video ID in storage
   - URLs are fully qualified Supabase storage URLs

3. **Display Level**
   - Videos are presented in a table format
   - Each video maintains reference to its source URL
   - Videos are played directly from Supabase storage
   - Video previews are loaded on demand

### Authentication and Access
1. **Supabase Session**
   - Authentication handled by Supabase GoTrue client
   - Session includes:
     - Access token (JWT)
     - Refresh token
     - Token expiration (3600 seconds)
   - Session is automatically refreshed when needed

2. **Storage Access**
   - Public bucket policy allows direct video access
   - URLs are publicly accessible once generated
   - No additional authentication needed for video playback

### Best Practices
1. **URL Handling**
   - Use complete Supabase storage URLs
   - Verify URL validity before display
   - Handle missing videos gracefully

2. **Performance**
   - Videos are streamed directly from Supabase storage
   - Lazy loading of video content
   - Minimal processing in render cycle

3. **Error Handling**
   - Handle missing videos in projects
   - Validate storage URLs
   - Provide fallback for failed video loads

