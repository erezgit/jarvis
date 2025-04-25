# Time Tracking Refactoring - Detailed Implementation Plan

## Phase 1: Server-Side Refactoring

### Step 1: Create simplified server action for time data
- [x] Create `app/time-tracking/actions/get-time-data.ts`
- [x] Implement function to retrieve only necessary data
- [x] Add proper error handling and authentication
- [x] Test the endpoint independently

### Step 2: Create simplified heartbeat action
- [x] Create `app/time-tracking/actions/heartbeat.ts`
- [x] Implement function to update last activity timestamp
- [x] Add proper error handling and authentication
- [x] Test the endpoint independently

## Phase 2: Client-Side Implementation

### Step 3: Create new client component
- [x] Create `components/time-tracking/SimpleTimeDisplay.tsx`
- [x] Implement visual timer with useEffect
- [x] Implement server polling logic
- [x] Add proper error handling
- [x] Style to match existing design

### Step 4: Update parent components
- [x] Create example component showing proper usage
- [x] Create alternative implementation for AdvisorChatHeader
- [x] Create alternative implementation for chat page
- [ ] Test implementations in development environment

## Phase 3: Integration and Testing

### Step 5: Integration testing
- [ ] Test in development environment
- [ ] Verify all functionality works as expected
- [ ] Test edge cases (network failures, session expiry)
- [ ] Compare behavior with original implementation

### Step 6: Performance validation
- [ ] Verify reduced network requests
- [ ] Check for any performance regressions
- [ ] Ensure visual timer behaves smoothly

## Phase 4: Cleanup

### Step 7: Remove old implementation
- [ ] Remove TimeTrackingProvider when confirmed working
- [ ] Remove unused server actions and utilities
- [ ] Update any documentation references
- [ ] Clean up any unused imports

### Step 8: Final review
- [ ] Conduct code review
- [ ] Check for any remaining console logs
- [ ] Verify no regressions in production environment

## Implementation Details

### 1. Server Endpoint: get-time-data.ts

```typescript
'use server'

import { auth } from '@/app/(auth)/auth';
import db from '@/lib/db';
import { conversationTimeRecord, chat, user } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createServerAction } from '@/lib/server-action';

export type TimeTrackingData = {
  duration: number;        // Total seconds of chat
  freeTimeRemaining: number; // Seconds of free time left
  credits: string;         // Current credit balance
  isPaidTime: boolean;     // Whether user is in paid time
}

async function _getTimeData(
  advisorId: string,
  chatId: string
): Promise<TimeTrackingData> {
  // 1. Authentication check
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Authentication required');
  
  // 2. Get data in a single DB query with JOINs
  const records = await db
    .select({
      chatDuration: chat.duration,
      freeTimeUsed: conversationTimeRecord.freeTimeUsed,
      userCredits: user.credits
    })
    .from(conversationTimeRecord)
    .innerJoin(chat, eq(chat.id, conversationTimeRecord.chatId))
    .innerJoin(user, eq(user.id, conversationTimeRecord.userId))
    .where(
      and(
        eq(conversationTimeRecord.userId, userId),
        eq(conversationTimeRecord.advisorId, advisorId),
        eq(conversationTimeRecord.chatId, chatId),
        eq(conversationTimeRecord.isActive, true)
      )
    );
    
  if (records.length === 0) {
    throw new Error('No active time tracking record found');
  }
  
  const record = records[0];
  const freeTimeRemaining = Math.max(0, 60 - (record.freeTimeUsed || 0));
  
  // 3. Return only what the client needs
  return {
    duration: record.chatDuration || 0,
    freeTimeRemaining,
    credits: (record.userCredits || '0').toString(),
    isPaidTime: freeTimeRemaining <= 0
  };
}

export const getTimeData = createServerAction(_getTimeData);
```

### 2. Server Endpoint: heartbeat.ts

