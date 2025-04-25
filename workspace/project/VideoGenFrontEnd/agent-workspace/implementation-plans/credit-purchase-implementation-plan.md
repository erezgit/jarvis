# Credit Purchase Frontend Implementation Plan

## Overview

This document outlines the implementation plan for adding credit purchasing functionality to our application's frontend. This feature will allow users to purchase tokens that can be used for video generation services.

## Current State

The backend services for payment processing have already been implemented with a mock payment system that simulates successful payments. We need to focus on creating the frontend components and services to interact with these existing backend endpoints.

## API Endpoints

The backend provides the following API endpoints:

- `POST /api/payments/createOrder` - Create a payment order for a token package
- `POST /api/payments/capturePayment` - Complete the payment and add tokens to the user's account
- `GET /api/payments/tokens/balance` - Get the user's current token balance
- `GET /api/payments/tokens/transactions` - Get the user's token transaction history
- `GET /api/payments/history` - Get the user's payment history
- `GET /api/payments/methods` - List the user's payment methods
- `POST /api/payments/methods` - Add a new payment method
- `DELETE /api/payments/methods/:methodId` - Remove a payment method

## Component-by-Component Implementation Plan

### 1. Payment Service (Frontend) ✅

**Purpose:** Interface with the backend payment APIs

**Implementation Tasks:**
- [x] Create service types for token packages, payment responses, and results
- [x] Implement `createOrder` method to call `/api/payments/createOrder`
- [x] Implement `capturePayment` method to call `/api/payments/capturePayment`
- [x] Implement `getTokenBalance` method to call `/api/payments/tokens/balance`
- [x] Implement `getTokenTransactions` method to call `/api/payments/tokens/transactions`
- [x] Implement `getPaymentHistory` method to call `/api/payments/history`
- [x] Add proper error handling with standardized error codes
- [x] Add loading state management

**Files Created:**
- `src/core/services/payment/types.ts`
- `src/core/services/payment/service.ts`

**Type Definitions:**
```typescript
// Token package definition
export interface TokenPackage {
  id: string;       // "basic", "standard", or "premium"
  name: string;     // Display name
  price: number;    // Price in USD
  tokens: number;   // Number of tokens
  rate: number;     // Tokens per dollar
  isPopular?: boolean;  // For "Most Popular" label
  isBestValue?: boolean; // For "Best Value" label
}

// Payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Payment result from capturePayment
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  tokens: number;
  newBalance: number;
}

// Payment history item
export interface PaymentHistoryItem {
  id: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tokensPurchased: number;
  packageId: string;
  createdAt: string;
}

// Token transaction
export interface TokenTransaction {
  id: string;
  transactionType: 'purchase' | 'usage' | 'refund';
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

// Payment method
export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}
```

### 2. Token Balance Hook ✅

**Purpose:** Provide token balance data to components

**Implementation Tasks:**
- [x] Create hook to fetch current token balance using the payment service
- [x] Implement loading and error states
- [x] Add token balance refresh functionality
- [x] Cache token balance data appropriately
- [x] Add automatic refresh after successful purchases

**Files Created:**
- `src/core/hooks/tokens/useTokenBalance.ts`

### 3. Token Balance Component ✅

**Purpose:** Display the user's current token balance

**Implementation Tasks:**
- [x] Create component to display current token balance
- [x] Add visual indicator for low balance (< 50 tokens)
- [x] Add "Add Tokens" button with navigation to purchase page
- [x] Implement responsive design for different contexts
- [x] Add loading and error states

**Files Created:**
- `src/components/tokens/TokenBalance.tsx`

### 4. Token Package Component ✅

**Purpose:** Display a purchasable token package

**Implementation Tasks:**
- [x] Create component to display package details (name, price, tokens)
- [x] Show special labels for "Most Popular" (standard) and "Best Value" (premium)
- [x] Implement selection functionality
- [x] Add responsive design
- [x] Create visual styling for selected state
- [x] Display token rate (tokens per dollar)

**Files Created:**
- `src/components/tokens/TokenPackage.tsx`

### 5. Token Purchase Page ✅

**Purpose:** Allow users to select and purchase token packages

**Implementation Tasks:**
- [x] Create page layout with title and description
- [x] Implement package listing using TokenPackage components
- [x] Add package selection functionality
- [x] Implement purchase button that calls `createOrder`
- [x] Implement payment capture flow that calls `capturePayment`
- [x] Add loading states during purchase process
- [x] Handle success and error states
- [x] Implement responsive design

**Files Created:**
- `src/pages/Tokens/Purchase/index.tsx`

### 6. Payment Confirmation Component ✅

**Purpose:** Display confirmation after successful purchase

**Implementation Tasks:**
- [x] Create component to display transaction details
- [x] Show updated token balance
- [x] Display tokens purchased
- [x] Show transaction ID for reference
- [x] Add "Return to Dashboard" button
- [x] Implement success animations/visuals
- [x] Add responsive design

**Files Created:**
- `src/components/tokens/PaymentConfirmation.tsx`

### 7. Transaction History Hook ✅

**Purpose:** Provide payment history data to components

**Implementation Tasks:**
- [x] Create hook to fetch token transactions using the payment service
- [x] Implement pagination functionality with limit and offset
- [x] Add loading and error states
- [x] Add filtering capabilities

**Files Created:**
- `src/core/hooks/tokens/useTransactionHistory.ts`

