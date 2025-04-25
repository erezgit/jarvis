# Project Structure

This document provides a comprehensive overview of the project's file structure and organization.

```markdown
📁 Root Directory
├── 📁 .github/                          # GitHub configuration
│   └── 📄 workflows/ci.yml              # CI/CD pipeline configuration
├── 📁 .config/                          # Environment configuration
├── 📁 .cache/                           # Build cache
├── 📁 coverage/                         # Test coverage reports
├── 📁 dist/                             # Compiled output
├── 📁 docs/                             # Documentation
│   ├── 📄 01_ARCHITECTURE.md            # Core architecture documentation
│   ├── 📄 02_PROJECT_STRUCTURE.md       # Project structure (this file)
│   ├── 📄 03_API.md                     # API documentation
│   ├── 📄 05_TESTING.md                 # Testing guidelines
│   └── 📄 10_PROJECT_STATUS_REPORT.md   # Project status and progress
├── 📁 logs/                             # Application logs
│   ├── 📄 combined.log                  # Combined application logs
│   └── 📄 error.log                     # Error-specific logs
├── 📁 src/
│   ├── 📁 __tests__/                    # Test files
│   │   ├── 📄 auth.routes.test.ts       # Auth routes tests
│   │   ├── 📄 project.test.ts           # Project service tests
│   │   └── 📄 utils/                    # Test utilities
│   ├── 📁 config/                       # Configuration files
│   │   ├── 📄 app.ts                    # Application configuration
│   │   ├── 📄 logger.ts                 # Logging configuration
│   │   └── 📄 supabase.ts               # Supabase client configuration
│   ├── 📁 db/                           # Database layer
│   │   └── 📄 project.ts                # Project database operations
│   ├── 📁 errors/                       # Error handling system
│   │   ├── 📄 base.ts                   # Base error classes
│   │   ├── 📄 auth.ts                   # Authentication errors
│   │   ├── 📄 validation.ts             # Validation errors
│   │   └── 📄 system.ts                 # System errors
│   ├── 📁 middleware/                   # Middleware components
│   │   ├── 📄 error.ts                  # Error handling middleware
│   │   ├── 📄 auth.ts                   # Authentication middleware
│   │   ├── 📄 logging.ts                # Logging middleware
│   │   └── 📄 session.ts                # Session handling middleware
│   ├── 📁 routes/                       # API routes
│   │   ├── 📄 auth.ts                   # Authentication routes
│   │   ├── 📄 projects.ts               # Project routes
│   │   └── 📄 health.ts                 # Health check routes
│   ├── 📁 security/                     # Security module
│   │   ├── 📁 config/                   # Security configurations
│   │   │   ├── 📄 cors.config.ts        # CORS settings
│   │   │   ├── 📄 helmet.config.ts      # Helmet security settings
│   │   │   ├── 📄 rateLimit.config.ts   # Rate limiting rules
│   │   │   └── 📄 token.config.ts       # Token validation settings
│   │   └── 📁 middleware/               # Security middleware
│   │       ├── 📄 cors.ts               # CORS middleware
│   │       ├── 📄 helmet.ts             # Helmet security middleware
│   │       ├── 📄 rateLimit.ts          # Rate limiting middleware
│   │       └── 📄 token.ts              # Token validation middleware
│   ├── 📁 services/                     # Business logic
│   │   ├── 📁 auth/                     # Authentication services
│   │   │   └── 📄 service.ts            # Auth service implementation
│   │   ├── 📁 core/                     # Core services
│   │   │   ├── 📁 monitoring/           # Monitoring services
│   │   │   │   └── 📄 service.ts        # Monitoring service implementation
│   │   │   └── 📁 validation/           # Validation services
│   │   │       └── 📄 service.ts        # Validation service implementation
│   │   ├── 📁 project/                  # Project services
│   │   │   ├── 📄 service.ts            # Project service implementation
│   │   │   └── 📁 details/              # Project details services
│   │   │       └── 📄 service.ts        # Project details implementation
│   │   ├── 📁 video/                    # Video services
│   │   └── 📁 image/                    # Image services
│   ├── 📁 types/                        # TypeScript types
│   │   ├── 📄 errors.ts                 # Error type definitions
│   │   ├── 📄 express.d.ts              # Express type extensions
│   │   ├── 📄 project.ts                # Project type definitions
│   │   └── 📄 index.ts                  # Shared type definitions
│   ├── 📁 utils/                        # Utility functions
│   │   ├── 📄 network-debug.ts          # Network debugging utilities
│   │   └── 📄 module-debug.ts           # Module loading debug utilities
│   ├── 📄 app.ts                        # Express application setup
│   └── 📄 index.ts                      # Application entry point
├── 📄 .env                              # Environment variables
├── 📄 .gitignore                        # Git ignore rules
├── 📄 jest.config.js                    # Jest test configuration
├── 📄 package.json                      # Project dependencies
├── 📄 tsconfig.json                     # TypeScript configuration
└── 📄 replit.nix                        # Replit configuration
```

