# Payment Service Architecture Alignment Plan

## Overview

This implementation plan outlines the steps needed to fix the `PaymentService` architecture and bring it into compliance with our service architecture standards. The current implementation has several critical issues that need to be addressed, including API client integration problems, class structure issues, and hook organization that doesn't follow our standards.

## Current State Analysis

After thorough code review, we've identified the following issues:

1. **Class Structure Issues**: 
   - `PaymentService` extends `BaseService` but tries to override the read-only `api` property
   - `PaymentService` implements `IPaymentService` but is missing required methods
   - Several methods reference properties that don't exist on the `PaymentService` type

2. **API Client Integration**: 
   - The `getTokenTransactions` method bypasses the `UnifiedApiClient` and uses `fetch` directly
   - This causes URL construction issues, with requests going to the frontend server instead of the backend API
   - The service receives HTML responses instead of JSON data

3. **Hook Organization**: 
   - Hooks are located in `src/core/hooks/tokens/` instead of `src/core/services/payment/hooks/`
   - This violates our architecture standard of keeping service-specific hooks within the service directory

4. **Error Handling**: 
   - Error handling is inconsistent across methods
   - Some methods use custom error handling while others use the base service's approach

5. **Incomplete Implementation**:
   - The `getPaymentHistory` method is incomplete and causing linter errors

## Implementation Plan

### Phase 1: Fix Class Structure ✅

- [x] **Step 1: Refactor BaseService Extension**
  - [x] Create a custom API client adapter that wraps UnifiedApiClient but matches BaseService's API interface
  - [x] Update PaymentService constructor to use the adapter pattern instead of direct assignment
  - [x] Fix the read-only property issue by using proper inheritance patterns

- [x] **Step 2: Implement Missing Interface Methods**
  - [x] Complete the `getPaymentHistory` method implementation
  - [x] Ensure all methods required by `IPaymentService` are properly implemented
  - [x] Fix linter errors related to missing methods

- [x] **Step 3: Fix Property References**
  - [x] Add missing utility methods or properly inherit them from BaseService
  - [x] Fix references to `withRetry`, `validateApiResponse`, `createServiceError`, etc.
  - [x] Ensure consistent error handling across all methods

### Phase 2: Fix API Client Integration ✅

- [x] **Step 1: Update getTokenTransactions Method**
  - [x] Revert to using the API client instead of direct fetch
  - [x] Ensure proper URL construction for backend API requests
  - [x] Add comprehensive error handling

- [x] **Step 2: Standardize API Request Pattern**
  - [x] Review all API request methods for consistency
  - [x] Ensure all methods use the same pattern for making requests
  - [x] Add proper logging for all API requests

- [x] **Step 3: Add Response Validation**
  - [x] Implement consistent response validation across all methods
  - [x] Handle different response formats gracefully
  - [x] Add detailed error messages for invalid responses

### Phase 3: Reorganize Hooks ✅

- [x] **Step 1: Create Hooks Directory**
  - [x] Create `src/core/services/payment/hooks/` directory
  - [x] Set up proper exports and index files

- [x] **Step 2: Move and Refactor Hooks**
  - [x] Move `useTokenPurchase` from `src/core/hooks/tokens/` to `src/core/services/payment/hooks/`
  - [x] Move `useTokenBalance` from `src/core/hooks/tokens/` to `src/core/services/payment/hooks/`
  - [x] Move `useTransactionHistory` from `src/core/hooks/tokens/` to `src/core/services/payment/hooks/`
  - [x] Move `usePaymentMethods` from `src/core/hooks/tokens/` to `src/core/services/payment/hooks/`
  - [x] Move `useAddPaymentMethod` from `src/core/hooks/tokens/` to `src/core/services/payment/hooks/`
  - [x] Move `useRemovePaymentMethod` from `src/core/hooks/tokens/` to `src/core/services/payment/hooks/`
  - [x] Update hook implementations to follow consistent patterns

- [x] **Step 3: Update Imports**
  - [x] Update imports throughout the codebase to reference the new hook locations
  - [x] Create backwards compatibility exports if needed for a smooth transition
  - [x] Test that all components using these hooks still work correctly

### Phase 4: Enhance Error Handling ✅

- [x] **Step 1: Standardize Error Handling**
  - [x] Implement consistent error handling across all methods
  - [x] Use the service's error codes and error creation utilities
  - [x] Add proper error logging and tracking

- [x] **Step 2: Add Retry Logic**
  - [x] Implement retry logic for transient errors
  - [x] Add exponential backoff for retries
  - [x] Add circuit breaker pattern for persistent errors

- [x] **Step 3: Improve Error Messages**
  - [x] Add more specific error messages for different failure scenarios
  - [x] Include context information in error messages
  - [x] Ensure errors are user-friendly when surfaced in the UI

### Phase 5: Consider Domain Separation ✅

- [x] **Step 1: Evaluate Domain Separation**
  - [x] Analyze whether token-related functionality should be a separate service
  - [x] Document pros and cons of separation
  - [x] Make a decision based on domain boundaries and responsibilities

