# 🏗️ CORE SERVICES ARCHITECTURE

Erez test

## 📂 Core Directory Organization
A core service module (`src/core/services/<service-name>/`) should contain:
- Service implementation (`service.ts`)
- Service-specific types (`types.ts`)
- Service-specific mappers (`mappers.ts`)
- Service hooks (`hooks/`)
- Service utilities (`utils.ts`)

The following should remain in functional folders:
- Components (`src/components/`)
- Pages (`src/pages/`)
- Common types (`src/types/`)
- UI utilities (`src/lib/`)
- Global configuration (`src/config/`)

## 🎯 Core Services

🔵 1. Project Management Service ✅ COMPLETED

🟢 1.1. Projects List ✅
- **API Endpoint**: `GET /api/projects`
- **Purpose**: Fetch all projects with their videos and generations
- **Implementation**: `ProjectService.getAllProjects()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useProjects()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Clean Domain Boundaries

🟢 1.2. Project Details ✅
- **API Endpoint**: `GET /api/projects/:id`
- **Purpose**: Get complete details of a specific project including videos and generations
- **Implementation**: `ProjectService.getProjectDetails()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useProjectDetails()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Clean Domain Boundaries

🟢 1.3. Create Project ✅
- **API Endpoint**: `POST /api/projects`
- **Purpose**: Create a new project with initial metadata
- **Implementation**: `ProjectService.createProject()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useCreateProject()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Single API Call Pattern
  - ✅ Type-safe Input Validation
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping

🟢 1.4. Update Project ✅
- **API Endpoint**: `PUT /api/projects/:id`
- **Purpose**: Update project metadata and relationships
- **Implementation**: `ProjectService.updateProject()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useUpdateProject()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Single API Call Pattern
  - ✅ Type-safe Input Validation
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping

🟢 1.5. Delete Project ✅
- **API Endpoint**: `DELETE /api/projects/:id`
- **Purpose**: Delete project and clean up related resources
- **Implementation**: `ProjectService.deleteProject()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useDeleteProject()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Single API Call Pattern
  - ✅ Resource Cleanup
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping

🟢 1.6. Generation Status Check ✅
- **API Endpoint**: `GET /api/projects/:id/generations/:generationId/status`
- **Purpose**: Check status of a specific generation within a project
- **Implementation**: `ProjectService.checkGenerationStatus()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useGenerationStatus()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ⏳ In Progress
  - ✅ Single API Call Pattern
  - ✅ Type-safe Response Format
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ⏳ Video Generation Flow Integration
  - ⏳ Project Domain Integration

🔵 2. Video Management Service ✅ COMPLETED

🟢 2.1. Video Generation ✅
- **API Endpoint**: `POST /api/videos/generate`
- **Purpose**: Generate new video from image and prompt
- **Implementation**: `VideoService.generateVideo()`
- **Location**: `src/core/services/videos/generation/service.ts`
- **Hook**: `useVideoGeneration()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Response Mapping Integration
  - ✅ Domain Separation
  - ✅ Project Domain Integration

🟢 2.2. Video Status Check ✅ MIGRATED
- **Note**: This functionality has been moved to Project domain under Generation Status Check
- **Status**: Successfully migrated to project-centric status checking
- **Migration Status**: ✅ Completed
  - ✅ Update existing references
  - ✅ Deprecate old endpoints
  - ✅ Migrate to project domain

🟢 2.3. Video Status Endpoint ✅
- **API Endpoint**: `GET /api/videos/status/:generationId`
- **Purpose**: Check status of a video generation
- **Implementation**: `VideoStatusService.checkStatus()`
- **Location**: `src/core/services/videos/status/service.ts`
- **Hook**: `useVideoStatusPolling()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Clean Domain Boundaries

🔵 3. Image Management Service ✅ COMPLETED

🟢 3.1. Image Upload ✅
- **API Endpoint**: `POST /api/images/upload`
- **Purpose**: Upload image for video generation
- **Implementation**: `ImageService.uploadImage()`
- **Location**: `src/core/services/images/service.ts`
- **Hook**: `useImageUpload()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Clean Domain Boundaries

🔵 4. Prompt Selection Service ⏳ PENDING API

🟢 4.1. Prompt Categories ⏳
- **API Endpoint**: `GET /api/prompts/categories` (Not Yet Available)
- **Purpose**: Fetch available prompt categories and options
- **Implementation**: `PromptService.getCategories()`
- **Location**: `src/core/services/prompts/service.ts`
- **Hook**: `usePromptCategories()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ⏳ In Progress
  - ⏳ Extends BaseService
  - ⏳ Uses API Client
  - ⏳ Type-safe Response Format
  - ⏳ ServiceResult Pattern
  - ⏳ Error Handling Implementation
  - ⏳ Proper Response Mapping
  - ⏳ Domain Separation
  - ⏳ Clean Domain Boundaries
- **Note**: Currently using mock data until backend API is available

