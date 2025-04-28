# 🏗️ Services Architecture

## 📂 Service Folder Organization
A service folder (`src/services/<service-name>/`) should contain:
- Core service implementation (`service.ts`)
- Database operations (`repository.ts`)
- Service-specific types (`types.ts`)
- Service-specific errors (`errors.ts`)
- Subfolders for major features (e.g., `storage/`, `processing/`)
- Service-specific configurations (`config.ts`)

The following should remain in functional folders outside services:
- Routes (`src/routes/`)
- Middleware (`src/middleware/`)
- Common types (`src/types/`)
- Common errors (`src/errors/`)
- Global configuration (`src/config/`)

## 🎯 Core Services

🔵 1. Project Management

🟢 1.1. Project List Endpoint
- **API Endpoint**: `GET /api/projects`
- **Purpose**: Fetch all projects with their images and videos
- **Implementation**: `ProjectService.getProjectsForUser()`
- **Location**: `src/services/project/service.ts`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🟢 1.2. Project Details Endpoint
- **API Endpoint**: `GET /api/projects/:id`
- **Purpose**: Get complete details of a specific project
- **Implementation**: `ProjectService.getProject()`
- **Location**: `src/services/project/service.ts`
- **Authentication**: Required (Bearer Token)
- **Access Control**: User Role Based
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Access Control Implementation
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

🟢 1.3. Project State Endpoint
- **API Endpoint**: `GET /api/projects/:id/state`
- **Purpose**: Get current state of a project
- **Implementation**: `ProjectService.getProjectState()`
- **Location**: `src/services/project/service.ts`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

🟢 1.4. Project Videos Endpoint
- **API Endpoint**: `GET /api/projects/:id/videos`
- **Purpose**: Get all videos for a specific project
- **Implementation**: `ProjectService.getProjectVideos()`
- **Location**: `src/services/project/service.ts`
- **Authentication**: Required (Bearer Token)
- **Access Control**: User Role Based
- **Status**: ✅ Completed & Migrated from Video Service
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Access Control Implementation
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

🔵 2. Video Generation

🟢 2.1. Generate Video Endpoint
- **API Endpoint**: `POST /api/videos/generate`
- **Purpose**: Start a new video generation
- **Implementation**: `VideoGenerationService.startGeneration()`
- **Location**: `src/services/video/service.ts`
- **Authentication**: Required (Bearer Token)
- **Rate Limiting**: 10 requests/15min
- **Standards Compliance**:
  - ✅ Dependency Injection
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern
  - ✅ Rate Limiting Implementation

🟢 2.2. Video Status Endpoint
- **API Endpoint**: `GET /api/videos/:id/status`
- **Purpose**: Check video generation status
- **Implementation**: `VideoGenerationService.getGenerationStatus()`
- **Location**: `src/services/video/service.ts`
- **Authentication**: Required (Bearer Token)
- **Rate Limiting**: 60 requests/min
- **Standards Compliance**:
  - ✅ Dependency Injection
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern
  - ✅ Rate Limiting Implementation

🔵 3. Image Management

🟢 3.1. Upload Image Endpoint
- **API Endpoint**: `POST /api/images/upload`
- **Purpose**: Handle project image uploads
- **Implementation**: `ImageService.uploadProjectImage()`
- **Location**: `src/services/image/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standard Error Handling
  - ✅ Type-safe Response Format
  - ✅ Proper Directory Structure
  - ✅ Configuration Management
  - ✅ Validation Module
  - ✅ Cleanup Service
  - ✅ Storage Error Handling

🟢 3.2. Image Status Endpoint
- **API Endpoint**: `GET /api/images/status/:projectId`
- **Purpose**: Check project image status
- **Implementation**: `ImageService.getProjectStatus()`
- **Location**: `src/services/image/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standard Error Handling
  - ✅ Type-safe Response Format
  - ✅ Proper Directory Structure
  - ✅ Validation Module
  - ✅ Storage Error Handling

🔵 4. Prompt Management

🟢 4.1. Prompt Components Endpoint
- **API Endpoint**: `GET /api/prompts/components`
- **Purpose**: Fetch all prompt components grouped by category
- **Implementation**: `PromptService.getPromptComponents()`
- **Location**: `src/services/prompt/service.ts`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🔵 5. Discovery Management