```typescript
'use server'

import { auth } from '@/app/(auth)/auth';
import db from '@/lib/db';
import { conversationTimeRecord } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';
import { createServerAction } from '@/lib/server-action';

async function _sendHeartbeat(
  advisorId: string, 
  chatId: string
): Promise<void> {
  // 1. Authentication check
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) throw new Error('Authentication required');
  
  // 2. Update last heartbeat time
  await db
    .update(conversationTimeRecord)
    .set({ lastHeartbeatTime: new Date() })
    .where(
      and(
        eq(conversationTimeRecord.userId, userId),
        eq(conversationTimeRecord.advisorId, advisorId),
        eq(conversationTimeRecord.chatId, chatId),
        eq(conversationTimeRecord.isActive, true)
      )
    );
}

export const sendHeartbeat = createServerAction(_sendHeartbeat);
```

### 3. Client Component: SimpleTimeDisplay.tsx

```tsx
'use client';

import { useState, useEffect } from 'react';
import { formatTime } from '@/lib/time-tracking/utils/formatting';
import { getTimeData } from '@/app/time-tracking/actions/get-time-data';
import type { TimeTrackingData } from '@/app/time-tracking/actions/get-time-data';

interface SimpleTimeDisplayProps {
  advisorId: string;
  chatId: string;
  showDetails?: boolean;
}

export function SimpleTimeDisplay({ 
  advisorId, 
  chatId, 
  showDetails = false 
}: SimpleTimeDisplayProps) {
  // State for server data
  const [serverData, setServerData] = useState<TimeTrackingData>({
    duration: 0,
    freeTimeRemaining: 60,
    credits: '0.00',
    isPaidTime: false
  });
  
  // Visual timer that increments every second
  const [visualTimer, setVisualTimer] = useState(0);
  
  // Fetch data from server
  useEffect(() => {
    // Initial fetch
    fetchData();
    
    // Set up polling interval (every 15 seconds)
    const intervalId = setInterval(fetchData, 15000);
    
    return () => clearInterval(intervalId);
    
    async function fetchData() {
      try {
        const data = await getTimeData(advisorId, chatId);
        setServerData(data);
        setVisualTimer(data.duration); // Sync visual timer with server time
      } catch (error) {
        console.error('Error fetching time data:', error);
      }
    }
  }, [advisorId, chatId]);
  
  // Visual timer that updates every second
  useEffect(() => {
    const timerId = setInterval(() => {
      setVisualTimer(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timerId);
  }, []);
  
  // Simple display without details
  if (!showDetails) {
    return <span className="font-mono text-sm">{formatTime(visualTimer)}</span>;
  }
  
  // Detailed display
  return (
    <div className="w-full rounded-md bg-white p-3 border border-gray-200">
      <h3 className="font-medium mb-2 text-center text-sm">Time Tracking</h3>
      
      <div className="flex justify-center mb-3">
        <span className="font-mono text-lg">
          {formatTime(visualTimer)}
        </span>
      </div>
      
      <div className="flex flex-col space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Free time:</span>
          <span className="text-xs font-mono">{formatTime(serverData.freeTimeRemaining)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-gray-500">Credits:</span>
          <span className="text-xs font-mono">{serverData.credits}</span>
        </div>
        
        {serverData.isPaidTime && (
          <div className="mt-1 bg-amber-100 p-1 rounded text-amber-800 text-xs">
            Using paid credits
          </div>
        )}
      </div>
    </div>
  );
}
```

### 4. Usage in Parent Component

```tsx
// In parent component (e.g., chat page)
import { SimpleTimeDisplay } from '@/components/time-tracking/SimpleTimeDisplay';
import { sendHeartbeat } from '@/app/time-tracking/actions/heartbeat';
import { useEffect } from 'react';

export function ChatComponent({ advisorId, chatId }) {
  // Set up heartbeat
  useEffect(() => {
    // Send initial heartbeat
    sendHeartbeat(advisorId, chatId);
    
    // Set up heartbeat interval (every 30 seconds)
    const heartbeatId = setInterval(() => {
      sendHeartbeat(advisorId, chatId);
    }, 30000);
    
    return () => clearInterval(heartbeatId);
  }, [advisorId, chatId]);
  
  return (
    <div>
      {/* Other chat UI */}
      <SimpleTimeDisplay 
        advisorId={advisorId}
        chatId={chatId}
        showDetails={true}
      />
    </div>
  );
}
``` 