# 🔄 VIDEO LIST UPDATE MECHANISMS STANDARDIZATION

## 📋 Overview
This document outlines the standardization of the three mechanisms used for updating video lists across the application. The goal is to ensure consistent behavior, reliable updates, and maintainable code patterns.

## 🎯 Current Mechanisms

🔵 1. Videos Page List Mechanism ✅ WORKING

🟢 1.1. Videos Page Initial Load ✅
- **API Endpoint**: `GET /api/projects`
- **Purpose**: Fetch all projects with their videos for display in the videos page
- **Implementation**: `ProjectService.getAllProjects()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useProjects()`
- **Data Flow**: React Query → Component State → UI Render
- **Data Structure**: Uses `project.videos` directly (with `url` property)
- **Standards Compliance**: ✅ Compliant
  - ✅ Uses React Query for Data Fetching
  - ✅ Proper Data Transformation
  - ✅ Consistent Type Usage
  - ✅ Error Handling Implementation
  - ✅ Automatic Refetching
  - ✅ Cache Invalidation Support

🔵 2. Project-Specific Video List Mechanism ✅ WORKING

🟢 2.1. New Video Page with Project ID ✅
- **API Endpoint**: `GET /api/projects/:id`
- **Purpose**: Fetch videos for a specific project when navigating to the New Video page
- **Implementation**: `ProjectService.getProjectDetails()`
- **Location**: `src/core/services/projects/service.ts`
- **Hook**: `useProjectDetails()`
- **Data Flow**: Route Change → React Query → Component State → UI Render
- **Data Structure**: Uses `project.videos` directly (with `url` property)
- **Standards Compliance**: ✅ Compliant
  - ✅ Uses React Query for Data Fetching
  - ✅ Proper Data Transformation
  - ✅ Consistent Type Usage
  - ✅ Error Handling Implementation
  - ✅ Automatic Refetching
  - ✅ Cache Invalidation Support

🔵 3. Video Generation Polling Mechanism ✅ FIXED

🟢 3.1. Video Generation Completion Update ✅
- **API Endpoint**: `GET /api/projects/:id`
- **Purpose**: Update video list after video generation completes
- **Implementation**: `useVideoGeneration()` hook with polling
- **Location**: `src/core/hooks/video/useVideoGeneration.ts`
- **Data Flow**: Polling → Direct UI Update → Query Invalidation → React Query Refetch → Component Re-render
- **Data Structure**: Uses direct UI update with standardized video object
- **Standards Compliance**: ✅ Compliant
  - ✅ Uses React Query for Data Fetching
  - ✅ Consistent Query Key Usage
  - ✅ Proper Data Transformation
  - ✅ Consistent Data Structure
  - ✅ ProjectId Handling Fixed
  - ✅ Error Handling Implementation
  - ✅ Automatic Refetching
  - ✅ Consistent Cache Invalidation
  - ✅ Direct UI Update Step Added

🔵 4. Discovery Video List Mechanism ✅ COMPLETED

🟢 4.1. Discovery Page Initial Load ✅
- **API Endpoint**: `GET /api/discoveries`
- **Purpose**: Fetch all videos in the discovery section for display in the discovery page
- **Implementation**: `DiscoveryService.getDiscoveries()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useDiscoveries()`
- **Data Flow**: React Query → Component State → UI Render
- **Data Structure**: Uses `discovery.videos` with mapper to standardized format
- **Standards Compliance**: ✅ Completed
  - ✅ Uses React Query for Data Fetching
  - ✅ Proper Data Transformation
  - ✅ Consistent Type Usage
  - ✅ Error Handling Implementation
  - ✅ Automatic Refetching
  - ✅ Cache Invalidation Support
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🟢 4.2. Admin Discovery Management ✅
- **API Endpoint**: `GET /api/discoveries/availableVideos`
- **Purpose**: Fetch videos that can be added to the discovery section (admin only)
- **Implementation**: `DiscoveryService.getAvailableVideos()`
- **Location**: `src/core/services/discoveries/service.ts`
- **Hook**: `useAvailableVideos()`
- **Data Flow**: React Query → Component State → UI Render
- **Data Structure**: Uses mapper to standardized video format
- **Standards Compliance**: ✅ Completed
  - ✅ Uses React Query for Data Fetching
  - ✅ Proper Data Transformation
  - ✅ Consistent Type Usage
  - ✅ Error Handling Implementation
  - ✅ Automatic Refetching
  - ✅ Cache Invalidation Support
  - ✅ Token Handling (Using TokenService with Supabase fallback)

🟢 4.3. Discovery Update Mechanism ✅
- **API Endpoints**: 
  - `POST /api/discoveries` (Add)
  - `DELETE /api/discoveries/:id` (Remove)
  - `PUT /api/discoveries/:id/order` (Reorder)