## Key Components

### 1. Security Module
- **Configuration** (`security/config/`)
  - CORS settings and policies
  - Helmet security configurations
  - Rate limiting rules and thresholds
  - Token validation settings
- **Middleware** (`security/middleware/`)
  - CORS request handling
  - Helmet security implementation
  - Rate limiting enforcement
  - Token validation and verification

### 2. Service Layer
- **Authentication Service** (`services/auth/service.ts`)
  - User authentication
  - Session management
  - Token handling
- **Monitoring Service** (`services/core/monitoring/service.ts`)
  - Performance monitoring
  - Error tracking
  - System metrics
- **Validation Service** (`services/core/validation/service.ts`)
  - Input validation
  - Data sanitization
  - Schema validation
- **Project Service** (`services/project/service.ts`)
  - Project management
  - State handling
  - Access control
- **Project Details Service** (`services/project/details/service.ts`)
  - Detailed project information
  - Generation history
  - Project metadata

### 3. Error Handling System
- **Base Error Classes** (`errors/base.ts`)
  - AppError base class
  - Error serialization
  - Logging integration
- **Specific Error Types**
  - Authentication errors
  - Validation errors
  - System errors
- **Error Middleware** (`middleware/error.ts`)
  - Centralized error handling
  - Error logging
  - Metrics collection

### 4. Type System
- **Error Types** (`types/errors.ts`)
  - Error codes and enums
  - Response interfaces
  - Type guards
- **Project Types** (`types/project.ts`)
  - Project interfaces
  - Generation types
  - Database types
- **Express Extensions** (`types/express.d.ts`)
  - Request/Response augmentation
  - Custom middleware types
- **Shared Types** (`types/index.ts`)
  - Common interfaces
  - Utility types

### 5. Configuration
- **Application Config** (`config/app.ts`)
  - Express setup
  - Middleware configuration
  - Security settings
- **Logging Config** (`config/logger.ts`)
  - Winston logger setup
  - Log file management
  - Error tracking
- **Supabase Config** (`config/supabase.ts`)
  - Client initialization
  - Connection settings
  - RLS configuration

## Dependencies and Flow
1. Client Request → Routes → Services → Database
2. Error Handling at each layer
3. Validation before business logic
4. Logging throughout the flow

## Development Tools
- TypeScript compilation (`dist/`)
- Test coverage reporting (`coverage/`)
- Log management (`logs/`)
- Environment configuration (`.env`, `.config/`)

## Security Considerations
1. Secure error responses
2. Input validation
3. Token handling
4. Request sanitization
5. RLS enforcement

## Core Services

- **Authentication Service** (`services/auth/service.ts`)
- **Monitoring Service** (`services/core/monitoring/service.ts`)
- **Validation Service** (`services/core/validation/service.ts`)
- **Project Service** (`services/project/service.ts`)
- **Project Details Service** (`services/project/details/service.ts`)
