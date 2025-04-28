# Time Tracking Refactoring - Implementation Strategy

## Overview

We've implemented a two-pronged approach to the time tracking refactoring:

1. Creating new server actions with a cleaner API
2. Providing alternative implementations that can be used as drop-in replacements

This approach allows us to:
- Test the new implementation alongside the existing one
- Migrate components gradually
- Revert easily if issues arise
- Compare performance directly

## Directory Structure

The refactored components follow this structure:

```
app/
  time-tracking/
    actions/
      get-time-data.ts      # Simple data endpoint
      heartbeat.ts          # Simplified heartbeat mechanism
components/
  time-tracking/
    SimpleTimeDisplay.tsx    # Simplified component
    examples/
      ChatWithTimeTracking.tsx # Example usage
app/chat/advisor/[advisorId]/
  page-refactored.tsx        # Alternative chat page implementation
  components/
    custom-header-simple.tsx # Alternative header implementation
```

## Migration Strategy

### 1. Parallel Implementation

We've implemented parallel versions of key components:
- `page-refactored.tsx` alongside original `page.tsx`
- `custom-header-simple.tsx` alongside original `custom-header.tsx`

This allows direct comparison of behavior and performance.

### 2. Testing

The refactored implementation can be tested by:
1. Updating imports to point to the refactored components
2. Running the application in development mode
3. Comparing behavior side-by-side

### 3. Final Migration

Once the refactored implementation is verified:
1. Replace the original components with the refactored versions
2. Remove the TimeTrackingProvider context
3. Update all imports to use the simplified components

## Key Differences

### 1. Simplified Data Model

The original `TimeTrackingData` contained 10+ fields. The new API returns only 4 essential fields:
- `duration` (total seconds)
- `freeTimeRemaining` (free time left)
- `credits` (current balance)
- `isPaidTime` (whether paid time is active)

### 2. Direct API Calls

The refactored components:
- Call APIs directly instead of using context
- Poll at 15-second intervals instead of 5 seconds
- Send heartbeats at 30-second intervals instead of 10 seconds

### 3. Clear Client-Server Boundary

The refactored implementation:
- Keeps all calculations server-side
- Keeps all state management in the UI component
- Avoids complex shared state and refs

## Performance Improvements

The refactored implementation should provide:
1. Reduced network traffic (66% fewer API calls)
2. Simplified component tree (no provider wrappers)
3. Improved maintainability with clearer boundaries
4. Faster initial page load (fewer client components)

## Testing Notes

When testing, verify:
1. Timer increments correctly
2. Free time decreases as expected
3. Credit display updates correctly
4. Visual elements match original design
5. Proper error handling when network issues occur

## Rollback Plan

If issues are encountered:
1. Revert imports to original components
2. Keep new implementations for reference
3. Document issues for future attempts 