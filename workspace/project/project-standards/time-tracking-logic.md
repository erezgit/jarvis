# Time Tracking Logic

This document outlines the server-side time tracking logic for advisor chats.

## Core Concepts

1. **Session Timing**: Each chat session's duration is tracked and stored in the database
2. **Free Time**: Each user gets a fixed amount of free time per chat (60 seconds)
3. **Credits**: After free time expires, credits are consumed at a fixed rate
4. **Server-Side Management**: All timing and credit calculations happen on the server
5. **Database Update Cycle**: Database updates occur on a fixed 15-second schedule

## Configuration Constants

```typescript
// Free time allocation in seconds (60 seconds = 1 minute)
export const FREE_TIME_ALLOCATION_SECONDS = 60;

// Credit rate constants
export const SECONDS_PER_INTERVAL = 15;
export const CREDIT_RATE_PER_15_SECONDS = 0.25;

// Heartbeat timeout in seconds (how long before a session is considered abandoned)
export const HEARTBEAT_TIMEOUT_SECONDS = 30;
```

## Time Tracking Initialization

1. When a user starts a chat with an advisor, a new record is created in the `conversationTimeRecord` table
2. The record is initialized with:
   - `duration: 0`
   - `creditsUsed: '0'`
   - `freeTimeUsed: 0`
   - `totalFreeTimeAllocation: FREE_TIME_ALLOCATION_SECONDS`
   - `isActive: true`
3. The server starts a timer for this chat session
4. The client receives only the record ID and status, but does NOT handle timing logic

## Server-Side Timer Operation

The `ChatTimerManager` service handles all timing operations:

1. For each active chat, the timer triggers every 15 seconds
2. On each trigger, the following updates occur:

### Database Updates (Every 15 seconds)

The server updates three tables:

#### 1. `conversationTimeRecord` table:
- `duration`: Incremented by 15 seconds
- `freeTimeUsed`: Incremented by 15 seconds (until it reaches `totalFreeTimeAllocation`)
- `creditsUsed`: If free time is depleted, incremented by 0.25 credits per 15-second interval

#### 2. `chat` table:
- `duration`: Incremented by 15 seconds for the specific chat

#### 3. `user` table:
- `credits`: If free time is depleted, decremented by 0.25 credits per 15-second interval

### Update Sequence

1. Fetch the current record from the database
2. Calculate new duration (current + 15 seconds)
3. Update the chat duration
4. Determine if in free time or paid time
   - If in free time, increment `freeTimeUsed`
   - If in paid time, increment `creditsUsed` and decrement user credits
5. Update the record with new values
6. Log the update results

## State Calculation Logic

For each 15-second update, the system calculates:

1. **Free Time Remaining**:
   ```
   freeTimeRemaining = totalFreeTimeAllocation - freeTimeUsed
   ```

2. **Paid Time**:
   ```
   paidTime = max(0, duration - freeTimeUsed)
   ```

3. **Credits Used**:
   ```
   creditsUsed = (paidTime / SECONDS_PER_INTERVAL) * CREDIT_RATE_PER_15_SECONDS
   ```

4. **Is Paid Time**:
   ```
   isPaidTime = freeTimeRemaining <= 0
   ```

## Session Termination

1. A session can be terminated explicitly by the user or implicitly through timeout
2. Explicit termination: User ends the chat, server marks record as `isActive: false`
3. Implicit termination: No heartbeat received for 30 seconds, server marks record as `isActive: false`

## Implementation Requirements

- All time tracking updates MUST happen on the server side
- Database updates MUST occur every 15 seconds for active sessions
- Credit calculations MUST be accurate to 2 decimal places
- The server MUST handle multiple simultaneous chat sessions
- Updates MUST continue regardless of client connection status (as long as the session is active)

## Debugging Time Tracking Issues

When debugging time tracking issues, check:

1. The `ChatTimerManager` service logs (`[TIMER_MANAGER]` prefix)
2. Database records in the `conversationTimeRecord` table
3. Database records in the `chat` table for duration updates
4. Database records in the `user` table for credit deductions
5. Server logs for any errors or exceptions during timer updates 