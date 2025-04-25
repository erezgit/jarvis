# Testing Credit Card Payments with PayPal

This document provides a step-by-step guide for testing credit card payments through the PayPal integration.

## Prerequisites

Before testing, ensure you have:

1. A PayPal sandbox account for testing
2. The frontend implementation updated with credit card support
3. The backend PayPal integration properly configured
4. Access to the PayPal Developer Dashboard

## Test Environment Setup

1. **Verify Sandbox Credentials**:
   - Log in to the [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/)
   - Confirm your sandbox business account is active
   - Verify the client ID and secret are correctly configured in your application

2. **Prepare Test Credit Cards**:
   - PayPal provides test credit cards for sandbox testing
   - Common test cards include:
     - Visa: `4111111111111111`
     - Mastercard: `5555555555554444`
     - American Express: `378282246310005`
     - Discover: `6011111111111117`
   - Use any future expiration date and any 3-digit CVV (4-digit for Amex)

## Test Scenarios

### Test Case 1: Basic Credit Card Payment Flow

1. **Access the Token Purchase Page**:
   - Navigate to your application's token purchase page
   - Select a token package

2. **Initiate PayPal Payment**:
   - Click on the PayPal button
   - Verify that the PayPal popup appears
   - Confirm that credit card options are visible (may appear as "Debit or Credit Card" button)

3. **Complete Credit Card Payment**:
   - Click on the credit card option
   - Enter test credit card details:
     - Card number: `4111111111111111` (Visa)
     - Expiration: Any future date
     - CVV: Any 3 digits
     - Name: Any name
     - Billing address: Any valid address format

4. **Verify Payment Success**:
   - Confirm the payment is processed successfully
   - Verify you're redirected back to your application
   - Check that the success message appears
   - Confirm token balance is updated

### Test Case 2: Payment Cancellation

1. **Initiate PayPal Payment**:
   - Select a token package
   - Click on the PayPal button

2. **Cancel the Payment**:
   - In the PayPal popup, click "Cancel" or close the popup
   - Verify you're returned to your application
   - Confirm the cancellation message appears
   - Verify no tokens were added to your balance

### Test Case 3: Payment Error Handling

1. **Initiate PayPal Payment**:
   - Select a token package
   - Click on the PayPal button

2. **Trigger a Payment Error**:
   - Use an invalid test card (e.g., `4000000000000002`)
   - Complete the payment process
   - Verify the error is handled gracefully
   - Confirm the error message appears
   - Verify no tokens were added to your balance

## Verification Checklist

After completing the tests, verify the following:

- [ ] Credit card payment option appears in the PayPal popup
- [ ] Successful payments are properly processed
- [ ] Payment cancellations are handled correctly
- [ ] Payment errors are handled gracefully
- [ ] Token balance updates correctly after successful payments
- [ ] Transaction records are created in your database
- [ ] PayPal transaction records appear in the PayPal sandbox dashboard

## Troubleshooting Common Issues

### Credit Card Option Not Appearing

If the credit card option doesn't appear:

1. **Check SDK Loading Parameters**:
   - Verify the SDK URL includes `components=buttons,funding-eligibility&enable-funding=card`
   - Check browser console for any errors during SDK loading

2. **Regional Restrictions**:
   - Some regions may not support credit card payments through PayPal
   - Try changing the country in your sandbox account settings

3. **Account Configuration**:
   - Verify your PayPal business account is configured to accept credit cards
   - Check if advanced credit card payments are enabled

### Payment Processing Errors

If payments fail to process:

1. **Check Backend Logs**:
   - Look for errors in your server logs
   - Verify the PayPal client is properly initialized

2. **Verify API Responses**:
   - Check network requests in browser developer tools
   - Confirm the order creation and capture endpoints return expected responses

3. **Sandbox Environment Issues**:
   - PayPal sandbox can occasionally have service disruptions
   - Check the [PayPal Developer Status page](https://status.developer.paypal.com/)

## Next Steps

After successful testing:

1. **Document Test Results**:
   - Record which test cases passed/failed
   - Note any issues encountered and their resolutions

2. **Prepare for Production**:
   - Update configuration for production environment
   - Perform limited production testing with real accounts
   - Monitor initial transactions closely 