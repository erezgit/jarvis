# Frontend Payment Integration Guide

## Overview

This guide provides instructions for frontend developers on how to integrate with our payment and token services. The backend implementation includes a mock payment system that simulates successful payments, allowing you to develop and test the frontend without waiting for a real payment provider integration.

## API Endpoints

### Base URL

All API endpoints are relative to: `/api/payments`

### Authentication

All endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Token Packages

The system offers three token packages:

| Package | Price | Tokens | Rate | Label |
|---------|-------|--------|------|-------|
| basic | $10 | 160 | 16 tokens/$ | - |
| standard | $25 | 425 | 17 tokens/$ | "Most Popular" |
| premium | $50 | 900 | 18 tokens/$ | "Best Value" |

## Payment Flow

The payment flow consists of two main steps:

1. **Create Order**: Initialize a payment for a specific token package
2. **Capture Payment**: Complete the payment and add tokens to the user's account

### Step 1: Create Order

**Endpoint**: `POST /api/payments/createOrder`

**Request Body**:
```json
{
  "packageId": "standard" // "basic", "standard", or "premium"
}
```

**Response**:
```json
{
  "orderId": "mock_order_1234567890"
}
```

### Step 2: Capture Payment

**Endpoint**: `POST /api/payments/capturePayment`

**Request Body**:
```json
{
  "orderId": "mock_order_1234567890"
}
```

**Response**:
```json
{
  "success": true,
  "transactionId": "mock_payment_1234567890",
  "status": "SUCCEEDED",
  "tokens": 425,
  "newBalance": 425
}
```

## Token Management

### Get Token Balance

**Endpoint**: `GET /api/payments/tokens/balance`

**Response**:
```json
{
  "balance": 425
}
```

### Get Token Transaction History

**Endpoint**: `GET /api/payments/tokens/transactions`

**Query Parameters**:
- `limit` (optional): Number of transactions to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "transactions": [
    {
      "id": "transaction_id",
      "transactionType": "purchase",
      "amount": 425,
      "balanceAfter": 425,
      "description": "Purchase of Standard Package",
      "createdAt": "2023-06-15T10:30:00Z"
    },
    {
      "id": "transaction_id",
      "transactionType": "usage",
      "amount": -10,
      "balanceAfter": 415,
      "description": "Video generation",
      "createdAt": "2023-06-15T11:45:00Z"
    }
  ],
  "total": 2
}
```

### Get Payment History

**Endpoint**: `GET /api/payments/history`

**Query Parameters**:
- `limit` (optional): Number of payments to return (default: 10)
- `offset` (optional): Pagination offset (default: 0)

**Response**:
```json
{
  "payments": [
    {
      "id": "payment_id",
      "paymentProvider": "mock",
      "amount": 25.00,
      "currency": "USD",
      "status": "SUCCEEDED",
      "tokensPurchased": 425,
      "packageId": "standard",
      "createdAt": "2023-06-15T10:30:00Z"
    }
  ],
  "total": 1
}
```

## Payment Methods

### List Payment Methods

**Endpoint**: `GET /api/payments/methods`

**Response**:
```json
{
  "methods": [
    {
      "id": "method_id",
      "type": "card",
      "last4": "4242",
      "brand": "visa",
      "expiryMonth": 12,
      "expiryYear": 2025,
      "isDefault": true
    }
  ]
}
```

### Add Payment Method

**Endpoint**: `POST /api/payments/methods`

**Request Body**:
```json
{
  "paymentMethodId": "pm_card_visa"
}
```

**Response**:
```json
{
  "method": {
    "id": "method_id",
    "type": "card",
    "last4": "4242",
    "brand": "visa",
    "expiryMonth": 12,
    "expiryYear": 2025,
    "isDefault": true
  }
}
```

### Remove Payment Method

**Endpoint**: `DELETE /api/payments/methods/:methodId`

**Response**: HTTP 204 (No Content)

## Mock Payment Testing

For testing purposes, you can use the mock payment endpoint:

**Endpoint**: `POST /api/payments/mock/process`

**Request Body**:
```json
{
  "amount": 25.00,
  "currency": "USD"
}
```

**Response**:
```json
{
  "payment": {
    "id": "mock_payment_1234567890",
    "amount": 25.00,
    "currency": "USD",
    "status": "SUCCEEDED",
    "createdAt": "2023-06-15T10:30:00Z",
    "updatedAt": "2023-06-15T10:30:00Z",
    "metadata": {
      "userId": "user_id",
      "mock": true
    }
  }
}
```

## Implementation Examples

### React Example: Creating an Order

```jsx
import { useState } from 'react';
import axios from 'axios';

