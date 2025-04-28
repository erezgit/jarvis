# Project Structure Documentation

This document outlines the organization and structure of the Video Generation Frontend project.

## Directory Structure Overview

```
video-gen-frontend/
├── 📁 docs/                                    # Project documentation
│   ├── 📄 01-ARCHITECTURE.md                   # System architecture documentation
│   ├── 📄 02-PROJECT_STRUCTURE.md              # This file
│   ├── 📄 03-BACKEND_INTEGRATION.md            # Backend integration details
│   ├── 📄 04-IMPLEMENTATION_PLAN.md            # Project implementation plan
│   ├── 📄 06-NEW_VIDEO_PAGE.md                 # New video page implementation
│   └── 📄 07-DEPLOYMENT_CONFIGURATION.md       # Deployment configuration guide
│
├── 📁 src/                                     # Source code
│   ├── 📁 components/                          # React components
│   │   ├── 📁 auth/                           # Authentication components
│   │   │   ├── 📄 LoginForm.tsx               # Login form component
│   │   │   ├── 📄 SignupForm.tsx              # Signup form component
│   │   │   └── 📄 ProtectedRoute.tsx          # Route protection component
│   │   ├── 📁 common/                         # Shared/reusable components
│   │   │   ├── 📄 PageHeader.tsx              # Page header component
│   │   │   ├── 📄 ErrorBoundary.tsx           # Error boundary component
│   │   │   └── 📄 Spinner.tsx                 # Loading spinner component
│   │   ├── 📁 video/                          # Video-related components
│   │   │   ├── 📄 VideoPlayer.tsx             # Video player component
│   │   │   ├── 📄 VideoCard.tsx               # Video card component
│   │   │   ├── 📄 VideoList.tsx               # Video list component
│   │   │   ├── 📄 ImageUpload.tsx             # Image upload component
│   │   │   ├── 📄 VideoPrompt.tsx             # Video prompt component
│   │   │   ├── 📄 VideoPlayerBase.tsx         # Base video player component
│   │   │   └── 📄 VideoForm.tsx               # Video creation form
│   │   ├── 📁 projects/                       # Project-related components
│   │   │   └── 📄 ProjectsListBoundary.tsx    # Projects list error boundary
│   │   ├── 📁 notification/                   # Notification components
│   │   ├── 📁 ProjectCard/                    # Project card component (to be moved)
│   │   └── 📁 ui/                             # shadcn/ui components
│   │
│   ├── 📁 config/                             # Configuration files
│   │   └── 📄 env.ts                          # Environment configuration
│   │
│   ├── 📁 contexts/                           # React contexts
│   │   └── 📄 auth.tsx                        # Authentication context
│   │
│   ├── 📁 hooks/                              # Custom React hooks
│   │   ├── 📄 useAuth.ts                      # Authentication hook
│   │   ├── 📄 useForm.ts                      # Form management hook
│   │   ├── 📄 useApi.ts                       # API integration hook
│   │   ├── 📄 useVideo.ts                     # Video management hook
│   │   ├── 📄 useVideoGeneration.ts           # Video generation hook
│   │   ├── 📄 useImageUpload.ts               # Image upload hook
│   │   ├── 📄 useToast.ts                     # Toast notification hook
│   │   ├── 📄 useNotification.ts              # Notification management hook
│   │   ├── 📄 useProjectDetails.ts            # Project details hook
│   │   ├── 📄 useProjects.ts                  # Projects management hook
│   │   └── 📄 useBaseQuery.ts                 # Base query hook for API calls
│   │
│   ├── 📁 lib/                                # Library code and utilities
│   │   ├── 📁 api/                            # API utilities and helpers
│   │   ├── 📁 supabase/                       # Supabase client and utilities
│   │   ├── 📁 utils/                          # General utilities
│   │   ├── 📄 api.ts                          # Main API configuration
│   │   └── 📄 utils.ts                        # General utility functions
│   │
│   ├── 📁 pages/                              # Page components
│   │   ├── 📁 Dashboard/                      # Dashboard page
│   │   ├── 📁 Login/                          # Login page
│   │   ├── 📁 Signup/                         # Signup page
│   │   ├── 📁 Videos/                         # Videos list page
│   │   └── 📁 NewVideo/                       # New video page
│   │
│   ├── 📁 services/                           # API and external services
│   │   ├── 📁 auth/                           # Authentication service modules
│   │   ├── 📄 api.ts                          # API service configuration
│   │   └── 📄 auth.ts                         # Main auth service
│   │
│   ├── 📁 shell/                              # Application shell/layout
│   │   ├── 📄 MainShell.tsx                   # Main application layout
│   │   └── 📄 Sidebar.tsx                     # Navigation sidebar
│   │
│   ├── 📁 styles/                             # Global styles
│   │   └── 📄 global.css                      # Global CSS and theme variables
│   │
│   ├── 📁 test/                               # Test utilities and setup
│   │   └── 📄 setupTests.ts                   # Test configuration
│   │
│   ├── 📁 types/                              # TypeScript type definitions
│   │   ├── 📄 api.ts                          # API related types
│   │   ├── 📄 auth.ts                         # Authentication types
│   │   ├── 📄 browser.d.ts                    # Browser-specific types
│   │   ├── 📄 browser-apis.d.ts               # Browser API declarations
│   │   ├── 📄 dom.d.ts                        # DOM-specific types
│   │   ├── 📄 global.d.ts                     # Global type declarations
│   │   ├── 📄 hooks.ts                        # Hook-related types
│   │   ├── 📄 imageUpload.ts                  # Image upload types
│   │   ├── 📄 project.ts                      # Project-related types
│   │   ├── 📄 projects.ts                     # Projects collection types
│   │   └── 📄 styles.d.ts                     # Style-related types
│   │
│   ├── 📁 utils/                              # Utility functions
│   │   ├── 📄 security.ts                     # Security utilities
│   │   └── 📄 cn.ts                           # shadcn class merging utility
│   │
│   ├── 📄 App.tsx                             # Main application component
│   └── 📄 main.tsx                            # Application entry point
│
├── 📄 index.html                               # HTML entry point
├── 📄 package.json                             # Project dependencies and scripts
├── 📄 postcss.config.js                        # PostCSS configuration
├── 📄 tailwind.config.js                       # Tailwind CSS configuration
├── 📄 tsconfig.json                            # TypeScript configuration
├── 📄 vite.config.ts                           # Vite bundler configuration
├── 📄 components.json                          # shadcn/ui configuration
└── 📄 .replit                                  # Replit configuration
```

