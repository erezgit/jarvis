# PayPal Integration

This document provides information about the PayPal integration for the token purchase system.

## Overview

The PayPal integration allows users to purchase tokens using PayPal as a payment provider. The integration uses the PayPal JavaScript SDK on the frontend and the PayPal Server SDK on the backend to create and process payments.

## Setup

### Prerequisites

- Node.js 14+
- npm or yarn
- PayPal Developer Account

### Environment Variables

The following environment variables need to be set:

```
# Development/Sandbox
PAYPAL_SANDBOX_CLIENT_ID=your_sandbox_client_id
PAYPAL_SANDBOX_CLIENT_SECRET=your_sandbox_client_secret

# Production (when ready)
PAYPAL_CLIENT_ID=your_production_client_id
PAYPAL_CLIENT_SECRET=your_production_client_secret

# Frontend
REACT_APP_PAYPAL_CLIENT_ID=your_sandbox_client_id
```

### Installation

1. Install the PayPal Server SDK:

```bash
npm install @paypal/paypal-server-sdk@0.6.1
```

2. The frontend uses the PayPal JavaScript SDK which is loaded dynamically, so no installation is needed.

## Architecture

The PayPal integration follows the existing architecture patterns:

- **Backend**:
  - `PayPalPaymentService`: Handles communication with the PayPal API
  - `PaymentService`: Orchestrates the payment flow and integrates with the token service
  - API routes for creating orders and capturing payments

- **Frontend**:
  - `PayPalButton` component: Renders the PayPal button and handles the payment flow
  - `PayPalPaymentSection` component: Container for the token package selection and PayPal button

## Usage

### Backend

The `PaymentService` now supports a `provider` parameter that can be set to `'paypal'` to use PayPal for payment processing:

```typescript
// Create an order with PayPal
const result = await paymentService.createOrder(userId, packageId, 'paypal');

// Capture the payment
const captureResult = await paymentService.capturePayment(userId, orderId);
```

### Frontend

The `PayPalPaymentSection` component can be used to render the token package selection and PayPal button:

```jsx
import { PayPalPaymentSection } from '../components/PayPalPaymentSection';

function TokenPurchasePage() {
  return (
    <div>
      <h1>Purchase Tokens</h1>
      <PayPalPaymentSection />
    </div>
  );
}
```

## Testing

### Sandbox Testing

1. Set up sandbox credentials in your environment variables
2. Run the test script:

```bash
node paypal-integration-test.js
```

### Manual Testing

1. Navigate to the token purchase page
2. Select a token package
3. Click the PayPal button
4. Complete the payment flow in the PayPal popup
5. Verify that tokens are credited to the user's account

### Sandbox Accounts

For testing, you can use the following sandbox accounts:

- **Business Account**: sb-nk2c338418610@business.example.com / E40m%Md4
- **Personal Account**: Create a sandbox personal account in the PayPal Developer Dashboard

## Troubleshooting

### Common Issues

1. **PayPal SDK fails to load**:
   - Check that the client ID is correct
   - Verify that the SDK URL is accessible

2. **Order creation fails**:
   - Check server logs for detailed error messages
   - Verify that the PayPal credentials are correct

3. **Payment capture fails**:
   - Check that the order ID is valid
   - Verify that the order hasn't already been captured

### Logging

The integration includes comprehensive logging:

- All requests to the PayPal API are logged
- Responses are logged with appropriate detail
- Errors are logged with context information

## Production Deployment

Before deploying to production:

1. Create a PayPal live application in the PayPal Developer Dashboard
2. Update environment variables with production credentials
3. Test the complete flow in the production environment with real accounts
4. Monitor the initial transactions closely

## Support

For issues with the PayPal integration, contact the development team or refer to the [PayPal Developer Documentation](https://developer.paypal.com/docs/api/overview/). 