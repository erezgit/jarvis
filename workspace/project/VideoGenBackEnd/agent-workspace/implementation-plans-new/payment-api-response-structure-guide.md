# Payment API Response Structure Guide for Frontend Developers

## Overview

This document provides detailed information about the response structures for all payment API endpoints. Understanding these response formats is crucial for properly handling API responses in the frontend application and avoiding type errors.

## API Response Formats

### 1. Create Order Endpoint

**Endpoint**: `POST /api/payments/createOrder`

**Request Body**:
```json
{
  "packageId": "basic" // "basic", "standard", or "premium"
}
```

**Response Structure**:
```json
{
  "orderId": "mock_order_1741504604938_dzjmh3ze"
}
```

**Important Notes**:
- The response contains a single property `orderId` which is a string
- This order ID must be stored and used in the subsequent capturePayment call
- No additional metadata is included in this response

**Common Errors**:
- Accessing non-existent properties like `response.data.order` instead of `response.data.orderId`
- Type errors from assuming the response contains additional properties

### 2. Capture Payment Endpoint

**Endpoint**: `POST /api/payments/capturePayment`

**Request Body**:
```json
{
  "orderId": "mock_order_1741504604938_dzjmh3ze"
}
```

**Response Structure**:
```json
{
  "success": true,
  "transactionId": "mock_txn_1741504605274_a8b3c9d7",
  "status": "SUCCEEDED",
  "tokens": 160,
  "newBalance": 160
}
```

**Important Notes**:
- The response is returned directly, not wrapped in a `data` property
- All fields are required and will always be present in a successful response
- `newBalance` represents the user's updated token balance after the purchase

### 3. Get Token Balance Endpoint

**Endpoint**: `GET /api/payments/tokens/balance`

**Response Structure**:
```json
{
  "balance": 160
}
```

**Important Notes**:
- The response contains a single property `balance` which is a number
- This endpoint always returns a number, even if the balance is 0

### 4. Get Payment History Endpoint

**Endpoint**: `GET /api/payments/history`

**Response Structure**:
```json
[
  {
    "id": "payment_id",
    "paymentProvider": "mock",
    "amount": 10.00,
    "currency": "USD",
    "status": "SUCCEEDED",
    "tokensPurchased": 160,
    "packageId": "basic",
    "createdAt": "2025-03-09T07:16:45.274Z"
  }
]
```

**Important Notes**:
- The response is an array of payment objects
- The array may be empty if the user has no payment history
- Each payment object has a consistent structure with all fields always present

### 5. Get Token Transactions Endpoint

**Endpoint**: `GET /api/payments/tokens/transactions`

**Response Structure**:
```json
[
  {
    "id": "transaction_id",
    "transactionType": "purchase",
    "amount": 160,
    "balanceAfter": 160,
    "description": "Purchase via mock payment mock_txn_1741504605274_a8b3c9d7",
    "createdAt": "2025-03-09T07:16:45.274Z"
  }
]
```

**Important Notes**:
- The response is an array of transaction objects
- The array may be empty if the user has no transaction history
- `amount` can be positive (for purchases) or negative (for usage)

## Common Frontend Implementation Errors

1. **Incorrect Property Access**:
   ```javascript
   // INCORRECT
   const orderId = response.data.order;
   
   // CORRECT
   const orderId = response.data.orderId;
   ```

2. **Missing Null/Undefined Checks**:
   ```javascript
   // INCORRECT
   const balance = response.data.balance.toString();
   
   // CORRECT
   const balance = response.data?.balance?.toString() || '0';
   ```

3. **Incorrect Response Unwrapping**:
   ```javascript
   // INCORRECT - The capturePayment response is not wrapped in a data property
   const { success, tokens } = response.data.data;
   
   // CORRECT
   const { success, tokens } = response.data;
   ```

4. **Type Conversion Issues**:
   ```javascript
   // INCORRECT - May cause issues if balance is 0
   const hasTokens = !!response.data.balance;
   
   // CORRECT
   const hasTokens = response.data.balance > 0;
   ```

