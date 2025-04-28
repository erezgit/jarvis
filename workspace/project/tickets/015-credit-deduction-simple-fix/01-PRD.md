# Product Requirements Document: Simple Credit Deduction Fix

## Overview
The system currently tracks credit usage correctly but fails to actually deduct credits from user accounts. This document outlines the requirements for implementing a simple, direct credit deduction mechanism.

## Problem Statement
When users consume paid time in chat sessions (after their free time allocation is used up), credits are added to the `creditsUsed` field in the conversation time record, but the same amount is not deducted from the user's credit balance. This results in users not being charged for services used.

## Solution
Implement a direct credit deduction where the exact same amount added to `creditsUsed` is deducted from the user's credit balance in real-time.

## Functional Requirements
1. **Simple Credit Deduction**
   - After free time is used, deduct a fixed amount (e.g., $0.25) from the user's credit balance every 15 seconds
   - The amount deducted must match exactly what's added to `creditsUsed`
   - No complex calculations or comparisons needed

2. **Error Handling**
   - Log credit deduction events (success/failure)
   - Continue time tracking even if credit deduction fails

## Non-Functional Requirements
1. **Performance**
   - The credit deduction should not impact system performance or user experience
   
2. **Reliability**
   - Credit deduction must be reliable and consistent
   - No duplicate charges or missed charges

## Success Metrics
1. User credit balances decrease in exact proportion to their paid time usage
2. No system errors or performance degradation due to the new feature 