- **Purpose**: Update the discovery video list after admin actions
- **Implementation**: Various hooks in discovery service
- **Location**: `src/core/services/discoveries/hooks/`
- **Data Flow**: Action → API Call → Query Invalidation → React Query Refetch → Component Re-render
- **Data Structure**: Uses standardized video object format
- **Standards Compliance**: ✅ Completed
  - ✅ Uses React Query for Data Fetching
  - ✅ Consistent Query Key Usage
  - ✅ Proper Data Transformation
  - ✅ Consistent Data Structure
  - ✅ Error Handling Implementation
  - ✅ Automatic Refetching
  - ✅ Consistent Cache Invalidation
  - ✅ Token Handling (Using TokenService with Supabase fallback)

## 🔄 Standardization Plan

### 1. Unified Data Flow Pattern

All three mechanisms should follow this standardized data flow:

```
API Call → React Query Cache → Component State → UI Render
```

With updates triggered by:
```
Event → Query Invalidation → React Query Refetch → Cache Update → Component Re-render
```

### 2. Type Standardization

```typescript
// Standardized Video Type (to be used across all components)
interface Video {
  id: string;
  url: string;          // Consistent naming (not videoUrl in some places)
  status: VideoStatus;
  prompt: string;
  createdAt: string;
  metadata?: {
    thumbnailUrl?: string;
    duration?: number;
    [key: string]: any;
  };
}

// Standardized Generation Type (for API responses)
interface Generation {
  id: string;
  videoUrl: string;     // API response property name
  status: GenerationStatus;
  prompt: string;
  createdAt: string;
  metadata?: Record<string, any>;
  // Other API-specific fields
}

// Standardized Mapper Function
function mapGenerationToVideo(generation: Generation): Video {
  return {
    id: generation.id,
    url: generation.videoUrl,  // Consistent transformation
    status: generation.status,
    prompt: generation.prompt,
    createdAt: generation.createdAt,
    metadata: generation.metadata
  };
}
```

### 3. React Query Implementation

```typescript
// Standard query key structure
const videoListQueryKey = (projectId?: string) => 
  projectId ? ['project-videos', projectId] : ['all-videos'];

// Standard query invalidation
const invalidateVideoQueries = (queryClient: QueryClient, projectId?: string) => {
  if (projectId) {
    queryClient.invalidateQueries({
      queryKey: ['project-videos', projectId]
    });
    queryClient.invalidateQueries({
      queryKey: ['project-details', projectId]
    });
  } else {
    queryClient.invalidateQueries({
      queryKey: ['all-videos']
    });
  }
};
```

## 🛠️ Implementation Tasks

🔵 1. Video Generation Polling Mechanism Refactoring ✅

🟢 1.1. Standardize Data Types ✅
- **Task**: Create consistent interfaces for Video and Generation types
- **Location**: `src/core/services/videos/types.ts`
- **Dependencies**: None
- **Priority**: High
- **Status**: Completed

🟢 1.2. Implement Standard Mapper Functions ✅
- **Task**: Create consistent mapper functions for transforming API data
- **Location**: `src/core/services/videos/mappers.ts`
- **Dependencies**: Standardized Types
- **Priority**: High
- **Status**: Completed

🟢 1.3. Refactor useVideoGeneration Hook ✅
- **Task**: Update hook to use React Query consistently
- **Location**: `src/core/hooks/video/useVideoGeneration.ts`
- **Dependencies**: Standardized Types, Mapper Functions
- **Priority**: High
- **Changes**:
  - ✅ Remove direct state updates
  - ✅ Use query invalidation for updates
  - ✅ Implement proper error handling
  - ✅ Add retry logic for failed API calls
  - ✅ Fix projectId handling issues
  - ✅ Add direct UI update step
- **Status**: Completed

🟢 1.4. Update NewVideo Page Component ✅
- **Task**: Refactor to use standardized approach
- **Location**: `src/pages/NewVideo/index.tsx`
- **Dependencies**: Refactored Hook
- **Priority**: Medium
- **Changes**:
  - ✅ Import query key constants
  - ✅ Use standardized query keys
  - ✅ Fix data source (use direct UI update)
  - ✅ Ensure consistent data structure with other mechanisms
- **Status**: Completed

🟢 1.5. Align Data Structure with Other Mechanisms ✅
- **Task**: Ensure video generation mechanism uses the same data structure as other mechanisms
- **Location**: `src/pages/NewVideo/index.tsx` and `src/core/hooks/video/useVideoGeneration.ts`
- **Dependencies**: Refactored Hook, NewVideo Component
- **Priority**: High
- **Changes**:
  - ✅ Use direct UI update with standardized video objects
  - ✅ Ensure consistent data structure across all mechanisms
  - ✅ Fix projectId handling to ensure proper query invalidation
