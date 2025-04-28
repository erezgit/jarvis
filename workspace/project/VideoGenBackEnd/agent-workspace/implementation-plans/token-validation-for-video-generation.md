# Token Validation for Video Generation

## Overview

Currently, users can generate videos regardless of their token balance. This implementation plan outlines the changes needed to ensure that users can only generate videos if they have sufficient tokens, and that tokens are properly deducted upon successful video generation.

## Current State

- Video generation does not check user token balance
- No tokens are deducted for video generation
- Users with zero credits can still generate videos

## Target State

- System validates that the user has sufficient tokens before starting video generation
- System deducts tokens for successful video generation
- Users with insufficient tokens receive a clear error message
- Token transactions are properly recorded

## Implementation Plan

### Phase 1: Backend Token Integration

- [x] 1.1 Update dependencies in VideoGenerationService
  - [x] Inject TokenService into VideoGenerationService constructor
  - [x] Update TYPES in lib/types.ts to include TokenService
  - [x] Configure token cost constant for video generation

- [x] 1.2 Add token validation logic
  - [x] Implement balance check in startGeneration method
  - [x] Create InsufficientTokensError in error handling
  - [x] Add appropriate logging for token validation
  
- [x] 1.3 Update error codes and middleware
  - [x] Add INSUFFICIENT_TOKENS to ErrorCode enum
  - [x] Update HTTP status mapping in errorHandler middleware
  - [x] Ensure proper error serialization in responses

- [x] 1.4 Implement token deduction 
  - [x] Create handleGenerationCompletion method
  - [x] Add token deduction after successful video processing
  - [x] Add transaction recording with proper description
  - [x] Implement error handling for failed deductions

### Phase 2: Integration Testing

- [x] 2.1 Create unit tests
  - [x] Test token validation with insufficient balance
  - [x] Test token validation with sufficient balance
  - [x] Test token deduction after successful generation
  - [x] Test error handling for token service failures

- [x] 2.2 Create integration tests
  - [x] Test complete flow with zero credit user
  - [x] Test complete flow with sufficient credit user
  - [x] Test edge cases (exact token amount)

### Phase 3: Frontend Updates

> **Note**: The frontend codebase is not available in this repository. The following tasks should be implemented by the frontend team once the backend changes are complete.

- [ ] 3.1 Update API client
  - [ ] Add error handling for insufficient token responses
  - [ ] Update response types to include token-specific errors
  
- [ ] 3.2 Update UI components
  - [ ] Add error display for insufficient tokens
  - [ ] Show token cost before generation
  - [ ] Display current token balance
  - [ ] Update balance display after successful generation

### Phase 4: Monitoring and Analytics

- [x] 4.1 Enhance logging
  - [x] Add structured logging for token validation events
  - [x] Track token usage patterns
  - [x] Monitor failed validations
  
- [ ] 4.2 Create admin dashboard
  - [ ] Show token usage statistics
  - [ ] Display user token balances
  - [ ] Track token consumption over time

## Detailed Implementation Steps

### 1. Update VideoGenerationService Dependencies

```typescript
// src/services/video/generation.ts

// Add import
import { ITokenService } from '../token/types';
import { InsufficientTokensError } from '../token/errors';

@injectable()
export class VideoGenerationService extends BaseService implements IVideoGenerationService {
  // Add tokenService to constructor
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.VideoRepository) private readonly repository: VideoRepository,
    @inject(TYPES.VideoValidationService) private readonly validationService: VideoValidationService,
    @inject(TYPES.ProjectService) private readonly projectService: ProjectService,
    @inject(TYPES.RunwayClient) private readonly runwayClient: RunwayClient,
    @inject(TYPES.VideoProcessingService) private readonly processingService: VideoProcessingService,
    @inject(TYPES.TokenService) private readonly tokenService: ITokenService
  ) {
    super(logger, 'VideoGenerationService');
  }
}
```

### 2. Add Token Validation Logic

```typescript
// src/services/video/generation.ts

// Add token cost configuration
const VIDEO_GENERATION_TOKEN_COST = 1; // Cost per video generation

async startGeneration(
  userId: string,
  prompt: string,
  projectId: string
): Promise<VideoGenerationResult> {
  try {
    this.logger.info('Starting video generation', {
      userId,
      projectId,
      timestamp: new Date().toISOString()
    });

    // Check if user has enough tokens
    const balanceResult = await this.tokenService.getUserBalance(userId);
    
    if (!balanceResult.success) {
      throw new VideoGenerationError(
        'Failed to check token balance',
        { userId }
      );
    }
    
    if (balanceResult.data < VIDEO_GENERATION_TOKEN_COST) {
      throw new VideoGenerationError(
        'Insufficient tokens for video generation',
        { 
          userId,
          currentBalance: balanceResult.data,
          requiredTokens: VIDEO_GENERATION_TOKEN_COST
        },
        ErrorCode.INSUFFICIENT_TOKENS
      );
    }

    // Continue with existing generation flow...
    // ...
  } catch (error) {
    // Add specific handling for token errors
    if (error instanceof VideoError) {
      throw error;
    }
    
    throw new VideoGenerationError(
      'Failed to start generation',
      { error: error instanceof Error ? error.message : 'Unknown error' }
    );
  }
}
```

### 3. Implement Token Deduction