🟢 4.2. Category Options ⏳
- **API Endpoint**: `GET /api/prompts/categories/:id/options` (Not Yet Available)
- **Purpose**: Fetch options for specific category
- **Implementation**: `PromptService.getCategoryOptions()`
- **Location**: `src/core/services/prompts/service.ts`
- **Hook**: `usePromptOptions()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ⏳ In Progress
  - ⏳ Extends BaseService
  - ⏳ Uses API Client
  - ⏳ Type-safe Response Format
  - ⏳ ServiceResult Pattern
  - ⏳ Error Handling Implementation
  - ⏳ Proper Response Mapping
  - ⏳ Domain Separation
  - ⏳ Clean Domain Boundaries
- **Note**: Currently using mock data until backend API is available

🔵 5. Discovery Service ✅ COMPLETED

🟢 5.1. Get Discoveries ✅
- **API Endpoint**: `GET /api/discoveries`
- **Purpose**: Fetch all videos that are currently in the discovery section
- **Implementation**: `DiscoveryService.getDiscoveries()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useDiscoveries()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🟢 5.2. Get Available Videos ✅
- **API Endpoint**: `GET /api/discoveries/availableVideos`
- **Purpose**: Fetch all videos that can be added to the discovery section (admin only)
- **Implementation**: `DiscoveryService.getAvailableVideos()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useAvailableVideos()`
- **Authentication**: Required (Bearer Token, Admin Role)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🟢 5.3. Add to Discovery ✅
- **API Endpoint**: `POST /api/discoveries`
- **Purpose**: Add a video to the discovery section
- **Implementation**: `DiscoveryService.addToDiscovery()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useAddToDiscovery()`
- **Authentication**: Required (Bearer Token, Admin Role)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🟢 5.4. Remove from Discovery ✅
- **API Endpoint**: `DELETE /api/discoveries/:id`
- **Purpose**: Remove a video from the discovery section
- **Implementation**: `DiscoveryService.removeFromDiscovery()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useRemoveFromDiscovery()`
- **Authentication**: Required (Bearer Token, Admin Role)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🟢 5.5. Update Video Order ✅
- **API Endpoint**: `PUT /api/discoveries/:id/order`
- **Purpose**: Update the display order of a video in the discovery section
- **Implementation**: `DiscoveryService.updateVideoOrder()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useUpdateVideoOrder()`
- **Authentication**: Required (Bearer Token, Admin Role)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Domain Separation
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🔵 6. Payment Service ✅ COMPLETED

🟢 6.1. Token Purchase ✅
- **API Endpoint**: `POST /api/payments/createOrder` and `POST /api/payments/capturePayment`
- **Purpose**: Purchase tokens with a payment method
- **Implementation**: `PaymentService.createOrder()` and `PaymentService.capturePayment()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `useTokenPurchase()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

🟢 6.2. Token Balance ✅
- **API Endpoint**: `GET /api/payments/tokens/balance`
- **Purpose**: Get the user's token balance
- **Implementation**: `PaymentService.getTokenBalance()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `useTokenBalance()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

🟢 6.3. Token Transactions ✅
- **API Endpoint**: `GET /api/payments/tokens/transactions`
- **Purpose**: Get the user's token transaction history
- **Implementation**: `PaymentService.getTokenTransactions()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `useTransactionHistory()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

🟢 6.4. Payment History ✅
- **API Endpoint**: `GET /api/payments/history`
- **Purpose**: Get the user's payment history
- **Implementation**: `PaymentService.getPaymentHistory()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `usePaymentHistory()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

🟢 6.5. Payment Methods ✅
- **API Endpoint**: `GET /api/payments/methods`
- **Purpose**: Get the user's payment methods
- **Implementation**: `PaymentService.getPaymentMethods()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `usePaymentMethods()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

🟢 6.6. Add Payment Method ✅
- **API Endpoint**: `POST /api/payments/methods`
- **Purpose**: Add a payment method
- **Implementation**: `PaymentService.addPaymentMethod()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `useAddPaymentMethod()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

🟢 6.7. Remove Payment Method ✅
- **API Endpoint**: `DELETE /api/payments/methods/:methodId`
- **Purpose**: Remove a payment method
- **Implementation**: `PaymentService.removePaymentMethod()`
- **Location**: `src/core/services/payment/service.ts`
- **Hook**: `useRemovePaymentMethod()`
- **Authentication**: Required (Bearer Token)
- **Standards Compliance**: ✅ Completed
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern
  - ✅ Error Handling Implementation
  - ✅ Proper Response Mapping
  - ✅ Hook Organization
  - ✅ Domain Separation

## 🔧 Infrastructure Services

🔵 1. Authentication Service ✅ COMPLETED

🟢 1.1. Token Management ✅
- **Purpose**: Handle auth tokens and session
- **Implementation**: `TokenService`
- **Location**: `src/core/services/token/TokenService.ts`
- **Standards Compliance**: ✅ Complete
  - ✅ Singleton Pattern
  - ✅ Type-safe Methods
  - ✅ Error Handling Implementation
  - ✅ Event System

🟢 1.2. Authentication State ✅
- **Purpose**: Manage auth state and user session
- **Implementation**: `AuthService`
- **Location**: `src/core/services/auth/service.ts`
- **Hook**: `useAuth()`
- **Standards Compliance**: ✅ Complete
  - ✅ Extends BaseService
  - ✅ Uses API Client
  - ✅ Type-safe Response Format
  - ✅ ServiceResult Pattern

## 📊 Service Standards

### Response Format
```typescript
interface ServiceResult<T> {
  data: T | null;
  error: Error | null;
}
```

### Error Handling
```typescript
interface ServiceError extends Error {
  code: ErrorCode;
  status?: number;
}
```

### Base Service Pattern
```typescript
abstract class BaseService {
  protected readonly api: ApiClient;
  protected handleRequest<T>(): Promise<ServiceResult<T>>;
}
```

## 🔄 Migration Status
- ✅ Core Infrastructure (100%)
- ✅ Project Service (100%)
- ✅ Video Service (100%)
- ✅ Image Service (100%)
- ⏳ Prompt Service (0%)
- ✅ Auth Service (100%)
- ✅ Discovery Service (100%)
- ✅ Payment Service (100%) 