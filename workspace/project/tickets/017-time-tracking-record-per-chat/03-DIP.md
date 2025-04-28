# Detailed Implementation Plan: Time Tracking Record Per Chat

## Overview
This plan outlines the steps to implement a one-to-one relationship between chats and time tracking records, resolving the architectural mismatch that causes errors when querying time tracking data for previous chats.

## Implementation Phases

### Phase 1: Analysis and Preparation
- [ ] Review the current implementation of `initializeTimeTrackingForChat`
- [ ] Review credit calculation logic to understand impact of multiple active records
- [ ] Review free time allocation logic and how it should be shared across chats
- [ ] Create a test plan for validating the changes
- [ ] Set up monitoring for relevant error rates

### Phase 2: Core Implementation
- [ ] Modify `initialize-chat-tracking.ts` to use a record-per-chat approach
- [ ] Update free time allocation tracking to be shared across all chats with the same advisor
- [ ] Adjust credit calculation logic to account for multiple active records
- [ ] Enhance error handling for cases where no record exists
- [ ] Add additional logging for diagnostic purposes

### Phase 3: Testing
- [ ] Test with single chat scenarios to ensure basic functionality works
- [ ] Test with multiple chats per advisor to verify record creation works correctly
- [ ] Test credit deduction with multiple simultaneous active chats
- [ ] Test free time allocation sharing between chats
- [ ] Test edge cases such as abandoned chats and rapid chat switching

### Phase 4: Deployment and Monitoring
- [ ] Create a rollback plan
- [ ] Deploy changes to staging environment
- [ ] Conduct thorough testing in staging environment
- [ ] Deploy to production during low-traffic period
- [ ] Monitor error rates and performance metrics
- [ ] Prepare documentation for the changes

## Detailed Implementation Steps

### 1. Modify `initialize-chat-tracking.ts`

```typescript
async function _initializeTimeTrackingForChat(
  userId: string,
  advisorId: string,
  chatId: string
): Promise<{ success: boolean; recordId?: string; error?: string }> {
  const startTime = Date.now();
  console.log(`[INIT_TIME_TRACKING] Initializing time tracking for chat:`, {
    userId, advisorId, chatId
  });
  
  try {
    const now = new Date();
    
    // First check for existing record for this specific chat
    console.log(`[INIT_TIME_TRACKING] Checking for existing record for chat ${chatId}`);
    const chatRecords = await db
      .select()
      .from(conversationTimeRecord)
      .where(
        and(
          eq(conversationTimeRecord.chatId, chatId),
          eq(conversationTimeRecord.isActive, true)
        )
      );
    
    // If we found an active record for this chat, use it
    if (chatRecords.length > 0) {
      const record = chatRecords[0];
      console.log(`[INIT_TIME_TRACKING] Found existing record for chat ${chatId}:`, {
        recordId: record.id
      });
      
      // Update the heartbeat time
      await db
        .update(conversationTimeRecord)
        .set({ lastHeartbeatTime: now })
        .where(eq(conversationTimeRecord.id, record.id));

      // Start a timer for this record if one doesn't already exist
      try {
        if (!chatTimerManager.hasTimer(chatId)) {
          console.log(`[INIT_TIME_TRACKING] Starting timer for existing chat record: ${record.id}`);
          chatTimerManager.startTimer(
            chatId,
            record.id.toString(),
            userId,
            advisorId
          );
        } else {
          console.log(`[INIT_TIME_TRACKING] Timer already exists for chat ${chatId}`);
        }
      } catch (timerError) {
        console.error(`[INIT_TIME_TRACKING] Error starting timer for existing chat record:`, timerError);
        // Continue without failing - we still want to return the record
      }
      
      return { 
        success: true,
        recordId: record.id.toString()
      };
    }
    
    // CRITICAL CHANGE: Instead of checking for and updating existing user-advisor records,
    // we'll create a new record for this chat
    
    // Get the free time allocation information from other active records
    const userAdvisorRecords = await db
      .select()
      .from(conversationTimeRecord)
      .where(
        and(
          eq(conversationTimeRecord.userId, userId),
          eq(conversationTimeRecord.advisorId, advisorId),
          eq(conversationTimeRecord.isActive, true)
        )
      );
    
    // Calculate total free time already used across all chats with this advisor
    let totalFreeTimeUsed = 0;
    if (userAdvisorRecords.length > 0) {
      // Use the maximum free time used across all records
      totalFreeTimeUsed = Math.max(...userAdvisorRecords.map(r => r.freeTimeUsed || 0));
      console.log(`[INIT_TIME_TRACKING] Found ${userAdvisorRecords.length} active records for user-advisor pair, max free time used: ${totalFreeTimeUsed}`);
    }
    
    // Create a new record for this chat
    console.log(`[INIT_TIME_TRACKING] Creating new record for chat ${chatId}`);
    
    const [newRecord] = await db
      .insert(conversationTimeRecord)
      .values({
        userId,
        advisorId,
        chatId,
        duration: 0,
        creditsUsed: '0',
        freeTimeUsed: totalFreeTimeUsed, // Share free time usage
        totalFreeTimeAllocation: FREE_TIME_ALLOCATION_SECONDS,
        isActive: true,
        timestamp: now,
        lastHeartbeatTime: now
      })
      .returning();
    
    console.log(`[INIT_TIME_TRACKING] Created new record:`, {
      recordId: newRecord.id
    });
    
    // Start a timer for the new record
    try {
      console.log(`[INIT_TIME_TRACKING] Starting timer for new record: ${newRecord.id}`);
      chatTimerManager.startTimer(
        chatId,
        newRecord.id.toString(),
        userId,
        advisorId
      );
    } catch (timerError) {
      console.error(`[INIT_TIME_TRACKING] Error starting timer for new record:`, timerError);
      // Continue without failing - we still want to return the record
    }
    
    return { 
      success: true,
      recordId: newRecord.id.toString()
    };
  } catch (error) {
    console.error(`[INIT_TIME_TRACKING] Failed to initialize time tracking:`, error);
    
    return { 
      success: false,
      error: `Failed to initialize time tracking: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}