🟢 5.1. Get Discoveries Endpoint
- **API Endpoint**: `GET /api/discoveries`
- **Purpose**: Fetch all featured videos for the Discovery page
- **Implementation**: `DiscoveryService.getDiscoveries()`
- **Location**: `src/services/discovery/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🟢 5.2. Create Discovery Endpoint
- **API Endpoint**: `POST /api/discoveries`
- **Purpose**: Add a video to the Discovery page
- **Implementation**: `DiscoveryService.createDiscovery()`
- **Location**: `src/services/discovery/service.ts`
- **Authentication**: Required (Bearer Token)
- **Access Control**: Admin Only
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Access Control Implementation
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

🟢 5.3. Delete Discovery Endpoint
- **API Endpoint**: `DELETE /api/discoveries/:id`
- **Purpose**: Remove a video from the Discovery page
- **Implementation**: `DiscoveryService.deleteDiscovery()`
- **Location**: `src/services/discovery/service.ts`
- **Authentication**: Required (Bearer Token)
- **Access Control**: Admin Only
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Access Control Implementation
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

🟢 5.4. Update Discovery Order Endpoint
- **API Endpoint**: `PUT /api/discoveries/:id/order`
- **Purpose**: Update the display order of a discovery item
- **Implementation**: `DiscoveryService.updateDiscoveryOrder()`
- **Location**: `src/services/discovery/service.ts`
- **Authentication**: Required (Bearer Token)
- **Access Control**: Admin Only
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Access Control Implementation
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

🟢 5.5. Available Videos Endpoint
- **API Endpoint**: `GET /api/discoveries/availableVideos`
- **Purpose**: Get all available videos for potential discovery items
- **Implementation**: `DiscoveryService.getAvailableVideos()`
- **Location**: `src/services/discovery/service.ts`
- **Authentication**: Required (Bearer Token)
- **Access Control**: Admin Only
- **Status**: ✅ Complete
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Access Control Implementation
  - ✅ Type-safe Response Format
  - ✅ Proper Error Handling
  - ✅ ServiceResult Pattern

### Naming Conventions for Discovery Service
- **URL Paths**: camelCase (e.g., `/api/discoveries/availableVideos`)
- **Request/Response Properties**: camelCase (e.g., `generationId`, `displayOrder`)
- **IDs in Responses**: Standard UUID strings
- **Service Methods**: camelCase (e.g., `getDiscoveries()`, `createDiscovery()`)

🔵 6. Payment Management

🟢 6.1. Create PayPal Order Endpoint
- **API Endpoint**: `POST /api/payments/paypal/createOrder`
- **Purpose**: Create a PayPal order for token purchase
- **Implementation**: `PaymentService.createPayPalOrder()`
- **Location**: `src/services/payment/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ⬜ Planned
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🟢 6.2. Capture PayPal Payment Endpoint
- **API Endpoint**: `POST /api/payments/paypal/captureOrder`
- **Purpose**: Capture a PayPal payment and add tokens to user account
- **Implementation**: `PaymentService.capturePayPalOrder()`
- **Location**: `src/services/payment/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ⬜ Planned
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🟢 6.3. Payment History Endpoint
- **API Endpoint**: `GET /api/payments/history`
- **Purpose**: Get user's payment transaction history
- **Implementation**: `PaymentService.getPaymentHistory()`
- **Location**: `src/services/payment/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ⬜ Planned
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

### Naming Conventions for Payment Service
- **URL Paths**: camelCase (e.g., `/api/payments/paypal/createOrder`)
- **Request/Response Properties**: camelCase (e.g., `orderId`, `paymentId`)
- **IDs in Responses**: Standard UUID strings
- **Service Methods**: camelCase (e.g., `createPayPalOrder()`, `capturePayPalOrder()`)

🔵 7. Token Management

🟢 7.1. Get Token Balance Endpoint
- **API Endpoint**: `GET /api/tokens/balance`
- **Purpose**: Get user's current token balance
- **Implementation**: `TokenService.getUserBalance()`
- **Location**: `src/services/token/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ⬜ Planned
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🟢 7.2. Get Token Transactions Endpoint
- **API Endpoint**: `GET /api/tokens/transactions`
- **Purpose**: Get user's token transaction history
- **Implementation**: `TokenService.getTransactionHistory()`
- **Location**: `src/services/token/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ⬜ Planned
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

🟢 7.3. Use Tokens Endpoint
- **API Endpoint**: `POST /api/tokens/use`
- **Purpose**: Deduct tokens for a service (e.g., video generation)
- **Implementation**: `TokenService.useTokens()`
- **Location**: `src/services/token/service.ts`
- **Authentication**: Required (Bearer Token)
- **Status**: ⬜ Planned
- **Standards Compliance**:
  - ✅ Extends BaseService
  - ✅ Uses Repository Pattern
  - ✅ Standardized Error Handling
  - ✅ Proper Dependency Injection
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

### Naming Conventions for Token Service
- **URL Paths**: camelCase (e.g., `/api/tokens/transactions`)
- **Request/Response Properties**: camelCase (e.g., `tokenAmount`, `transactionType`)
- **IDs in Responses**: Standard UUID strings
- **Service Methods**: camelCase (e.g., `getUserBalance()`, `useTokens()`)

## 🛠️ Supporting Services

### 1. Validation Services
#### Image Validation Service
- **Purpose**: Validate project images
- **Implementation**: `ImageValidationService`
- **Location**: `src/services/image/validation/service.ts`
- **Internal Service**: No direct API endpoints
- **Standards Compliance**:
  - ✅ Dependency Injection
  - ✅ Type-safe Implementation
  - ✅ Extends BaseService
  - ✅ Proper Error Handling
  - ✅ Configuration Management

### 2. Storage Services
#### Storage Service
- **Purpose**: Handle file storage operations
- **Implementation**: `ImageStorageService`
- **Location**: `src/services/image/storage/service.ts`
- **Internal Service**: No direct API endpoints
- **Standards Compliance**:
  - ✅ Dependency Injection
  - ✅ Type-safe Implementation
  - ✅ Configuration Management
  - ✅ Extends BaseService
  - ✅ Proper Error Handling
  - ✅ Retry Mechanism
  - ✅ Cleanup Implementation

