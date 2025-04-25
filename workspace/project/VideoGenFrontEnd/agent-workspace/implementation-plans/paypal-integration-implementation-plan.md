# PayPal Integration Implementation Plan

## Overview

This implementation plan outlines the steps required to integrate PayPal as a payment provider in our application. The integration will follow our established service architecture standards and maintain clean domain boundaries.

## Implementation Phases

### Phase 1: Update Payment Service Types 🔄

- [x] 1.1 Add PayPal-specific types to payment service
  - [x] Create `PaymentProvider` enum with 'mock' and 'paypal' options
  - [x] Update `CreateOrderRequest` interface to include provider field
  - [x] Add `PayPalCaptureRequest` interface for PayPal-specific capture
  - [x] Document all new types with JSDoc comments

- [x] 1.2 Update existing interfaces for provider support
  - [x] Modify `PaymentResult` to include payment provider information
  - [x] Add PayPal-specific fields to payment response types
  - [x] Ensure backward compatibility with existing code

### Phase 2: Enhance Payment Service Implementation 🛠️

- [x] 2.1 Update `createOrder` method
  - [x] Modify to accept payment provider parameter
  - [x] Add proper validation for provider parameter
  - [x] Update logging to include provider information
  - [x] Ensure backward compatibility with existing code

- [x] 2.2 Add PayPal-specific payment capture method
  - [x] Implement `capturePayPalPayment` method
  - [x] Add proper error handling and logging
  - [x] Ensure consistent response format with existing methods
  - [x] Add retry logic for transient errors

- [x] 2.3 Update service documentation
  - [x] Document new methods with JSDoc comments
  - [x] Update README with PayPal integration details
  - [x] Add code examples for PayPal integration

### Phase 3: Create PayPal Button Component 🎨

- [x] 3.1 Create PayPal SDK loader utility
  - [x] Create `src/utils/paypal/sdk-loader.ts` utility
  - [x] Implement dynamic script loading with error handling
  - [x] Add cleanup to prevent memory leaks
  - [x] Add TypeScript types for PayPal SDK

- [x] 3.2 Create PayPal Button component
  - [x] Create `src/components/tokens/PayPalButton.tsx` component
  - [x] Implement component following React best practices
  - [x] Add proper TypeScript typing for props and callbacks
  - [x] Implement callback handlers for success/error/cancel
  - [x] Add loading and error states with user feedback

- [x] 3.3 Style PayPal Button
  - [x] Ensure consistent styling with our design system
  - [x] Implement responsive design for all screen sizes
  - [x] Add proper accessibility attributes
  - [x] Ensure dark mode compatibility

### Phase 4: Update Token Purchase Page 📝

- [x] 4.1 Add payment method selection
  - [x] Add payment method state to `TokenPurchasePage`
  - [x] Create payment method selection UI
  - [x] Implement state management for payment method
  - [x] Add smooth transitions between payment methods

- [x] 4.2 Integrate PayPal Button
  - [x] Add conditional rendering based on selected payment method
  - [x] Pass proper props to PayPal Button component
  - [x] Implement success/error/cancel handlers
  - [x] Update token balance after successful payment

- [x] 4.3 Update purchase flow
  - [x] Modify existing purchase flow to work with both payment methods
  - [x] Ensure consistent user experience across payment methods
  - [x] Add proper loading and error states
  - [x] Implement transaction history refresh after purchase

### Phase 5: Environment Configuration ⚙️

- [x] 5.1 Create PayPal configuration module
  - [x] Create `src/config/paypal.ts` configuration module
  - [x] Implement environment-based configuration
  - [x] Add proper TypeScript typing
  - [x] Document configuration options

- [ ] 5.2 Set up environment variables
  - [ ] Add PayPal client IDs to Replit Secrets
    - [ ] `PAYPAL_CLIENT_ID_SANDBOX` for development
    - [ ] `PAYPAL_CLIENT_ID_LIVE` for production
  - [x] Update configuration to use environment variables
  - [x] Add fallback values for development

### Phase 6: Testing and Debugging 🧪

- [ ] 6.1 Test in development environment
  - [ ] Test with PayPal sandbox
  - [ ] Verify order creation with PayPal provider
  - [ ] Verify payment capture with PayPal
  - [ ] Verify token balance update after payment