```typescript
// src/services/video/generation.ts

// Add to the completion handler in the status polling method
private async handleGenerationCompletion(
  generationId: string,
  userId: string,
  outputUrl: string
): Promise<void> {
  try {
    // Process video logic...
    
    // After successful video processing
    // Deduct tokens for the completed generation
    const tokenResult = await this.tokenService.useTokens(
      userId, 
      VIDEO_GENERATION_TOKEN_COST,
      `Video generation: ${generationId}`
    );
    
    if (!tokenResult.success) {
      this.logger.error('Failed to deduct tokens for video generation', {
        error: tokenResult.error,
        userId,
        generationId,
        tokenCost: VIDEO_GENERATION_TOKEN_COST
      });
      
      // Note: We don't fail the generation if token deduction fails
      // since the video has already been generated
    } else {
      this.logger.info('Tokens deducted for video generation', {
        userId,
        generationId,
        tokenCost: VIDEO_GENERATION_TOKEN_COST,
        newBalance: tokenResult.data
      });
    }
    
    // Existing completion logic...
  } catch (error) {
    // Error handling...
  }
}
```

### 4. Update Video Error Codes

```typescript
// src/services/video/errors.ts

// Add new error code
export enum ErrorCode {
  BAD_REQUEST = 'bad_request',
  UNAUTHORIZED = 'unauthorized',
  FORBIDDEN = 'forbidden',
  NOT_FOUND = 'not_found',
  VALIDATION_ERROR = 'validation_error',
  GENERATION_ERROR = 'generation_error',
  INSUFFICIENT_TOKENS = 'insufficient_tokens',
  PROCESSING_ERROR = 'processing_error',
  INTERNAL_ERROR = 'internal_error'
}
```

### 5. Update Error Handler Middleware

```typescript
// src/middleware/errorHandler.ts

// Update HTTP status code mapping
const getStatusCode = (errorCode: string): number => {
  switch (errorCode) {
    // Existing mappings...
    case ErrorCode.INSUFFICIENT_TOKENS:
      return HttpStatus.PAYMENT_REQUIRED; // 402 Payment Required
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
};
```

### 6. Update Container Registration

```typescript
// src/config/container.ts

// Ensure TokenService is registered
container.register<ITokenService>(TYPES.TokenService, {
  useClass: TokenService
});

// Add TokenService type
// src/lib/types.ts
export const TYPES = {
  // Existing types...
  TokenService: Symbol.for('TokenService'),
};
```

### 7. Update Frontend Error Handling

```typescript
// frontend/src/components/VideoGeneration.tsx

const handleGenerate = async () => {
  try {
    setGenerating(true);
    setError(null);
    
    const response = await api.generateVideo(projectId, prompt);
    
    if (response.success) {
      setGenerationId(response.generationId);
      startPolling(response.generationId);
    } else {
      handleError(response.error);
    }
  } catch (error) {
    if (error.code === 'insufficient_tokens') {
      setError('You do not have enough tokens to generate a video. Please purchase more tokens.');
    } else {
      setError('Failed to start video generation. Please try again.');
    }
  } finally {
    setGenerating(false);
  }
};
```

## Testing Plan

1. **Zero Credit Test**: Attempt to generate a video with a user that has zero credits
   - Expected: Generation should fail with "insufficient_tokens" error

2. **Sufficient Credit Test**: Generate a video with a user that has sufficient credits
   - Expected: Generation should succeed and tokens should be deducted

3. **Balance Edge Case**: Generate a video with a user that has exactly the required token amount
   - Expected: Generation should succeed and balance should be reduced to zero

4. **Error Handling Test**: Simulate token service failure during validation
   - Expected: Generation should fail with appropriate error message

## Success Criteria

- [ ] Users with zero credits cannot generate videos
- [ ] Appropriate error messages are displayed when token balance is insufficient
- [ ] Tokens are correctly deducted after successful video generation
- [ ] Token transactions are properly recorded with correct descriptions
- [ ] System gracefully handles failures in token validation or deduction

## Progress Tracking

### Current Status: Almost Complete 🟢

- Phase 1: Backend Token Integration ✅ (100% complete)
- Phase 2: Integration Testing ✅ (100% complete)
- Phase 3: Frontend Updates ⬜ (0% complete - to be implemented by frontend team)
- Phase 4: Monitoring and Analytics 🟡 (50% complete)

## Summary of Completed Work

We have completed most of the implementation for token validation during video generation:

1. Updated the VideoGenerationService to check if the user has sufficient tokens before starting video generation.
2. Implemented token deduction after successful video processing.
3. Added proper error handling for insufficient tokens, including HTTP 402 Payment Required status code.
4. Ensured proper error serialization in responses.
5. Created unit and integration tests for the token validation functionality.
6. Enhanced logging for token validation and deduction events to enable monitoring and analytics.

## Next Steps

1. **Remaining Implementation**: Implement the admin dashboard for token usage tracking.

2. **Frontend Implementation**: Coordinate with the frontend team to implement proper error handling and token balance display.

3. **Testing in Staging**: Test the complete solution in a staging environment to verify that token validation and deduction work correctly in a production-like setting.

4. **Monitoring Setup**: Configure dashboards and alerts for token-related metrics to monitor usage patterns and detect issues.

## Deployment Plan

1. Deploy the backend changes first and verify they work correctly.
2. Coordinate with the frontend team to ensure their implementation is compatible.
3. Roll out the complete feature once both backend and frontend are ready.
4. Monitor token usage patterns and user feedback after release.

This phased approach ensures that the token validation is properly implemented and tested before being exposed to users.