```

### 2. Update Free Time Calculation

Modify credit calculation to account for multiple active records:

```typescript
// In credit calculation logic
async function calculateCreditsForChat(userId: string, advisorId: string, chatId: string): Promise<{ creditsUsed: string, freeTimeUsed: number }> {
  // Get all active records for this user-advisor pair
  const records = await db
    .select()
    .from(conversationTimeRecord)
    .where(
      and(
        eq(conversationTimeRecord.userId, userId),
        eq(conversationTimeRecord.advisorId, advisorId),
        eq(conversationTimeRecord.isActive, true)
      )
    );
  
  // Find the record for this specific chat
  const chatRecord = records.find(r => r.chatId.toString() === chatId);
  if (!chatRecord) {
    throw new Error('No active record found for chat');
  }
  
  // Calculate total free time used across all chats
  const totalFreeTimeUsed = Math.max(...records.map(r => r.freeTimeUsed || 0));
  
  // Calculate credits based on this chat's duration and shared free time usage
  return calculateCredits(chatRecord.duration, totalFreeTimeUsed);
}
```

### 3. Update ChatTimerManager Credit Deduction Logic

```typescript
// In updateChatTime method of ChatTimerManager
// After getting the active time record

// Get all active records for this user-advisor pair to calculate shared free time
const userAdvisorRecords = await db
  .select()
  .from(conversationTimeRecord)
  .where(
    and(
      eq(conversationTimeRecord.userId, record.userId),
      eq(conversationTimeRecord.advisorId, record.advisorId),
      eq(conversationTimeRecord.isActive, true)
    )
  );

// Use the maximum free time used across all records
const maxFreeTimeUsed = Math.max(...userAdvisorRecords.map(r => r.freeTimeUsed || 0));

// Calculate credits based on this record's duration but with shared free time
const { creditsUsed, freeTimeUsed } = calculateCredits(newCumulativeDuration, maxFreeTimeUsed);

// Update all active records with the new shared free time value
for (const activeRecord of userAdvisorRecords) {
  if (activeRecord.id.toString() !== recordId) {
    await db.update(conversationTimeRecord)
      .set({ freeTimeUsed })
      .where(eq(conversationTimeRecord.id, activeRecord.id));
  }
}
```

## Testing Strategy

| Test Case | Description | Expected Result |
|-----------|-------------|-----------------|
| Single Chat | Create a new chat and initialize time tracking | Record is created and timer starts |
| Multiple Chats | Create multiple chats with same advisor | Each chat gets its own record, free time is shared |
| Switch Between Chats | Create chat A, then B, then go back to A | Chat A's record remains active, no errors when querying |
| Free Time Sharing | Use free time in chat A, then start chat B | Chat B starts with the same free time usage as chat A |
| Credit Deduction | Use paid time in multiple chats | Credits are deducted correctly for each chat |
| Abandoned Sessions | Leave chat idle until abandoned | Record is marked inactive properly |

## Rollback Plan

If issues are discovered after deployment:
1. Revert changes to `initialize-chat-tracking.ts`
2. Revert any changes to credit calculation logic
3. Restore the original user-advisor based record management approach
4. Create a follow-up ticket to address the issues with a revised approach

## Dependencies
- Existing time tracking system
- ChatTimerManager for timer management
- Credit calculation and deduction logic

## Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Multiple records may cause credit calculation errors | Thorough testing of credit deduction logic |
| Free time sharing may be inconsistent | Add synchronization points and verification checks |
| Performance impact from more records | Monitor database performance metrics |
| Migration issues with existing records | Create scripts to verify record consistency |

## Estimation
- Analysis and preparation: 1-2 days
- Implementation: 2-3 days
- Testing: 2-3 days
- Deployment and monitoring: 1 day
- Total: 6-9 days 