- [ ] 6.2 Test error scenarios
  - [ ] Test network errors during SDK loading
  - [ ] Test user cancellation of PayPal payment
  - [ ] Test invalid inputs and error handling
  - [ ] Test token balance update failures

- [ ] 6.3 Debug and fix issues
  - [ ] Address any issues found during testing
  - [ ] Ensure proper error handling and user feedback
  - [ ] Verify consistent behavior across browsers
  - [ ] Test on mobile devices

### Phase 7: Documentation and Deployment 📚

- [ ] 7.1 Update documentation
  - [ ] Document PayPal integration in service documentation
  - [ ] Add usage examples for developers
  - [ ] Document configuration options and environment setup
  - [ ] Create user guide for PayPal payment flow

- [ ] 7.2 Prepare for production
  - [ ] Switch to production PayPal client ID
  - [ ] Verify production configuration
  - [ ] Final testing in production-like environment
  - [ ] Ensure proper error tracking and logging

- [ ] 7.3 Deploy to production
  - [ ] Deploy code changes
  - [ ] Verify functionality in production
  - [ ] Monitor for any issues
  - [ ] Collect user feedback

## Implementation Details

### Payment Service Updates

The `PaymentService` needs to be updated to support different payment providers:

```typescript
// src/core/services/payment/types.ts
export enum PaymentProvider {
  MOCK = 'mock',
  PAYPAL = 'paypal'
}

export interface CreateOrderRequest {
  packageId: string;
  provider?: PaymentProvider;
}

export interface PayPalCaptureRequest {
  orderId: string;
}
```

```typescript
// src/core/services/payment/service.ts
/**
 * Create a payment order for a token package
 * 
 * @param packageId The ID of the token package to purchase
 * @param provider The payment provider to use (default: 'mock')
 * @returns A ServiceResult containing the order ID if successful, or an error if the operation failed
 */
public async createOrder(
  packageId: string, 
  provider: PaymentProvider = PaymentProvider.MOCK
): Promise<ServiceResult<string>> {
  this.log('createOrder', { packageId, provider });

  try {
    const endpoint = 'payments/createOrder';
    
    this.log('createOrder:request', { 
      endpoint,
      fullUrl: this._apiClient.getFullApiUrl(endpoint),
      method: 'POST', 
      body: { packageId, provider },
      apiBaseUrl: config.apiBaseUrl,
      apiPath: config.apiPath,
      environment: config.environment
    }, 'debug');

    const response = await this.withRetry(() => 
      this._apiClient.post<{ orderId: string }>(endpoint, { packageId, provider })
    );
    
    // Rest of the method remains the same
    // ...
  }
}

/**
 * Capture a PayPal payment
 * 
 * This method completes the payment process for a PayPal order that was previously created.
 * It communicates with the backend API to process the payment and update the token balance.
 * 
 * @param orderId The ID of the PayPal order to capture
 * @returns A ServiceResult containing the payment result if successful, or an error if the operation failed
 */
public async capturePayPalPayment(orderId: string): Promise<ServiceResult<PaymentResult>> {
  this.log('capturePayPalPayment', { orderId });

  try {
    const endpoint = 'payments/paypal/capturePayment';
    
    this.log('capturePayPalPayment:request', { 
      endpoint,
      fullUrl: this._apiClient.getFullApiUrl(endpoint),
      method: 'POST', 
      body: { orderId },
      apiBaseUrl: config.apiBaseUrl,
      apiPath: config.apiPath,
      environment: config.environment
    }, 'debug');

    const response = await this.withRetry(() => 
      this._apiClient.post<PaymentResult>(endpoint, { orderId })
    );
    
    // Similar validation and error handling as capturePayment method
    // ...
  }
}
```

### PayPal Button Component

