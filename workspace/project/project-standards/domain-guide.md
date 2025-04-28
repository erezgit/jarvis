# Domain Guide

This document provides an overview of our business domains, their responsibilities, and their interactions. Use this guide to understand where new features should be placed and how domains should communicate.

## Domain Overview

Our application is organized into these core business domains:

![Domain Diagram](https://via.placeholder.com/800x400?text=Domain+Relationships+Diagram)

## User Domain

**Core Responsibility**: Managing user identity and authentication.

### Key Concepts
- User profiles
- Authentication
- Session management
- User preferences

### Main Components
- Authentication forms
- User profile management
- Session handling
- User menu

### APIs
- `/api/user/profile` - Get/update user profile
- `/api/auth/*` - Authentication endpoints

### Integration Points
- Provides user context to other domains
- Manages authentication state

### Current Status
✅ Available for new feature development

## Billing Domain

**Core Responsibility**: Managing payment processing and credit systems.

### Key Concepts
- Credit packages
- Transactions
- Payment simulation
- Credit balance

### Main Components
- Credit display
- Package selection cards
- Transaction history
- Payment forms

### APIs
- `/api/billing/credits` - Get/update credit balance
- `/api/billing/packages` - Get available packages
- `/api/billing/transactions` - Record transactions

### Integration Points
- Uses User domain for identity
- Provides credit information to Time Tracking

### Current Status
✅ Available for new feature development

## Time Tracking Domain

**Core Responsibility**: Managing conversation time and credit consumption.

### Key Concepts
- Session duration
- Credit consumption
- Free minutes tracking
- Timer controls

### Main Components
- Timer display
- Timer controls
- Session summary
- Credit usage indicators

### APIs
- `/api/time-tracking/sessions` - Record time sessions
- `/api/time-tracking/records` - Get session history

### Integration Points
- Uses Billing domain for credit information
- Provides duration info to Chat domain
- Uses User domain for session attribution

### Current Status
✅ Available for new feature development

## Advisor Domain

**Core Responsibility**: Managing advisor profiles and capabilities.

### Key Concepts
- Advisor profiles
- Expertise categories
- Availability
- Ratings

### Main Components
- Advisor cards
- Advisor detail pages
- Search and filters
- Rating displays

### APIs
- `/api/advisors` - Get advisor listings
- `/api/advisors/[id]` - Get advisor details
- `/api/advisors/search` - Search advisors

### Integration Points
- Uses User domain for identity
- Provides advisor info to Chat domain

### Current Status
✅ Available for new feature development

## Chat Domain

**Core Responsibility**: Managing conversations between users and advisors.

### Key Concepts
- Conversations
- Messages
- Chat sessions
- Message types

### Main Components
- Chat window
- Message bubbles
- Input area
- Typing indicators

### APIs
- `/api/chat/conversations` - Manage conversations
- `/api/chat/messages` - Send/receive messages

### Integration Points
- Uses User domain for identity
- Uses Advisor domain for advisor context
- Uses Time Tracking domain for session timing

### Current Status
✅ Available for new feature development

## Cross-Domain Integration Patterns

### Direct API Imports

For type definitions or essential utilities:

```typescript
import type { UserProfile } from '@/modules/user/types';
```

### Props-Based Integration

```tsx
// In Chat domain
function ChatWindow({ userId, advisorId }) {
  // Implementation
}

// In page component
<ChatWindow 
  userId={user.id} 
  advisorId={advisor.id} 
/>
```

### React Context

```tsx
// In a page component
<UserProvider>
  <BillingProvider>
    <ChatWindow />
  </BillingProvider>
</UserProvider>

// In ChatWindow (Chat domain)
function ChatWindow() {
  const { user } = useUser();  // From User domain
  const { credits } = useCredits();  // From Billing domain
  
  // Component implementation
}
```

### Event-Based Communication

```typescript
// In Billing domain
eventBus.emit('billing:credits-updated', { credits: 100 });

// In Time Tracking domain
useEffect(() => {
  const handleCreditsUpdated = (data) => {
    // Update local state
  };
  
  eventBus.on('billing:credits-updated', handleCreditsUpdated);
  return () => eventBus.off('billing:credits-updated', handleCreditsUpdated);
}, []);
```

## Domain Organization Standards

### Component Naming

- Prefix components with domain when needed for clarity
- Example: `UserProfile` vs `AdvisorProfile`

### API Route Naming

- Always organize API routes by domain
- Example: `/api/billing/transactions` not `/api/transactions`

### Common Functionality

- Extract truly shared functionality to `/lib`
- Keep domain-specific logic within domains
- Share UI primitives via `/components/ui`

## Domain Decision Guide

When building a new feature, ask these questions to determine its domain:

1. What is the primary business capability this feature supports?
2. Which existing domain is most closely related?
3. Does this feature cross multiple domains?
4. If crossing domains, can it be split into domain-specific parts?

### Example: Adding a "Gift Credits" Feature

- **Primary capability**: Transfer credits between users
- **Related domain**: Billing (manages credits)
- **Cross-domain aspects**: 
  - User domain for finding users
  - Billing domain for credit transfer
- **Implementation approach**: 
  - UI in Billing domain
  - Uses User domain API for user lookup
  - Core logic in Billing domain

## Domain FAQ

**Q: What if my feature spans multiple domains?**
A: Split the feature along domain boundaries, with each part in its appropriate domain. Use integration patterns to connect them.

**Q: When should I create a new domain?**
A: When a set of features represents a distinct business capability not covered by existing domains, and it has clear boundaries.

**Q: How do I handle shared types across domains?**
A: Define the type in the domain that "owns" the concept, then import just the type definition in other domains.

**Q: What about utility functions?**
A: Keep domain-specific utilities within the domain. Move truly generic utilities to `/lib/utils`. 