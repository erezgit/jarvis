# PayPal Payment Integration Plan

## 1. Current Payment System Analysis

### 1.1 Mock Payment Flow

The current payment system uses a mock payment implementation that follows this flow:

1. **Frontend**: User selects a token package and initiates purchase
2. **Backend**: Creates an order with `createOrder` method in `PaymentService`
   - Retrieves package details from `TOKEN_PACKAGES`
   - Calls `mockPaymentClient.createOrder()` to generate an order ID
   - Creates a payment record in the database with status `PENDING`
   - Returns the order ID to the frontend
3. **Frontend**: Calls the capture payment endpoint with the order ID
4. **Backend**: Processes the payment with `capturePayment` method in `PaymentService`
   - Retrieves the pending payment record by order ID
   - Calls `mockPaymentClient.capturePayment()` to simulate payment processing
   - Updates payment status to `SUCCEEDED`
   - Adds tokens to the user's balance
   - Returns success response with transaction details

### 1.2 Key Components

- **PaymentService**: Main service handling payment operations
- **MockPaymentService**: Simulates payment processing
- **TokenService**: Manages token balances and transactions
- **PaymentRepository**: Handles database operations for payments

## 2. PayPal Integration Strategy

### 2.1 Architecture Overview

We'll implement a new `PayPalPaymentService` that follows the same interface as the mock payment service but integrates with PayPal's APIs. This approach allows us to:

1. Maintain the existing payment flow
2. Support both mock payments and PayPal payments
3. Easily switch between payment providers

### 2.2 PayPal SDK Integration

We'll use the official PayPal SDK for Node.js:

- **Server-side**: `@paypal/paypal-server-sdk` for backend API calls
- **Client-side**: PayPal JavaScript SDK for frontend button integration

## 3. Implementation Plan

### Phase 1: Backend PayPal Integration ✅

1. **Install PayPal SDK**
   - Add `@paypal/paypal-server-sdk` to the project

2. **Create PayPal Client Service**
   - Create `src/services/payment/paypal/client.service.ts`
   - Implement PayPal SDK initialization with sandbox credentials
   - Implement `createOrder` and `capturePayment` methods

3. **Register PayPal Service in Container**
   - Update `src/config/container.ts` to register the PayPal service

4. **Update Payment Service**
   - Modify `PaymentService` to support PayPal as a payment provider
   - Add provider selection logic based on configuration or request

### Phase 2: API Endpoints for PayPal ✅

1. **Add PayPal-specific Routes**
   - Create `/payments/paypal/createOrder` endpoint
   - Create `/payments/paypal/capturePayment` endpoint

2. **Update Existing Routes**
   - Modify `/payments/createOrder` to support PayPal option
   - Ensure backward compatibility with mock payments

### Phase 3: Frontend Integration ✅

1. **Add PayPal JavaScript SDK**
   - Add PayPal JS SDK script to the frontend
   - Configure with sandbox client ID

2. **Create PayPal Button Component**
   - Implement PayPal button rendering
   - Handle order creation and approval flow

3. **Update Payment UI**
   - Add PayPal as a payment option
   - Implement payment method selection

### Phase 4: Testing and Validation ✅

1. **Sandbox Testing**
   - Test complete payment flow with PayPal sandbox accounts
   - Verify token crediting works correctly
   - Test error handling and edge cases

2. **Integration Testing**
   - Test switching between mock and PayPal payments
   - Verify database records are created correctly

### Phase 5: Production Deployment ✅

1. **Production Credentials**
   - Set up production PayPal credentials
   - Implement environment-based configuration

2. **Deployment**
   - Deploy changes to production
   - Monitor initial transactions

## 4. Technical Implementation Details

### 4.1 PayPal Client Service

