# Time Tracking Frontend Refactoring

## Overview
The current time tracking implementation has grown complex with duplicated logic and an overengineered client-server boundary. This ticket focuses on simplifying the client-side implementation to follow a cleaner architecture where the frontend is only responsible for displaying data and visual timer updates, while all calculations and business logic remain on the server.

## Problem Statement
1. The current TimeTrackingProvider is overly complex (200+ lines)
2. Client-side code has too many responsibilities beyond displaying data
3. Polling frequency may be excessive (every 5 seconds)
4. The client-server boundary is not clearly defined
5. State management is complex with multiple refs and intervals

## Goals
1. Simplify the client-side implementation to focus only on:
   - Displaying time tracking data (time, free time remaining, credits)
   - Visual timer for second-by-second updates
   - Polling server for updates at reasonable intervals

2. Ensure all business logic (credit calculations, session management) stays on the server

3. Reduce network overhead by:
   - Decreasing polling frequency (15 seconds instead of 5)
   - Minimizing data transfer (only return what's needed for display)

4. Maintain existing functionality from the user's perspective

## Non-Goals
1. Changing the database schema
2. Changing the server-side calculation logic
3. Redesigning the UI/UX of the time tracking display
4. Addressing any performance issues unrelated to the client-server architecture

## Requirements
1. Replace the TimeTrackingProvider with a simpler component model
2. Consolidate server endpoints to clear, focused APIs
3. Keep the visual timer but simplify its implementation
4. Ensure credits and time calculations only happen server-side
5. Maintain proper heartbeat functionality to track session activity
6. Ensure the refactored implementation works with the existing UI design
7. Implement proper error handling for network failures

## Success Criteria
1. Frontend code is significantly simplified (removal of complex state management)
2. All calculations happen server-side only
3. Network activity is reduced
4. End-user experience remains unchanged
5. No regressions in functionality 