### 8. Transaction History Item Component ✅

**Purpose:** Display a single transaction in the history

**Implementation Tasks:**
- [x] Create component to display transaction details
- [x] Show date, transaction type, amount, and balance after
- [x] Style based on transaction type (purchase, usage, refund)
- [x] Implement responsive design

**Files Created:**
- `src/components/tokens/TransactionHistoryItem.tsx`

### 9. Payment History Hook ✅

**Purpose:** Provide payment history data to components

**Implementation Tasks:**
- [x] Create hook to fetch payment history using the payment service
- [x] Implement pagination functionality with limit and offset
- [x] Add loading and error states

**Files Created:**
- `src/core/hooks/tokens/usePaymentHistory.ts`

### 10. Payment History Item Component ✅

**Purpose:** Display a single payment in the history

**Implementation Tasks:**
- [x] Create component to display payment details
- [x] Show date, amount, package, and tokens purchased
- [x] Style based on payment status
- [x] Implement responsive design

**Files Created:**
- `src/components/tokens/PaymentHistoryItem.tsx`

### 11. Transaction History Page ✅

**Purpose:** Display the user's token transaction history

**Implementation Tasks:**
- [x] Create page layout with title and description
- [x] Implement transaction listing using TransactionHistoryItem components
- [x] Add filtering options (transaction type)
- [x] Implement pagination UI with limit and offset
- [x] Add loading and error states
- [x] Implement responsive design

**Files Created:**
- `src/pages/Tokens/Transactions/index.tsx`

### 12. Payment History Page ✅

**Purpose:** Display the user's payment history

**Implementation Tasks:**
- [x] Create page layout with title and description
- [x] Implement payment listing using PaymentHistoryItem components
- [x] Implement pagination UI with limit and offset
- [x] Add loading and error states
- [x] Implement responsive design

**Files Created:**
- `src/pages/Tokens/History/index.tsx`

### 13. Navigation Updates ✅

**Purpose:** Add navigation to new token-related pages

**Implementation Tasks:**
- [x] Add links to token purchase page in appropriate locations
- [x] Add links to transaction history in user profile
- [x] Add links to payment history in user profile
- [x] Update dashboard to show token balance and purchase prompt

**Files Modified:**
- `src/shell/Sidebar.tsx`

## Routing Configuration ✅

**Implementation Tasks:**
- [x] Add routes for token purchase and history pages
- [x] Configure route protection (authentication)
- [x] Set up navigation between token-related pages

**Files Modified:**
- `src/App.tsx`

**Routes Added:**
- `/tokens/purchase` - Token purchase page
- `/tokens/transactions` - Token transaction history page
- `/tokens/history` - Payment history page

## Error Handling

The backend API returns standardized error responses that we should handle appropriately:

```json
{
  "error": {
    "code": "payment/invalid-package",
    "message": "Invalid package ID provided",
    "details": { ... }
  }
}
```

Common error codes to handle:

| Error Code | Description |
|------------|-------------|
| `payment/invalid-package` | Invalid package ID |
| `payment/order-not-found` | Order ID not found |
| `payment/processing-failed` | Payment processing failed |
| `payment/already-processed` | Order already processed |
| `token/insufficient-balance` | Insufficient token balance |

## UI/UX Considerations

1. **Loading States**
   - Show loading indicators during API calls
   - Disable buttons during processing
   - Provide visual feedback during payment flow

2. **Error Handling**
   - Display user-friendly error messages based on error codes
   - Provide recovery options for failed operations
   - Log detailed errors for debugging

3. **Responsive Design**
   - Ensure all components work on mobile devices
   - Adapt layouts for different screen sizes
   - Use flexible grid layouts

4. **Accessibility**
   - Ensure all components are keyboard navigable
   - Add appropriate ARIA labels
   - Maintain sufficient color contrast
   - Support screen readers

## Implementation Timeline

- **Payment Service**: ✅ Completed
- **Data Hooks**: ✅ Completed
- **UI Components**: ✅ Completed
- **Pages**: ✅ Completed
- **Navigation & Routing**: ✅ Completed

**Total Estimated Time**: ✅ All tasks completed

## Testing Strategy

1. **Unit Tests**
   - Test service methods with mocked API responses
   - Test hooks for token balance and transaction history
   - Test UI components in isolation

2. **Integration Tests**
   - Test complete purchase flow with mocked API responses
   - Test error scenarios and recovery
   - Test navigation between components

## Dependencies

1. **External Libraries**
   - React Query (for data fetching)
   - React Router (for navigation)
   - Shadcn/UI (for UI components, if applicable)
   - Axios (for API requests)

2. **Backend Services**
   - Token balance API endpoints
   - Payment API endpoints
   - User authentication

## Implementation Approach

1. **Start with Core Services**
   - ✅ Implement the payment service first
   - ✅ Create hooks for data fetching

2. **Build Components Bottom-Up**
   - ✅ Create smaller components first
   - ✅ Compose them into larger page components

3. **Add Navigation Last**
   - ✅ Once all pages are functional, update navigation
   - ✅ Test the complete user flow

## Conclusion

This implementation plan outlines the frontend components and services needed to add credit purchasing functionality to our application. By following this component-by-component approach and leveraging the mock payment system provided by the backend, we will create a cohesive and user-friendly experience for purchasing and managing tokens.

All tasks have been completed successfully, and the credit purchase feature is now fully implemented in the frontend. 