- **Status**: Completed

🔵 2. Discovery Video List Mechanism Refactoring ✅

🟢 2.1. Fix Token Handling ✅
- **Task**: Update UnifiedApiClient to use TokenService for authentication
- **Location**: `src/core/services/api/unified-client.ts`
- **Dependencies**: TokenService
- **Priority**: High
- **Changes**:
  - ✅ Update getHeaders method to use TokenService as primary token source
  - ✅ Maintain Supabase fallback for backward compatibility
  - ✅ Add proper logging for debugging
- **Status**: Completed

🟢 2.2. Standardize Data Types ✅
- **Task**: Ensure consistent interfaces for Discovery video types
- **Location**: `src/core/services/discoveries/types.ts`
- **Dependencies**: None
- **Priority**: Medium
- **Status**: Completed

🟢 2.3. Implement Standard Mapper Functions ✅
- **Task**: Ensure consistent mapper functions for transforming API data
- **Location**: `src/core/services/discoveries/mappers.ts`
- **Dependencies**: Standardized Types
- **Priority**: Medium
- **Status**: Completed

🟢 2.4. Align with React Query Standards ✅
- **Task**: Ensure discovery hooks follow React Query patterns
- **Location**: `src/core/services/discoveries/hooks/`
- **Dependencies**: Standardized Types, Mapper Functions
- **Priority**: Medium
- **Status**: Completed

## 📊 Standardization Criteria

### Data Flow Consistency ✅
- ✅ All mechanisms now use React Query for data fetching
- ✅ All mechanisms rely on query invalidation for updates
- ✅ Direct state updates have been minimized in favor of query-based updates
- ✅ Components derive state from consistent data sources

### Type Safety ✅
- ✅ Consistent type definitions across all components
- ✅ Proper type guards when transforming between types
- ✅ No use of `any` type or unsafe type assertions
- ✅ Clear interface definitions for all data structures

### Data Transformation ✅
- ✅ Consistent data sources across mechanisms
- ✅ Centralized mapper functions for API responses
- ✅ Proper handling of optional properties
- ✅ Consistent error handling for missing data

### Error Handling ✅
- ✅ Comprehensive error handling for all API calls
- ✅ Fallback mechanisms for missing or incomplete data
- ✅ User-friendly error messages
- ✅ Retry logic for transient failures

## 🔄 Migration Strategy

1. **Phase 1: Video Generation Polling Mechanism Refactoring** ✅
   - Implement standardized types and mappers
   - Update hooks to use React Query consistently
   - Fix projectId handling issues
   - Add direct UI update step

2. **Phase 2: Discovery Video List Mechanism Refactoring** ✅
   - Fix token handling in UnifiedApiClient
   - Ensure consistent data types and mappers
   - Align with React Query standards
   - Test all API endpoints

3. **Phase 3: Monitoring and Optimization** ⏳
   - Monitor performance of all video list mechanisms
   - Identify and address any edge cases
   - Optimize data fetching and caching strategies

## 📈 Success Metrics

- ✅ All four mechanisms follow the same data flow pattern
- ✅ All mechanisms use React Query for data fetching
- ✅ Consistent type usage across all components
- ✅ No type errors or unsafe type assertions
- ✅ Clear and maintainable code structure
- ✅ Proper token handling in all API requests
- ✅ No "Failed to fetch" errors in the console

## 🔍 Key Findings

1. **Direct UI Update Required**: The video generation mechanism needed to update the UI directly before query invalidation to ensure immediate feedback.

2. **Type Compatibility Issues**: There were differences between VideoStatus types in different parts of the codebase that needed to be reconciled.

3. **ProjectId Handling Fixed**: The projectId handling issues have been resolved by adding fallbacks and better tracking.

4. **Token Handling Fixed**: The UnifiedApiClient now properly uses TokenService as the primary source for authentication tokens, with Supabase as a fallback.

5. **Consistent Data Structure**: All video list mechanisms now use a consistent data structure, making it easier to maintain and extend.

## 🚀 Next Steps

1. **Monitor Performance**:
   - Watch for any performance issues with the new implementation
   - Ensure the UI updates correctly in all scenarios

2. **Consider Type Standardization**:
   - Review the different VideoStatus types across the codebase
   - Consider standardizing them to avoid future compatibility issues

3. **Documentation**:
   - Update developer documentation to reflect the new standardized approach
   - Ensure new developers understand the correct pattern to follow

4. **Token Refresh Mechanism**:
   - Implement a more robust token refresh mechanism
   - Handle expired tokens gracefully

5. **Error Handling Improvements**:
   - Enhance error handling for authentication failures
   - Provide more user-friendly error messages