const PaymentForm = () => {
  const [packageId, setPackageId] = useState('standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [orderId, setOrderId] = useState(null);

  const handleCreateOrder = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/payments/createOrder',
        { packageId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setOrderId(response.data.orderId);
      // Proceed to capture payment or redirect to payment page
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>Select Token Package</h2>
      <select value={packageId} onChange={(e) => setPackageId(e.target.value)}>
        <option value="basic">Basic - $10 (160 tokens)</option>
        <option value="standard">Standard - $25 (425 tokens)</option>
        <option value="premium">Premium - $50 (900 tokens)</option>
      </select>
      
      <button onClick={handleCreateOrder} disabled={loading}>
        {loading ? 'Processing...' : 'Purchase Tokens'}
      </button>
      
      {error && <div className="error">{error}</div>}
      {orderId && <div className="success">Order created: {orderId}</div>}
    </div>
  );
};

export default PaymentForm;
```

### React Example: Capturing Payment

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const PaymentCapture = ({ orderId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const capturePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await axios.post(
        '/api/payments/capturePayment',
        { orderId },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      setResult(response.data);
      if (onSuccess) onSuccess(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to capture payment');
    } finally {
      setLoading(false);
    }
  };

  // Auto-capture for mock payments
  useEffect(() => {
    if (orderId) {
      capturePayment();
    }
  }, [orderId]);

  return (
    <div>
      <h2>Processing Payment</h2>
      
      {loading && <div className="loading">Processing your payment...</div>}
      {error && <div className="error">{error}</div>}
      
      {result && (
        <div className="success">
          <h3>Payment Successful!</h3>
          <p>You received {result.tokens} tokens</p>
          <p>Your new balance: {result.newBalance} tokens</p>
        </div>
      )}
    </div>
  );
};

export default PaymentCapture;
```

### React Example: Displaying Token Balance

```jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

const TokenBalance = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const response = await axios.get('/api/payments/tokens/balance', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setBalance(response.data.balance);
      } catch (err) {
        setError('Failed to load token balance');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  if (loading) return <div>Loading balance...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="token-balance">
      <h3>Your Token Balance</h3>
      <div className="balance">{balance} tokens</div>
    </div>
  );
};

export default TokenBalance;
```

## Error Handling

The API returns standardized error responses:

```json
{
  "error": {
    "code": "payment/invalid-package",
    "message": "Invalid package ID provided",
    "details": { ... }
  }
}
```

Common error codes:

| Error Code | Description |
|------------|-------------|
| `payment/invalid-package` | Invalid package ID |
| `payment/order-not-found` | Order ID not found |
| `payment/processing-failed` | Payment processing failed |
| `payment/already-processed` | Order already processed |
| `token/insufficient-balance` | Insufficient token balance |

### Handling Network Errors

Always implement proper error handling for network issues:

```jsx
try {
  // API call
} catch (err) {
  if (err.response) {
    // Server responded with an error status code
    console.error('Server error:', err.response.data);
    setError(err.response.data.error?.message || 'Server error');
  } else if (err.request) {
    // Request was made but no response received
    console.error('Network error:', err.request);
    setError('Network error. Please check your connection.');
  } else {
    // Error in setting up the request
    console.error('Request error:', err.message);
    setError('An error occurred. Please try again.');
  }
}
```

## Best Practices

1. **Error Handling**: Always handle API errors gracefully and display user-friendly messages
2. **Loading States**: Show loading indicators during API calls
3. **Validation**: Validate user input before sending to the API
4. **Refresh Token Balance**: After successful payments, refresh the token balance display
5. **Secure Storage**: Store authentication tokens securely
6. **Responsive UI**: Ensure the payment UI works well on all device sizes
7. **Retry Logic**: Implement retry logic for transient network errors
8. **Idempotency**: Handle duplicate requests safely (especially for payments)

## Testing

For testing purposes, you can use the mock payment endpoints which always return successful responses. This allows you to test the complete payment flow without needing real payment credentials.

### Testing Scenarios

1. **Happy Path Testing**
   - Purchase each token package
   - Verify token balance increases correctly
   - Verify transaction history shows the purchase

2. **Error Handling Testing**
   - Test with invalid package IDs
   - Test with invalid order IDs
   - Test with network disconnection
   - Test with server errors (can be simulated with a mock server)

3. **UI Testing**
   - Test loading states
   - Test error messages
   - Test responsive design on different screen sizes

### Testing Tools

- **Jest/React Testing Library**: For component testing
- **Cypress**: For end-to-end testing
- **MSW (Mock Service Worker)**: For API mocking during tests
- **Storybook**: For UI component testing and documentation

## Future Integration with Real Payment Providers

In the future, we will replace the mock payment system with a real payment provider (likely PayPal). The API contract will remain the same, so your frontend implementation should require minimal changes when we make this transition.

### Preparing for the Transition

1. Keep payment logic isolated in dedicated components/services
2. Avoid hardcoding mock-specific behavior
3. Use environment variables to toggle between mock and real payment modes
4. Document any mock-specific workarounds for future reference

## Support

If you encounter any issues or have questions about integrating with the payment APIs, please contact the backend team.

## Frequently Asked Questions

### Q: How do I test the payment flow without making real payments?
A: Use the mock payment endpoints provided. They simulate the payment flow without requiring real payment credentials.

### Q: What happens if a user refreshes the page during payment?
A: The order ID should be stored temporarily (e.g., in localStorage) to allow resuming the payment process.

### Q: How do I handle token balance updates across multiple tabs/windows?
A: Consider implementing a polling mechanism or using WebSockets for real-time balance updates.

### Q: Are there rate limits on the payment APIs?
A: Yes, to prevent abuse. Implement proper error handling for rate limit responses (HTTP 429). 