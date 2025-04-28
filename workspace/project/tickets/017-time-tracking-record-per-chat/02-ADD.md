# Architectural Design Document: Time Tracking Record Per Chat

## Current Architecture

### Data Model
The current time tracking system uses the following tables and relationships:
1. `conversationTimeRecord`: Stores the cumulative time tracking information
   - Currently maintains a one-to-many relationship between user-advisor pairs and chats
   - One active record per user-advisor pair at any given time
   - Record gets updated with new chat IDs as users switch between chats
2. `chat`: Stores chat-specific information including duration
3. `user`: Stores user information including available credits

### Logic Flow
1. `initializeTimeTrackingForChat`:
   - Checks for existing records by chatId
   - If none found, checks for records by user-advisor pair
   - If found, updates the existing record with the new chatId
   - If no record exists, creates a new one

2. `getTimeTrackingData`:
   - Queries for records using chatId, advisorId, and userId
   - Expects to find a record specifically for the requested chat
   - Fails if no record with the specified chatId exists

### Current Issues
- Architectural mismatch: record management is user-advisor based, but queries are chat-specific
- When a record is updated to point to a new chat, queries for old chats fail
- This causes "No active time tracking record found" errors for previous chats
- Timer management and credit deduction are tied to the current architecture

## Proposed Architecture

### Data Model Changes
No schema changes are required, but the usage pattern will change:
1. `conversationTimeRecord`:
   - Will now maintain a one-to-one relationship between records and chats
   - Multiple active records per user-advisor pair will be permitted
   - Each chat will have its own dedicated time tracking record

### Logic Flow Changes
1. `initializeTimeTrackingForChat`:
   - **Modified**: Always check for records by chatId first
   - If found, use the existing record
   - If not found, create a new record for this chat, regardless of other records
   - **Removed**: No longer update existing records to point to new chats

2. `getTimeTrackingData`:
   - No changes required - current chat-specific query pattern will work correctly
   - Will reliably find records since each chat will have its own record

### Timer Management
1. `ChatTimerManager`:
   - No changes required to the core timer logic
   - Each chat will continue to have its own timer
   - The existing timer stopping logic for previous chats remains valuable

### Credit Tracking
1. Credit calculations need to be aware of multiple active records:
   - Free time allocation should be shared across all chats with the same advisor
   - Credit deductions should account for all active chats
   - May require changes to how free time is calculated and tracked

## Migration Strategy

### Existing Records
1. For active records pointing to a chat:
   - No changes required - these will continue to work
   - New chats will get their own records instead of updating existing ones

2. For inactive records:
   - No changes required - these are historical and not queried for active data

### Deployment Considerations
1. The changes should be deployed during a low-traffic period
2. A rollback plan should be prepared
3. Monitoring should be enhanced temporarily to catch any unexpected issues

## Interfaces and Dependencies

### Modified Components
1. `lib/time-tracking/server/actions/initialize-chat-tracking.ts`:
   - Core changes to create records per chat rather than per user-advisor pair

2. `lib/time-tracking/server/data/record-operations.ts`:
   - May need updates to support the new record creation pattern

### Unchanged Components
1. `app/time-tracking/actions/get-time-tracking-data.ts`:
   - No changes needed - the existing query pattern aligns with the new architecture

2. `lib/time-tracking/server/services/ChatTimerManager.ts`:
   - No changes needed - already manages timers per chat

## Error Handling and Edge Cases
1. For chats without records:
   - Improve error handling to create a new record if appropriate
   - Otherwise, provide clearer error messages

2. For multiple active records:
   - Ensure credit calculations account for all active records

## Performance Considerations
1. The new approach may result in more database records but:
   - Queries become simpler and more predictable
   - No complex lookups or fallback logic needed
   - The overall impact on performance should be negligible

## Security Considerations
No new security concerns are introduced by these changes.

## Testing Strategy
1. Unit tests for the modified components
2. Integration tests focusing on scenarios with multiple chats per advisor
3. End-to-end tests for the entire time tracking flow
4. Performance tests to ensure no significant overhead is introduced 