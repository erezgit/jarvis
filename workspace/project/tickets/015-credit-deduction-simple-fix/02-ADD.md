# Architectural Design Document: Simple Credit Deduction Fix

## Current Architecture
The time tracking system has the following components:
- ChatTimerManager: Manages active chat timers and updates time records
- Conversation time records: Store accumulated time and credits used
- Credit system: Manages user credit balances

Currently, the `updateChatTime` method in ChatTimerManager updates the credits used in the conversation time record but does not deduct credits from user accounts.

## Proposed Change
The change is simple and direct: 

```typescript
// In ChatTimerManager.updateChatTime:
// After calculating session state
if (currentState.isPaidTime) {
  const creditsToDeduct = 0.25; // Fixed amount per 15-second interval in paid time
  await deductCreditsFromUser(record.userId.toString(), creditsToDeduct);
}
```

## Design Principles
1. **Simplicity**: Direct deduction of a fixed amount, no complex logic
2. **Consistency**: The same amount added to `creditsUsed` is deducted from user balance
3. **Resilience**: Time tracking continues even if credit deduction fails

## Error Handling
Add appropriate try/catch blocks to handle deduction errors:

```typescript
try {
  await deductCreditsFromUser(userId, creditsToDeduct);
  // Log success
} catch (error) {
  // Log error but continue timer updates
}
```

## Testing Strategy
- Unit tests for direct credit deduction
- Integration tests to verify credit balance updates

## Dependencies
- `deductCreditsFromUser` function in credits service
- ChatTimerManager's updateChatTime method

No additional dependencies or new components are required. 