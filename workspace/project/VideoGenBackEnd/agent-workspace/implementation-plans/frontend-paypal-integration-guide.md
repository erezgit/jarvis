# Frontend PayPal Integration Guide

This document provides detailed instructions for the frontend team on how to integrate with the PayPal payment backend that has been implemented.

## 📋 Implementation Progress Tracker

- [✅] Backend PayPal integration completed
- [✅] PayPal SDK dependencies installed
- [✅] API endpoints for PayPal payment implemented
- [ ] Frontend PayPal button component implementation
- [ ] Credit card payment option enabled
- [ ] Testing with PayPal sandbox accounts

## Overview

The backend has been updated to support PayPal as a payment provider alongside the existing mock payment system. To use PayPal, the frontend needs to:

1. Send `provider: "paypal"` when creating an order
2. Handle the PayPal payment flow using the PayPal JavaScript SDK
3. Capture the payment after approval
4. **NEW**: Enable credit card payments through the PayPal SDK

## Step-by-Step Integration Guide

### Step 1: Update the Payment Service

First, ensure your frontend `PaymentService` can specify the payment provider when creating an order:

```typescript
// src/services/PaymentService.ts

/**
 * Create a payment order
 * 
 * @param packageId - The ID of the token package to purchase
 * @param provider - The payment provider to use (default: 'mock')
 * @returns Promise with the order ID
 */
public static async createOrder(
  packageId: string,
  provider: 'mock' | 'paypal' = 'mock'
): Promise<string> {
  try {
    const response = await httpClient.post(
      '/api/payments/createOrder',
      { packageId, provider }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to create order');
    }
    
    return response.data.orderId;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
}

/**
 * Capture a PayPal payment
 * 
 * @param orderId - The PayPal order ID to capture
 * @returns Promise with the payment result
 */
public static async capturePayPalPayment(orderId: string): Promise<PaymentResult> {
  try {
    const response = await httpClient.post(
      '/api/payments/paypal/capturePayment',
      { orderId }
    );
    
    if (!response.data.success) {
      throw new Error(response.data.error?.message || 'Failed to capture PayPal payment');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error capturing PayPal payment:', error);
    throw error;
  }
}
```

### Step 2: Create a PayPal Button Component with Credit Card Support

Create a component that handles the PayPal SDK loading and button rendering, with explicit support for credit card payments:

