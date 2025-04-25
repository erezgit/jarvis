# Obsolete Files for Removal

As part of the consolidation of billing pages, the following files and directories are marked for removal once the new Billing Page implementation is fully tested and deployed.

## Token Pages (All Replaced by Billing Page)

1. `/src/pages/Tokens/Purchase/index.tsx` - Replaced by BillingPage
2. `/src/pages/Tokens/Transactions/index.tsx` - Replaced by BillingPage payment history
3. `/src/pages/Tokens/History/index.tsx` - Replaced by BillingPage payment history
4. `/src/pages/Tokens/Purchase/components/` - Any components in this directory
5. `/src/pages/Tokens/Transactions/components/` - Any components in this directory
6. `/src/pages/Tokens/History/components/` - Any components in this directory
7. `/src/pages/Tokens/Transactions/__tests__/TransactionHistoryPage.test.tsx` - Tests for the old page

## Preservation Notices

The following files should be preserved as they might still be in use by other parts of the application:

1. `/src/pages/Tokens/Checkout/index.tsx` - May still be in use for checkout flow
2. `/src/pages/Tokens/Payment/index.tsx` - May still be in use for payment processing

## Deprecation Process

1. **Phase 1 (Current)**: Add deprecation notices to files
2. **Phase 2**: After 2 weeks of stable operation with the new billing page, archive files 
3. **Phase 3**: After 1 month of stable operation, completely remove obsolete files

## Component Dependencies

Before removing any files, check for dependencies in:

- `/src/components/tokens/` - May contain components used by other parts of the application
- Import statements throughout the codebase
- Tests that may depend on these components 