## Directory Structure Details

### Source Code Organization

#### Components (`src/components/`)
- **Auth Components**: Authentication-related UI components
- **Common Components**: Reusable UI elements shared across the application
- **Video Components**: Video-related components for player, upload, and management
- **Projects Components**: Project management and display components
- **Notification Components**: Toast and notification system components
- **UI Components**: shadcn/ui base components for consistent design system

#### Library (`src/lib/`)
- **API**: API client configuration and utilities
- **Supabase**: Supabase client setup and helpers
- **Utils**: Shared utility functions and helpers

#### Services (`src/services/`)
- **Auth**: Authentication service and related modules
- **API**: Core API service configuration and endpoints

#### Types (`src/types/`)
- **API Types**: API request/response types
- **Auth Types**: Authentication and user types
- **Browser Types**: Browser-specific type declarations
- **DOM Types**: DOM-related type definitions
- **Hook Types**: Custom hook type definitions
- **Project Types**: Project-related interfaces
- **Style Types**: Style-related type declarations

#### Hooks (`src/hooks/`)
- **API Hooks**: API integration hooks
- **Auth Hooks**: Authentication management hooks
- **Form Hooks**: Form handling and validation
- **Project Hooks**: Project management hooks
- **Video Hooks**: Video generation and management
- **Utility Hooks**: Toast, notification, and base query hooks

#### Pages (`src/pages/`)
Each page is a standalone feature module containing:
- Page component
- Page-specific components
- Page-specific hooks and utilities

#### Shell (`src/shell/`)
- Application layout components
- Navigation and routing structure
- Consistent UI wrapper for all pages

#### Styles (`src/styles/`)
- Global styles and theme configuration
- shadcn/ui theme variables
- Tailwind CSS customization

#### Utils (`src/utils/`)
- Security utilities
- Class name merging utility for shadcn/ui
- General utility functions

### Configuration Files
- **Build Configuration**: Vite, TypeScript, and PostCSS setup
- **UI Configuration**: Tailwind and shadcn/ui settings
- **Environment Configuration**: Environment variables and constants
- **Development Configuration**: Replit and editor settings

## Style Management

### shadcn/ui Integration
- Components are copied into `src/components/ui/`
- Theme variables in `global.css`
- Utility functions in `utils/cn.ts`
- Configuration in `components.json`

### CSS Organization
1. **Global Styles** (`global.css`)
   - Tailwind directives
   - Theme variables
   - Base styles

2. **Component Styles**
   - Tailwind classes
   - shadcn/ui variants
   - CSS custom properties

3. **Theme System**
   - CSS variables for theming
   - Dark mode support
   - Component-specific tokens

## Best Practices

### File Naming
- Components: PascalCase (e.g., `Button.tsx`)
- Utilities: camelCase (e.g., `cn.ts`)
- Configuration: kebab-case (e.g., `tailwind.config.js`)
- Test Files: `*.test.tsx` or `*.spec.tsx`

### Import Organization
1. External dependencies
2. Internal modules
3. Components
4. Styles
5. Types
6. Utils

### Component Organization
- One component per file
- Co-locate related files
- Keep components focused and small
- Extract reusable logic

### Style Management
- Use Tailwind for utility classes
- shadcn/ui for component styling
- Global CSS for theme variables
- CSS custom properties for theming