```typescript
// src/components/tokens/PayPalButton.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { paymentService } from '@/core/services/payment';
import { PaymentProvider } from '@/core/services/payment/types';
import type { PaymentResult } from '@/core/services/payment/types';
import { paypalConfig } from '@/config/paypal';

interface PayPalButtonProps {
  packageId: string;
  onSuccess: (data: PaymentResult) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    paypal: any;
  }
}

export const PayPalButton: React.FC<PayPalButtonProps> = ({
  packageId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  
  // Load PayPal script
  useEffect(() => {
    const loadPayPalScript = () => {
      try {
        // Remove any existing PayPal script
        const existingScript = document.getElementById('paypal-script');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
        
        // Create new script element
        const script = document.createElement('script');
        script.id = 'paypal-script';
        script.src = `https://www.paypal.com/sdk/js?client-id=${paypalConfig.clientId}&currency=${paypalConfig.currency}`;
        script.async = true;
        
        // Set up load and error handlers
        script.onload = () => {
          setScriptLoaded(true);
          setLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to load PayPal SDK');
          setLoading(false);
        };
        
        // Add script to document
        document.body.appendChild(script);
      } catch (err) {
        setError('Failed to initialize PayPal');
        setLoading(false);
      }
    };
    
    loadPayPalScript();
    
    // Cleanup function
    return () => {
      const script = document.getElementById('paypal-script');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function to create a PayPal order
  const createOrder = useCallback(async () => {
    try {
      // Call our backend to create the order with PayPal provider
      const result = await paymentService.createOrder(packageId, PaymentProvider.PAYPAL);
      
      if (result.error) {
        throw result.error;
      }
      
      return result.data;
    } catch (err) {
      setError('Failed to create order');
      onError(err);
      throw err;
    }
  }, [packageId, onError]);

  // Function to handle PayPal approval
  const handleApprove = useCallback(async (data: { orderID: string }) => {
    try {
      setLoading(true);
      // Call our backend to capture the payment
      const result = await paymentService.capturePayPalPayment(data.orderID);
      
      if (result.error) {
        throw result.error;
      }
      
      // Call success callback with result data
      onSuccess(result.data!);
    } catch (err) {
      setError('Failed to process payment');
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [onSuccess, onError]);
  
  // Render PayPal buttons when script is loaded
  useEffect(() => {
    if (scriptLoaded && window.paypal) {
      try {
        // Clear any existing buttons
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = '';
        }
        
        // Render PayPal buttons
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
          },
          createOrder,
          onApprove: (data: any) => handleApprove(data),
          onCancel: () => {
            onCancel();
          },
          onError: (err: any) => {
            setError('PayPal encountered an error');
            onError(err);
          }
        }).render('#paypal-button-container');
      } catch (err) {
        setError('Failed to render PayPal buttons');
      }
    }
  }, [scriptLoaded, createOrder, handleApprove, onCancel, onError]);
  
  if (error) {
    return (
      <div className="error-message">
        {error}
        <button onClick={() => setError(null)}>Try Again</button>
      </div>
    );
  }
  
  return (
    <div>
      {loading && <div className="loading-spinner">Loading...</div>}
      <div id="paypal-button-container" style={{ minHeight: 44 }} />
    </div>
  );
};
```

### PayPal Configuration

```typescript
// src/config/paypal.ts
import { config } from '@/config/env';

export const paypalConfig = {
  clientId: config.environment === 'production'
    ? process.env.PAYPAL_CLIENT_ID_LIVE || 'AZmiAV1bASnR9Bp8miHR8N6lIkAAq8x2gjvWhDDK5lzwqHU5S8ySjeI9e_q-CB_Kq4Tj3nN6jVS8MRU4'
    : process.env.PAYPAL_CLIENT_ID_SANDBOX || 'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9',
  currency: 'USD'
};
```

## Technical Considerations

### API Endpoints

The backend should have the following endpoints ready:
- `POST /api/payments/createOrder` - Create an order with specified provider
- `POST /api/payments/paypal/capturePayment` - Capture a PayPal payment

### Error Handling

The PayPal integration requires robust error handling at multiple levels:
1. SDK loading errors
2. Order creation errors
3. Payment approval errors
4. Payment capture errors

Each of these should be handled gracefully with appropriate user feedback.

### Security Considerations

1. Never include PayPal client IDs directly in the code
2. Use environment variables or secrets management
3. Validate all responses from PayPal on the backend
4. Implement proper CSRF protection

## Testing Strategy

1. Test in development environment using PayPal sandbox
2. Test the complete flow from order creation to payment capture
3. Test error scenarios (network errors, cancellation, etc.)
4. Verify token balance updates correctly after successful payment

## Next Steps

We have completed the implementation of the PayPal integration on the frontend side. The next steps are:

1. Set up the PayPal client IDs in Replit Secrets
2. Test the integration in the development environment
3. Debug and fix any issues found during testing
4. Update documentation and prepare for production deployment 