```typescript
// src/components/PayPalButton.tsx

import React, { useEffect, useState, useCallback } from 'react';
import { PaymentService } from '../services/PaymentService';

interface PayPalButtonProps {
  packageId: string;
  onSuccess: (data: any) => void;
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
        
        // IMPORTANT: Updated SDK URL to enable credit card payments
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD&components=buttons,funding-eligibility&enable-funding=card`;
        script.async = true;
        
        // Set up load and error handlers
        script.onload = () => {
          setScriptLoaded(true);
          setLoading(false);
          console.log('PayPal SDK loaded successfully with credit card support');
        };
        
        script.onerror = () => {
          setError('Failed to load PayPal SDK');
          setLoading(false);
          console.error('Failed to load PayPal SDK');
        };
        
        // Add script to document
        document.body.appendChild(script);
      } catch (err) {
        setError('Failed to initialize PayPal');
        setLoading(false);
        console.error('Error initializing PayPal:', err);
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
      const orderId = await PaymentService.createOrder(packageId, 'paypal');
      console.log('Created PayPal order:', orderId);
      return orderId;
    } catch (err) {
      setError('Failed to create order');
      onError(err);
      console.error('Error creating order:', err);
      throw err;
    }
  }, [packageId, onError]);

  // Function to handle PayPal approval
  const handleApprove = useCallback(async (data: { orderID: string }) => {
    try {
      setLoading(true);
      console.log('Payment approved, capturing payment for order:', data.orderID);
      
      // Call our backend to capture the payment
      const result = await PaymentService.capturePayPalPayment(data.orderID);
      
      // Call success callback with result data
      console.log('Payment captured successfully:', result);
      onSuccess(result);
    } catch (err) {
      setError('Failed to process payment');
      onError(err);
      console.error('Error processing payment:', err);
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
        
        console.log('Rendering PayPal buttons with credit card support');
        
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
            console.log('Payment cancelled by user');
            onCancel();
          },
          onError: (err: any) => {
            console.error('PayPal error:', err);
            setError('PayPal encountered an error');
            onError(err);
          }
        }).render('#paypal-button-container');
      } catch (err) {
        console.error('Error rendering PayPal buttons:', err);
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

### Step 3: Update the Token Purchase Component

Modify your existing token purchase component to use PayPal with credit card support:

```typescript
// src/components/TokenPurchase.tsx

import React, { useState } from 'react';
import { PayPalButton } from './PayPalButton';

export const TokenPurchase = () => {
  const [selectedPackage, setSelectedPackage] = useState('basic');
  const [paymentStatus, setPaymentStatus] = useState('idle');
  const [paymentResult, setPaymentResult] = useState(null);
  
  const handlePaymentSuccess = (result) => {
    console.log('Payment successful:', result);
    setPaymentStatus('success');
    setPaymentResult(result);
    // Update user's token balance or show success message
  };
  
  const handlePaymentError = (error) => {
    console.error('Payment error:', error);
    setPaymentStatus('error');
    // Show error message
  };
  
  const handlePaymentCancel = () => {
    console.log('Payment cancelled');
    setPaymentStatus('cancelled');
    // Show cancelled message
  };
  
  return (
    <div className="token-purchase">
      <h2>Purchase Tokens</h2>
      
      {/* Package selection UI */}
      <div className="package-selection">
        {/* Your package selection UI here */}
      </div>
      
      {/* PayPal Button with credit card support */}
      <PayPalButton
        packageId={selectedPackage}
        onSuccess={handlePaymentSuccess}
        onError={handlePaymentError}
        onCancel={handlePaymentCancel}
      />
      
      {/* Payment status messages */}
      {paymentStatus === 'success' && (
        <div className="success-message">
          Payment successful! You've purchased tokens.
        </div>
      )}
      
      {paymentStatus === 'error' && (
        <div className="error-message">
          Payment failed. Please try again.
        </div>
      )}
      
      {paymentStatus === 'cancelled' && (
        <div className="info-message">
          Payment was cancelled.
        </div>
      )}
    </div>
  );
};
```

## Credit Card Payment Configuration

### Key Changes for Credit Card Support

The most important change to enable credit card payments is updating the PayPal SDK loading URL:

```javascript
// Before: Basic PayPal SDK loading
script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;

// After: Enhanced SDK loading with credit card support
script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD&components=buttons,funding-eligibility&enable-funding=card`;
```

The important parameters are:
- `components=buttons,funding-eligibility`: Specifies which components to load
- `enable-funding=card`: Explicitly enables credit card payment options

### Testing Credit Card Payments

When testing credit card payments:

1. **Sandbox Testing**: Use PayPal's sandbox environment with test credit card numbers
2. **Regional Availability**: Credit card processing through PayPal varies by country/region
3. **Account Configuration**: Ensure your PayPal business account is configured to accept credit cards
4. **Browser Compatibility**: Test across different browsers and devices

### PayPal Account Requirements

To use credit card payments through PayPal:

1. You must have a PayPal Business account
2. Your account must be verified
3. You may need to enable advanced credit and debit card payments in your PayPal account settings
4. Some regions may require additional verification or have limitations

## Troubleshooting

If credit card options are not appearing:

1. **Check SDK Loading**: Verify the SDK is loading correctly with the proper parameters
2. **Console Errors**: Look for any JavaScript errors in the browser console
3. **Regional Restrictions**: Confirm credit card processing is available in your region
4. **Account Settings**: Verify your PayPal account is properly configured
5. **Sandbox vs Production**: Different environments may have different capabilities

## Payment Flow Diagram

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │     │   Backend   │     │   PayPal    │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       │  Create Order     │                   │
       │ ─────────────────>│                   │
       │                   │  Create Order     │
       │                   │ ─────────────────>│
       │                   │                   │
       │                   │   Order ID        │
       │    Order ID       │ <─────────────────│
       │ <─────────────────│                   │
       │                   │                   │
       │  Show PayPal UI   │                   │
       │ with Credit Cards │                   │
       │                   │                   │
       │  User Approves    │                   │
       │                   │                   │
       │  Capture Payment  │                   │
       │ ─────────────────>│                   │
       │                   │ Capture Payment   │
       │                   │ ─────────────────>│
       │                   │                   │
       │                   │ Payment Complete  │
       │ Payment Complete  │ <─────────────────│
       │ <─────────────────│                   │
       │                   │                   │
       │ Update UI         │                   │
       │                   │                   │
```

## References

- [PayPal Developer Documentation](https://developer.paypal.com/docs/checkout/)
- [Advanced Credit and Debit Card Payments](https://developer.paypal.com/docs/checkout/advanced/customize/card-fields/)
- [PayPal SDK Parameters Reference](https://developer.paypal.com/docs/checkout/reference/customize-sdk/) 