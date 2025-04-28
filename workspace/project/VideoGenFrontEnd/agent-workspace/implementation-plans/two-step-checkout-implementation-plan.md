# Two-Step Checkout Flow Implementation Plan

## Overview

This implementation plan outlines the steps needed to convert our current single-page token purchase flow into a two-step checkout process:

1. **Step 1: Package Selection** - Users select a token package from available options
2. **Step 2: Payment** - Users complete payment for their selected package

This approach improves user experience by breaking down the purchase process into logical steps and allowing for a more focused interface at each stage.

## Implementation Steps

### Phase 1: Create Core Components

- [x] **1.1 Create `useDarkMode` Hook**
  - [x] Implement detection of system and app dark mode preference
  - [x] Add event listeners for theme changes

- [x] **1.2 Create UI Components**
  - [x] Create `PageTitle` component
  - [x] Create `Button` component
  - [x] Create `Spinner` component

- [x] **1.3 Create Payment Service Hook**
  - [x] Create `usePaymentService` hook to provide access to payment service instances

- [x] **1.4 Create PayPal Components**
  - [x] Create `PayPalButton` component
  - [x] Create `PayPalCardFields` component
  - [x] Implement card fields styling

### Phase 2: Setup New Checkout Route

- [x] **2.1 Add Checkout Route**
  - [x] Update router configuration to include new checkout route
  - [x] Configure route with package ID parameter

- [x] **2.2 Create `CheckoutPage` Component**
  - [x] Create basic page structure
  - [x] Implement fetch logic for token package data
  - [x] Add payment method selection (PayPal / Card)
  - [x] Implement order summary sidebar

### Phase 3: Update Existing Purchase Page

- [x] **3.1 Update `TokenPackage` Component**
  - [x] Enhance styling to better show package details
  - [x] Add selection indicator
  - [x] Improve visual hierarchy for pricing

- [x] **3.2 Refactor `TokenPurchasePage`**
  - [x] Remove payment form
  - [x] Update package selection layout
  - [x] Add "Proceed to Checkout" button
  - [x] Implement navigation to checkout page

### Phase 4: Update Payment Service

- [x] **4.1 Update API Methods**
  - [x] Update `getTokenPackageById` to return a Promise for consistency
  - [x] Add support for package discount property

- [ ] **4.2 Update Payment Flow**
  - [ ] Modify payment creation logic
  - [ ] Update success/error handling
  - [ ] Add state persistence between pages

## Benefits

This implementation offers several key benefits:

1. **Improved User Experience**
   - Clear, step-by-step process reduces cognitive load
   - Focused UI at each step helps users make decisions

2. **Better Conversion**
   - Less overwhelming interface may increase conversion rates
   - Clear pricing and selection before payment increases trust

3. **Extensibility**
   - Architecture allows for future expansion of checkout steps
   - Easier to add features like promo codes or bundle options

## Testing Plan

1. **Unit Tests**
   - Test package selection and progression to checkout
   - Verify successful payment flow
   - Test error handling and recovery

2. **Integration Tests**
   - Verify complete flow from selection to payment
   - Test navigation between steps
   - Validate state preservation

3. **User Acceptance Testing**
   - Validate design with stakeholders
   - Gather feedback on flow and interactions

## Rollout Plan

1. **Development Environment**
   - Implement all changes in development branch
   - Conduct internal testing

2. **Staging Environment**
   - Deploy to staging for broader testing
   - Verify all integrations work as expected

3. **Production**
   - Deploy to production with monitoring
   - Collect analytics on user flow and conversion rates 