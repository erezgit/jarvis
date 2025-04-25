# Token Transaction API Response Structure Guide

## Overview

This document provides a detailed guide on the structure of the token transaction API responses and how to properly handle them in frontend components. It serves as a reference for frontend developers working on the transaction history page and other token-related features.

## API Endpoint Details

### Get Token Transactions

**Endpoint**: `GET /api/payments/tokens/transactions`

**Query Parameters**:
- `limit` (optional): Number of transactions to retrieve (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Authentication**: Requires a valid authentication token

**Response Status Codes**:
- `200 OK`: Successfully retrieved transactions
- `401 Unauthorized`: Invalid or missing authentication token
- `500 Internal Server Error`: Server-side error

## Response Structure

The API returns an array of transaction objects with the following structure:

```typescript
[
  {
    "id": "uuid-string",
    "transactionType": "purchase" | "usage" | "refund" | "admin_adjustment" | "bonus",
    "amount": number,
    "balanceAfter": number,
    "description": "string",
    "paymentId": "uuid-string" | null,
    "createdAt": "ISO-8601-date-string"
  },
  // ... more transactions
]
```

### Field Descriptions

| Field | Type | Description | Notes |
|-------|------|-------------|-------|
| `id` | string | Unique identifier for the transaction | UUID format |
| `transactionType` | string | Type of transaction | One of: "purchase", "usage", "refund", "admin_adjustment", "bonus" |
| `amount` | number | Amount of tokens added or removed | Positive for additions, negative for deductions |
| `balanceAfter` | number | Token balance after this transaction | Integer value |
| `description` | string | Human-readable description of the transaction | |
| `paymentId` | string or null | Associated payment ID if applicable | Only present for purchase transactions |
| `createdAt` | string | Timestamp when the transaction occurred | ISO-8601 format (e.g., "2025-03-09T20:00:00Z") |

### Example Response

```json
[
  {
    "id": "123e4567-e89b-12d3-a456-426614174000",
    "transactionType": "purchase",
    "amount": 100,
    "balanceAfter": 100,
    "description": "Initial token purchase",
    "paymentId": "pay_123e4567e89b12d3a456",
    "createdAt": "2025-03-09T20:00:00Z"
  },
  {
    "id": "223e4567-e89b-12d3-a456-426614174001",
    "transactionType": "usage",
    "amount": -10,
    "balanceAfter": 90,
    "description": "Used for prompt generation",
    "paymentId": null,
    "createdAt": "2025-03-09T20:30:00Z"
  }
]
```

## Common Pitfalls and Solutions

### 1. Empty Array vs. Null

The API will return an empty array `[]` when there are no transactions, not `null`. Always check for both:

```typescript
if (!transactions || transactions.length === 0) {
  // Show empty state
}
```

### 2. Transaction Type Handling

The `transactionType` field uses snake_case for some values (e.g., "admin_adjustment"). Ensure your type definitions and switch statements account for this:

```typescript
export enum TokenTransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
  REFUND = 'refund',
  ADMIN_ADJUSTMENT = 'admin_adjustment', // Note the snake_case
  BONUS = 'bonus'
}
```

### 3. Amount Sign Convention

The `amount` field follows these sign conventions:
- Positive values (+): Tokens added to the user's account
- Negative values (-): Tokens deducted from the user's account

Display logic should handle both cases appropriately.

### 4. Date Formatting

The `createdAt` field is in ISO-8601 format. Use a date formatting utility to display it in a user-friendly format:

```typescript
import { formatDate } from '../utils/date';

// In your component
<div className="transaction-date">{formatDate(transaction.createdAt)}</div>
```

### 5. Optional Fields

The `paymentId` field may be null for transaction types other than "purchase". Always check for its existence:

```typescript
{transaction.paymentId && (
  <div className="payment-id">Payment ID: {transaction.paymentId}</div>
)}
```

## Frontend Implementation Best Practices

### 1. Type Definitions

Define proper TypeScript interfaces for the transaction data:

```typescript
export interface TokenTransaction {
  id: string;
  transactionType: TokenTransactionType | string;
  amount: number;
  balanceAfter: number;
  description: string;
  paymentId?: string | null;
  createdAt: string;
}
```

### 2. API Client Function

Implement a robust API client function with proper error handling:

```typescript
export async function getTokenTransactions(
  limit: number = 10, 
  offset: number = 0
): Promise<TokenTransaction[]> {
  try {
    const response = await api.get(
      `/payments/tokens/transactions?limit=${limit}&offset=${offset}`
    );
    
    // Validate response data
    if (!response.data || !Array.isArray(response.data)) {
      console.error('Invalid getTokenTransactions response:', response);
      return [];
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching token transactions:', error);
    throw error;
  }
}
```

### 3. React Query Implementation

Use React Query for data fetching with proper loading, error, and empty states:

```typescript
const { 
  data: transactions, 
  isLoading, 
  isError, 
  error 
} = useQuery<TokenTransaction[]>({
  queryKey: ['tokenTransactions', limit, offset],
  queryFn: () => getTokenTransactions(limit, offset),
});

// Handle loading state
if (isLoading) {
  return <Spinner />;
}

// Handle error state
if (isError) {
  return <ErrorMessage error={error} />;
}

// Handle empty state
if (!transactions || transactions.length === 0) {
  return <EmptyState title="No Transactions" />;
}
```

### 4. Defensive Rendering

Always use defensive programming techniques when rendering transaction data:

```typescript
// Safely access transaction properties with fallbacks
const {
  id,
  transactionType = 'unknown',
  amount = 0,
  balanceAfter = 0,
  description = '',
  createdAt = new Date().toISOString()
} = transaction || {};
```

## Transaction Type Display Guide

Use this guide for displaying different transaction types:

| Transaction Type | Icon | Label | Color | Description |
|------------------|------|-------|-------|-------------|
| `purchase` | 💰 | Purchase | Green | Tokens purchased by the user |
| `usage` | 🔄 | Usage | Red | Tokens used for services |
| `refund` | ↩️ | Refund | Blue | Tokens refunded to the user |
| `admin_adjustment` | ⚙️ | Admin Adjustment | Purple | Manual adjustment by admin |
| `bonus` | 🎁 | Bonus | Gold | Bonus tokens awarded to the user |

## Pagination Implementation

If implementing pagination for transaction history:

```typescript
const [page, setPage] = useState(1);
const limit = 10;
const offset = (page - 1) * limit;

const { data, isLoading } = useQuery(
  ['tokenTransactions', limit, offset],
  () => getTokenTransactions(limit, offset),
  {
    keepPreviousData: true, // Keep previous page data while loading next page
  }
);

// Pagination controls
<Pagination
  currentPage={page}
  totalItems={totalCount} // Get this from API metadata if available
  itemsPerPage={limit}
  onPageChange={setPage}
/>
```

## Troubleshooting Common Errors

### TypeError when Accessing Transaction Properties

**Problem**: `TypeError` when trying to access properties of transaction objects.

**Solution**: 
1. Ensure you're checking for null/undefined before accessing properties
2. Use optional chaining and default values
3. Verify the API response structure matches your type definitions

```typescript
// Bad - may cause TypeError
const amount = transaction.amount;

// Good - safe access with fallback
const amount = transaction?.amount ?? 0;
```

### Empty Screen with No Error Message

**Problem**: Transaction page shows blank screen with no visible error.

**Solution**:
1. Add explicit error boundaries around the component
2. Add logging to capture the actual error
3. Verify the API call is completing successfully
4. Check browser console for errors

### Incorrect Transaction Type Display

**Problem**: Transaction types display incorrectly or as "Unknown".

**Solution**:
1. Verify the `transactionType` values in the API response
2. Ensure your enum or switch statement handles all possible values
3. Add a default case for unexpected values

## Implementation in Our Codebase

Our implementation of the token transaction API follows these best practices:

1. **Type Definitions**: We've defined a comprehensive `TokenTransaction` interface and `TokenTransactionType` enum in `src/core/services/payment/types.ts`.

2. **Service Method**: The `getTokenTransactions` method in `PaymentService` includes robust error handling, response validation, and support for both response formats.

3. **React Hook**: The `useTransactionHistory` hook in `src/core/services/payment/hooks/useTransactionHistory.ts` provides a clean interface for components to fetch and display transaction data.

4. **Defensive Rendering**: Both the service and hook implementations include defensive programming techniques to handle unexpected data formats and missing properties.

## Mock Data for Development

During development, if the API endpoint is not yet available or returns HTML instead of JSON, our implementation automatically falls back to using mock data. This ensures that frontend development can proceed even if the backend API is not fully implemented.

### Mock Data Implementation

The `PaymentService` includes a `getMockTokenTransactions` method that generates realistic mock transaction data:

```typescript
private getMockTokenTransactions(limit = 10, offset = 0): ServiceResult<TokenTransactionsResponse> {
  // Create mock transactions with various transaction types
  const mockTransactions: TokenTransaction[] = [
    {
      id: '123e4567-e89b-12d3-a456-426614174000',
      transactionType: TokenTransactionType.PURCHASE,
      amount: 100,
      balanceAfter: 100,
      description: 'Initial token purchase',
      paymentId: 'pay_123e4567e89b12d3a456',
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    },
    // ... more mock transactions
  ];

  // Apply pagination
  const paginatedTransactions = mockTransactions.slice(offset, offset + limit);
  
  return {
    data: {
      transactions: paginatedTransactions,
      total: mockTransactions.length
    },
    error: null
  };
}
```

### When Mock Data is Used

The service automatically falls back to mock data in the following scenarios:

1. When the API returns HTML instead of JSON (detected by the `isHtmlResponse` property)
2. When the API endpoint is not available (network error)
3. When the API response format is invalid

This approach ensures a smooth development experience while maintaining compatibility with the expected API structure once it becomes available.

## Conclusion

Following these guidelines will ensure proper handling of the token transaction API responses in the frontend. The key points to remember are:

1. Always validate API responses before processing
2. Use defensive programming techniques when rendering data
3. Handle all possible states: loading, error, empty, and success
4. Match your frontend type definitions to the actual API response structure

By implementing these practices, you'll avoid the TypeError issues and provide a robust user experience for viewing transaction history. 