- [x] **Step 2: Implement Domain Separation (if decided)**
  - [x] Create `TokenService` for token-related operations
  - [x] Move token-related methods from `PaymentService` to `TokenService`
  - [x] Update imports and references throughout the codebase
  - [x] Ensure both services follow architecture standards

### Phase 6: Testing and Validation ✅

- [x] **Step 1: Unit Testing**
  - [x] Add unit tests for all service methods
  - [x] Test with mock responses for various scenarios
  - [x] Test error handling and retry logic
  - [x] Ensure high test coverage

- [x] **Step 2: Integration Testing**
  - [x] Test end-to-end payment flows
  - [x] Verify correct API URL construction
  - [x] Test error scenarios and recovery
  - [x] Validate hooks work correctly with the service

- [x] **Step 3: Documentation**
  - [x] Update service documentation
  - [x] Document error handling and retry logic
  - [x] Update architecture documentation
  - [x] Add JSDoc comments to all methods

## Implementation Approach

### Phase 1: Fix Class Structure

#### Step 1: Refactor BaseService Extension

The core issue is that `PaymentService` extends `BaseService` but tries to override the read-only `api` property. We'll fix this by creating an adapter that wraps `UnifiedApiClient` but matches the `BaseService.api` interface:

```typescript
// Create an adapter class that wraps UnifiedApiClient
class ApiClientAdapter {
  private client: UnifiedApiClient;

  constructor(client: UnifiedApiClient) {
    this.client = client;
  }

  async get<T>(url: string): Promise<T> {
    const response = await this.client.get<T>(url);
    // Handle response transformation if needed
    return response.data as T;
  }

  async post<T>(url: string, data: unknown): Promise<T> {
    const response = await this.client.post<T>(url, data);
    // Handle response transformation if needed
    return response.data as T;
  }

  // Implement other methods...
}

// In PaymentService constructor
constructor() {
  super();
  
  // Create UnifiedApiClient
  const apiClient = new UnifiedApiClient({
    baseUrl: window.location.origin,
    apiPath: 'api',
    debug: process.env.NODE_ENV === 'development'
  });
  
  // Create adapter that matches BaseService.api interface
  this._apiClient = apiClient;
  
  // Override BaseService methods to use our client
  this.getRequest = this.getRequestWithClient.bind(this);
  this.postRequest = this.postRequestWithClient.bind(this);
  // etc...
}
```

#### Step 2: Implement Missing Interface Methods

We'll complete the implementation of all methods required by `IPaymentService`:

```typescript
public async getPaymentHistory(limit = 10, offset = 0): Promise<ServiceResult<PaymentHistoryResponse>> {
  this.log('getPaymentHistory', { limit, offset });

  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());

    const queryString = params.toString();
    const url = `/api/payments/history${queryString ? `?${queryString}` : ''}`;

    const response = await this._apiClient.get<PaymentHistoryResponse>(url);
    
    return {
      data: response,
      error: null,
    };
  } catch (error) {
    this.log('getPaymentHistory', { error }, 'error');
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}

// Implement other missing methods...
```

### Phase 2: Fix API Client Integration

#### Step 1: Update getTokenTransactions Method

We'll update the `getTokenTransactions` method to use the API client correctly:

```typescript
public async getTokenTransactions(limit = 10, offset = 0): Promise<ServiceResult<TokenTransactionsResponse>> {
  this.log('getTokenTransactions', { limit, offset });

  try {
    const params = new URLSearchParams();
    if (limit) params.append('limit', limit.toString());
    if (offset) params.append('offset', offset.toString());
    
    // Add cache-busting parameter to prevent 304 responses
    params.append('_t', Date.now().toString());

    const queryString = params.toString();
    const url = `/api/payments/tokens/transactions${queryString ? `?${queryString}` : ''}`;
    
    this.log('getTokenTransactions', { url }, 'debug');
    
    // Use the API client to make the request
    const response = await this._apiClient.get<TokenTransactionsResponse | TokenTransaction[]>(url);
    
    // Handle both response formats
    if (Array.isArray(response)) {
      // If the API returns an array directly, transform it to the expected format
      return {
        data: {
          transactions: response,
          total: response.length
        },
        error: null,
      };
    } else {
      // If the API returns the expected format, return it as is
      return {
        data: response,
        error: null,
      };
    }
  } catch (error) {
    this.log('getTokenTransactions', { error }, 'error');
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Unknown error occurred'),
    };
  }
}
```

## Expected Results

After implementing these changes, the `PaymentService` will:

1. **Correctly Connect to Backend API**: All API requests will be correctly routed to the backend API server.

2. **Follow Architecture Standards**: The service will fully comply with our architecture standards, including hook organization.

3. **Have Robust Error Handling**: The service will handle errors gracefully, with clear error messages and retry logic.

4. **Have Clear Domain Boundaries**: If domain separation is implemented, the service will have clear boundaries between payment processing and token management.

5. **Be Fully Tested**: The service will have comprehensive unit and integration tests.

## Timeline

- **Phase 1**: 2 days
- **Phase 2**: 1 day
- **Phase 3**: 1 day
- **Phase 4**: 1 day
- **Phase 5**: 2 days (if implemented)
- **Phase 6**: 2 days

**Total Estimated Time**: 7-9 days 