```typescript
import { injectable } from 'tsyringe';
import paypal from '@paypal/paypal-server-sdk';
import { logger } from '../../../lib/server/logger';

@injectable()
export class PayPalPaymentService {
  private client: paypal.core.PayPalHttpClient;

  constructor() {
    // Initialize PayPal environment
    const environment = process.env.NODE_ENV === 'production'
      ? new paypal.core.LiveEnvironment(
          process.env.PAYPAL_CLIENT_ID!,
          process.env.PAYPAL_CLIENT_SECRET!
        )
      : new paypal.core.SandboxEnvironment(
          process.env.PAYPAL_SANDBOX_CLIENT_ID!,
          process.env.PAYPAL_SANDBOX_CLIENT_SECRET!
        );

    this.client = new paypal.core.PayPalHttpClient(environment);
  }

  async createOrder(amount: number, description: string): Promise<string> {
    logger.info('Creating PayPal order', { amount, description });

    const request = new paypal.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toString()
        },
        description
      }]
    });

    try {
      const response = await this.client.execute(request);
      logger.info('PayPal order created', { orderId: response.result.id });
      return response.result.id;
    } catch (error) {
      logger.error('Failed to create PayPal order', { error });
      throw error;
    }
  }

  async capturePayment(orderId: string): Promise<{ success: boolean, transactionId: string }> {
    logger.info('Capturing PayPal payment', { orderId });

    const request = new paypal.orders.OrdersCaptureRequest(orderId);
    request.prefer('return=representation');

    try {
      const response = await this.client.execute(request);
      const captureId = response.result.purchase_units[0].payments.captures[0].id;
      
      logger.info('Successfully captured PayPal payment', { 
        orderId, 
        captureId,
        status: response.result.status
      });
      
      return { 
        success: response.result.status === 'COMPLETED', 
        transactionId: captureId
      };
    } catch (error) {
      logger.error('Failed to capture PayPal payment', { error, orderId });
      throw error;
    }
  }
}
```

### 4.2 Frontend PayPal Button Integration

```jsx
import { useEffect, useState } from 'react';
import axios from 'axios';

const PayPalCheckout = ({ packageId, onSuccess, onError }) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Load PayPal script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.PAYPAL_CLIENT_ID}&currency=USD`;
    script.addEventListener('load', () => setScriptLoaded(true));
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Render PayPal buttons when script is loaded
  useEffect(() => {
    if (scriptLoaded) {
      window.paypal.Buttons({
        // Create order on the server
        createOrder: async () => {
          try {
            const response = await axios.post('/api/payments/createOrder', {
              packageId,
              provider: 'paypal'
            });
            
            const { orderId } = response.data;
            setOrderId(orderId);
            return orderId;
          } catch (error) {
            onError(error);
            throw error;
          }
        },
        
        // Handle approval
        onApprove: async (data) => {
          try {
            const response = await axios.post('/api/payments/paypal/capturePayment', {
              orderId: data.orderID
            });
            
            onSuccess(response.data);
          } catch (error) {
            onError(error);
          }
        },
        
        // Handle errors
        onError: (err) => {
          onError(err);
        }
      }).render('#paypal-button-container');
    }
  }, [scriptLoaded, packageId]);

  return (
    <div>
      <div id="paypal-button-container"></div>
    </div>
  );
};

export default PayPalCheckout;
```

## 5. Configuration Requirements

### 5.1 Environment Variables

```
# PayPal Sandbox Credentials
PAYPAL_SANDBOX_CLIENT_ID=AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9
PAYPAL_SANDBOX_CLIENT_SECRET=EHw-id9oHBW_kIxJ82HIAd53qwIi7Xz2pSA7MOWnS0UK4dOfZV0kA2AymoquESujvlS7HHKzlKaef0lW

# PayPal Production Credentials (to be added later)
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
```

### 5.2 Dependencies

```json
{
  "dependencies": {
    "@paypal/paypal-server-sdk": "^0.6.1"
  }
}
```

## 6. Testing Plan

### 6.1 Sandbox Testing

1. **Test Account Credentials**
   - Sandbox Business Account: sb-nk2c338418610@business.example.com / E40m%Md4
   - Sandbox Personal Account: Create a test buyer account in the PayPal Developer Dashboard

2. **Test Scenarios**
   - Purchase each token package with PayPal
   - Verify token balance updates correctly
   - Test payment cancellation
   - Test error handling

### 6.2 Integration Tests

1. **Unit Tests**
   - Test PayPal service methods
   - Test payment service with PayPal provider

2. **End-to-End Tests**
   - Complete payment flow from frontend to backend
   - Verify database records

## 7. Rollout Strategy

1. **Development Environment**
   - Implement and test in development environment first

2. **Staging Environment**
   - Deploy to staging for QA testing
   - Perform full integration testing

3. **Production Environment**
   - Deploy to production with feature flag
   - Initially enable for a small percentage of users
   - Monitor and gradually increase rollout

## 8. Monitoring and Maintenance

1. **Logging**
   - Log all PayPal API interactions
   - Set up alerts for payment failures

2. **Metrics**
   - Track payment success/failure rates
   - Monitor payment processing times

3. **Support**
   - Document common issues and solutions
   - Set up support process for payment issues 