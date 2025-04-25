# Token Purchase Testing Checklist

## Basic Functionality Tests

- [ ] Test purchasing the "basic" token package
  - [ ] Verify order creation succeeds
  - [ ] Verify payment capture succeeds
  - [ ] Verify token balance increases by 160 tokens

- [ ] Test purchasing the "standard" token package
  - [ ] Verify order creation succeeds
  - [ ] Verify payment capture succeeds
  - [ ] Verify token balance increases by 425 tokens

- [ ] Test purchasing the "premium" token package
  - [ ] Verify order creation succeeds
  - [ ] Verify payment capture succeeds
  - [ ] Verify token balance increases by 900 tokens

## Error Handling Tests

- [ ] Test with invalid package ID
  - [ ] Verify appropriate error message is displayed
  - [ ] Verify error is properly logged

- [ ] Test with network disconnection
  - [ ] Verify retry mechanism works
  - [ ] Verify appropriate error message is displayed if all retries fail
  - [ ] Verify error is properly logged

- [ ] Test with server error response
  - [ ] Verify retry mechanism works for 5xx errors
  - [ ] Verify appropriate error message is displayed if all retries fail
  - [ ] Verify error is properly logged

## UI Tests

- [ ] Verify loading state is displayed during purchase
  - [ ] During order creation
  - [ ] During payment capture

- [ ] Verify success state is displayed after purchase
  - [ ] Success message
  - [ ] Updated token balance

- [ ] Verify error state is displayed when purchase fails
  - [ ] Error message
  - [ ] Option to retry

## Integration Tests

- [ ] Verify token balance updates correctly after purchase
  - [ ] In the token balance component
  - [ ] In the user profile

- [ ] Verify transaction history shows the purchase
  - [ ] Transaction type is "purchase"
  - [ ] Amount matches the package tokens
  - [ ] Description includes the package name

- [ ] Verify payment history shows the purchase
  - [ ] Payment status is "SUCCEEDED"
  - [ ] Amount matches the package price
  - [ ] Tokens purchased matches the package tokens 