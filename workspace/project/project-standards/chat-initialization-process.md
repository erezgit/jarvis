# Chat Initialization Process

This document details the step-by-step flow when a user starts a new chat with an advisor, focusing on how time tracking is initialized.

## Server-Side Initialization

1. User navigates to `/chat/advisor/[advisorId]` in their browser.
2. Server begins rendering `app/chat/advisor/[advisorId]/page.tsx`.
3. Server retrieves user authentication via `const session = await auth()`.
4. Server extracts user ID via `const userId = session?.user?.id`.
5. Server generates a unique chat ID via `const chatId = generateUUID()`.
6. Server checks for any unsummarized chats for this user-advisor pair.
7. Server processes any unsummarized chats if they exist.
8. Server saves the new chat to database via `await saveChat({...})`.
9. Server initializes time tracking via `await initializeTimeTrackingForChat(userId, advisorId, chatId)`.
10. Within `initializeTimeTrackingForChat`, server checks for existing active records.
11. If an existing active record is found, server updates its `chatId` and `lastHeartbeatTime`.
12. If no existing record is found, server creates a new time tracking record with initial values.
13. Server stores the initialization result in `timeTrackingInitialized` and `timeTrackingRecordId`.
14. Server verifies record creation via `await debugCheckTimeTrackingRecord()`.
15. Server creates a placeholder "Hello" message from the user.
16. Server generates AI welcome message via `await generateWelcomeMessage()`.
17. Server adds both messages to `initialMessages` array if successful.
18. Server returns the rendered page with `<TimeTrackingProvider>` and `<AdvisorChatWindow>` components.

## Client-Side Hydration

19. Client-side React hydration begins.
20. `<TimeTrackingProvider>` component initializes with `serverInitialized` and `existingRecordId` props.
21. `TimeTrackingProvider` initializes state with default values.
22. `TimeTrackingProvider.useEffect` runs when component mounts.
23. `TimeTrackingProvider` checks if server initialization was successful.
24. If server initialization failed, `TimeTrackingProvider` logs error and stops - no fallback to client-side creation.
25. If server initialization succeeded, `TimeTrackingProvider` loads record data via `getTimeTrackingData()`.
26. `TimeTrackingProvider` updates its state with values from server.
27. `TimeTrackingProvider` sets up polling interval to update time tracking data every 5 seconds.
28. `TimeTrackingProvider` sets up heartbeat interval to send activity status every 10 seconds.
29. `useTimeTrackingContext` hook provides time tracking state to child components.

## Chat Interface Initialization

30. `<AdvisorChatWindow>` component mounts with props from server.
31. Component initializes debug logger and scrolling functionality.
32. Component sets up `useChat()` hook with chat configuration.
33. Component prepares the UI for displaying messages.
34. If `initialMessages` array contains messages, they are displayed immediately.
35. Component waits for full page load to complete.
36. Component checks for authentication before processing automatic welcome message.

## Time Tracking Monitoring

37. Client polls server for updated time tracking data every 5 seconds.
38. Server responds with current values for `chatDuration`, `freeTimeRemaining`, etc.
39. Client updates UI with received values.
40. Client sends heartbeat to server every 10 seconds to indicate active session.
41. If page becomes hidden, polling pauses but session remains active on server.
42. If page becomes visible again, client immediately polls for updates.
43. If user closes browser or navigates away, client attempts to send close notification.

## Key Differences from Previous Implementation

- **Server-Side Only Creation**: Time tracking records are now ONLY created on the server.
- **No Client-Side Fallbacks**: If server initialization fails, client components display error rather than creating a new record.
- **Single Source of Truth**: All time tracking data comes from the server via polling.
- **Reduced Race Conditions**: By eliminating client-side record creation, race conditions are minimized.
- **Simplified Client Logic**: Client components focus only on displaying data, not creating or managing records.

## Debugging Markers

- `[ADVISOR_PAGE_DEBUG]` - Page-level initialization
- `[INIT_TIME_TRACKING]` - Server-side time tracking initialization
- `[TIME_TRACKING]` - Client-side time tracking provider
- `[GET_TIME_TRACKING]` - Data fetching from server
- `[CHAT_SUMMARY_DEBUG]` - Welcome message generation 