## Recommended Frontend Implementation

Here's a robust implementation for handling the createOrder response:

```javascript
async function createOrder(packageId) {
  try {
    const response = await api.post('/payments/createOrder', { packageId });
    
    // Validate response structure
    if (!response || !response.data) {
      console.error('Invalid response from createOrder:', response);
      throw new Error('Invalid response from server');
    }
    
    // Check for orderId property
    if (!response.data.orderId) {
      console.error('Missing orderId in createOrder response:', response.data);
      throw new Error('Missing order ID in response');
    }
    
    // Return the orderId
    return response.data.orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}
```

For capturing a payment:

```javascript
async function capturePayment(orderId) {
  try {
    const response = await api.post('/payments/capturePayment', { orderId });
    
    // Validate response structure
    if (!response || !response.data) {
      console.error('Invalid response from capturePayment:', response);
      throw new Error('Invalid response from server');
    }
    
    // Check for required properties
    const { success, transactionId, status, tokens, newBalance } = response.data;
    
    if (success === undefined || !transactionId || !status || tokens === undefined || newBalance === undefined) {
      console.error('Missing required properties in capturePayment response:', response.data);
      throw new Error('Invalid payment capture response');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error capturing payment:', error);
    throw error;
  }
}
```

## Complete Payment Flow Implementation

Here's a complete implementation of the payment flow:

```javascript
// PaymentService.js
import api from './api'; // Your API client

class PaymentService {
  /**
   * Create a payment order
   * @param {string} packageId - The ID of the token package to purchase
   * @returns {Promise<string>} - The order ID
   */
  async createOrder(packageId) {
    try {
      const response = await api.post('/payments/createOrder', { packageId });
      
      if (!response?.data?.orderId) {
        console.error('Invalid createOrder response:', response);
        throw new Error('Failed to create order: Invalid response');
      }
      
      return response.data.orderId;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new Error(`Failed to create order: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Capture a payment for an order
   * @param {string} orderId - The order ID to capture payment for
   * @returns {Promise<Object>} - The payment result
   */
  async capturePayment(orderId) {
    try {
      const response = await api.post('/payments/capturePayment', { orderId });
      
      if (!response?.data) {
        console.error('Invalid capturePayment response:', response);
        throw new Error('Failed to capture payment: Invalid response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw new Error(`Failed to capture payment: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Get the user's token balance
   * @returns {Promise<number>} - The token balance
   */
  async getTokenBalance() {
    try {
      const response = await api.get('/payments/tokens/balance');
      
      if (response?.data?.balance === undefined) {
        console.error('Invalid getTokenBalance response:', response);
        throw new Error('Failed to get token balance: Invalid response');
      }
      
      return response.data.balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw new Error(`Failed to get token balance: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Get the user's payment history
   * @param {number} limit - Maximum number of records to return
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} - Array of payment records
   */
  async getPaymentHistory(limit = 10, offset = 0) {
    try {
      const response = await api.get(`/payments/history?limit=${limit}&offset=${offset}`);
      
      if (!Array.isArray(response?.data)) {
        console.error('Invalid getPaymentHistory response:', response);
        throw new Error('Failed to get payment history: Invalid response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw new Error(`Failed to get payment history: ${error.message || 'Unknown error'}`);
    }
  }
  
  /**
   * Get the user's token transaction history
   * @param {number} limit - Maximum number of records to return
   * @param {number} offset - Pagination offset
   * @returns {Promise<Array>} - Array of transaction records
   */
  async getTokenTransactions(limit = 10, offset = 0) {
    try {
      const response = await api.get(`/payments/tokens/transactions?limit=${limit}&offset=${offset}`);
      
      if (!Array.isArray(response?.data)) {
        console.error('Invalid getTokenTransactions response:', response);
        throw new Error('Failed to get token transactions: Invalid response');
      }
      
      return response.data;
    } catch (error) {
      console.error('Error getting token transactions:', error);
      throw new Error(`Failed to get token transactions: ${error.message || 'Unknown error'}`);
    }
  }
}

export default new PaymentService();
```

## React Component Example

Here's an example of a React component that uses the PaymentService to purchase tokens:

```jsx
import React, { useState, useEffect } from 'react';
import PaymentService from '../services/PaymentService';

const TokenPurchase = () => {
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [tokenBalance, setTokenBalance] = useState(0);
  
  // Fetch token balance on component mount
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balance = await PaymentService.getTokenBalance();
        setTokenBalance(balance);
      } catch (error) {
        console.error('Failed to fetch token balance:', error);
      }
    };
    
    fetchBalance();
  }, [success]); // Refetch when purchase succeeds
  
  const handlePurchase = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      // Step 1: Create order
      const orderId = await PaymentService.createOrder(selectedPackage);
      
      // Step 2: Capture payment
      const result = await PaymentService.capturePayment(orderId);
      
      // Step 3: Update UI with result
      setSuccess(true);
      setTokenBalance(result.newBalance);
      
    } catch (error) {
      setError(error.message || 'Failed to complete purchase');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="token-purchase">
      <h2>Purchase Tokens</h2>
      
      <div className="token-balance">
        Current Balance: {tokenBalance} tokens
      </div>
      
      <div className="package-selection">
        <select 
          value={selectedPackage} 
          onChange={(e) => setSelectedPackage(e.target.value)}
          disabled={loading}
        >
          <option value="basic">Basic - $10 (160 tokens)</option>
          <option value="standard">Standard - $25 (425 tokens)</option>
          <option value="premium">Premium - $50 (900 tokens)</option>
        </select>
      </div>
      
      <button 
        onClick={handlePurchase} 
        disabled={loading}
        className="purchase-button"
      >
        {loading ? 'Processing...' : 'Purchase Tokens'}
      </button>
      
      {error && (
        <div className="error-message">
          Error: {error}
        </div>
      )}
      
      {success && (
        <div className="success-message">
          Purchase successful! Your new balance is {tokenBalance} tokens.
        </div>
      )}
    </div>
  );
};

export default TokenPurchase;
```

## Error Handling Best Practices

1. **Always validate response structure** before accessing properties
2. **Use optional chaining** (`?.`) when accessing nested properties
3. **Provide fallback values** using the nullish coalescing operator (`??`)
4. **Log detailed error information** including the full response object
5. **Implement type checking** for critical values
6. **Use try/catch blocks** around all API calls and response processing
7. **Display user-friendly error messages** while logging detailed errors
8. **Implement retry logic** for transient errors (network issues)

## TypeScript Type Definitions

If you're using TypeScript, here are the type definitions for the API responses:

```typescript
// Response types
interface CreateOrderResponse {
  orderId: string;
}

interface CapturePaymentResponse {
  success: boolean;
  transactionId: string;
  status: 'SUCCEEDED' | 'FAILED' | 'PENDING';
  tokens: number;
  newBalance: number;
}

interface TokenBalanceResponse {
  balance: number;
}

interface PaymentRecord {
  id: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: string;
  tokensPurchased: number;
  packageId: string;
  createdAt: string;
}

interface TokenTransaction {
  id: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

// API function types
type CreateOrderFn = (packageId: string) => Promise<string>;
type CapturePaymentFn = (orderId: string) => Promise<CapturePaymentResponse>;
type GetTokenBalanceFn = () => Promise<number>;
type GetPaymentHistoryFn = (limit?: number, offset?: number) => Promise<PaymentRecord[]>;
type GetTokenTransactionsFn = (limit?: number, offset?: number) => Promise<TokenTransaction[]>;
```

## Testing Your Implementation

To verify your frontend implementation correctly handles the API responses:

1. Use the provided Postman collection to examine exact response formats
2. Add console logging for all API responses before processing them
3. Implement proper error boundaries in your React components
4. Test edge cases like empty arrays and zero values
5. Verify error handling by temporarily modifying response handling to simulate errors

By following these guidelines, you can ensure your frontend code correctly handles all payment API responses and avoids type errors during the payment process. 