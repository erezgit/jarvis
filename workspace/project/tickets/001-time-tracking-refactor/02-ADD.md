# Time Tracking Refactoring - Architectural Design Document

## Current Architecture

The current time tracking system has these main components:

1. **Server-Side**:
   - Time calculation logic in `lib/time-tracking/server/data/time-calculation.ts`
   - Server actions in `lib/time-tracking/server/actions/`
   - Database interactions and session management

2. **Client-Side**:
   - Complex TimeTrackingProvider in `app/time-tracking/components/TimeTrackingProvider.tsx`
   - Display component in `components/time-tracking/TimeTrackingDisplay.tsx`
   - Multiple polling and heartbeat intervals

3. **Data Flow**:
   - Client polls server every 5 seconds for updates
   - Client sends heartbeats every 10 seconds
   - Visual timer updates every second independently

## Proposed Architecture

### 1. Client-Server Boundary

We'll establish a clear client-server boundary:

- **Server**: All data, calculations, and business logic
- **Client**: Display, visual timer, and minimal state management

The client will only be responsible for:
1. Displaying data from the server
2. Managing a visual timer for second-by-second updates
3. Polling the server at reasonable intervals
4. Sending heartbeats to track activity

### 2. Server APIs

We'll consolidate to two focused server endpoints:

```
app/time-tracking/
├── actions/
    ├── get-time-data.ts  # Returns minimal data needed for display
    └── heartbeat.ts      # Updates activity timestamp
```

The `get-time-data.ts` endpoint will return only the essential data:
- Current duration
- Free time remaining
- Credits
- Paid time status flag

### 3. Client Components

Replace the complex provider with a simpler component model:

```
components/time-tracking/
└── SimpleTimeDisplay.tsx  # Self-contained component with minimal state
```

The parent component (e.g., chat page) will handle heartbeat sending.

### 4. Data Flow

```
┌─────────────────┐         ┌───────────────────┐
│                 │         │                   │
│  Client         │  Poll   │   Server          │
│  (15s interval) │────────>│   get-time-data   │
│                 │<────────│                   │
│                 │         │                   │
└─────────────────┘         └───────────────────┘
        │                            ∧
        │                            │
        │                            │
        │ Heartbeat                  │
        │ (30s interval)             │
        │                            │
        ▼                            │
┌─────────────────┐         ┌───────────────────┐
│                 │         │                   │
│  Client         │         │   Server          │
│  heartbeat call │────────>│   heartbeat       │
│                 │         │                   │
└─────────────────┘         └───────────────────┘
```

### 5. Implementation Details

#### Server Endpoints

**get-time-data.ts**:
- Single DB query to get all needed data
- Return only what's needed for display
- Authentication and error handling

**heartbeat.ts**:
- Update last activity timestamp
- Authentication validation

#### Client Component

**SimpleTimeDisplay.tsx**:
- Local state for visual timer
- Server data state
- Two useEffects:
  1. For server polling (15s interval)
  2. For visual timer (1s interval)
- Minimal display logic

## Migration Plan

1. Create new server actions in parallel with existing ones
2. Create new client component in parallel with existing one
3. Test new implementation in isolation
4. Swap implementation in one component at a time
5. Remove old implementation when confirmed working

## Technical Considerations

1. **Authentication**: Maintain existing authentication flows
2. **Error handling**: Graceful degradation on network failures
3. **Dependencies**: No new dependencies required
4. **Performance**: Reduced network load with less frequent polling
5. **State Management**: Simple useState instead of complex context provider 