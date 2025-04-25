# Token System Fix: Database and Repository Analysis

## Current State Analysis

Based on the database query results and error logs, we've identified the following issues with the token system:

### Database State
1. The `token_transactions` table exists
2. The user has multiple payment records:
   - 1 payment with status `SUCCEEDED`
   - 4 payments with status `PENDING`
3. The user likely has a record in the `user_tokens` table, but token addition is failing

### Error Logs
```
info: [TokenService] Adding tokens to user account {"amount":160,"paymentId":"da94fc24-3b7a-4fbe-8d40-3c1596253488","timestamp":"2025-03-09T20:04:11.009Z","userId":"c213a8bc-8c04-4ce3-97e7-a61699340d5e"}
error: [TokenRepository] addTokens failed {"error":"Unknown error","timestamp":"2025-03-09T20:04:11.303Z"}
```

## Root Cause

The most likely causes for the "Unknown error" when adding tokens are:

1. **Schema Mismatch**: The `token_transactions` table might be missing required columns
2. **Type Conversion Issue**: The balance might be stored as a string but treated as a number
3. **Missing Foreign Key**: The payment_id reference might be failing
4. **Exception Handling**: The error might be caught but not properly logged

## Recommended Fixes

### 1. Fix the TokenRepository Implementation

```javascript
// src/services/token/db/repository.ts

import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../../lib/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { ITokenRepository } from '../types';
import { DbResult } from '../../../types';

@injectable()
export class TokenRepository implements ITokenRepository {
  constructor(
    @inject(TYPES.Logger) private readonly logger: Logger,
    @inject(TYPES.SupabaseClient) private readonly supabase: SupabaseClient
  ) {}

  async getUserBalance(userId: string): Promise<DbResult<number>> {
    try {
      this.logger.info('[TokenRepository] Getting user balance', { userId });
      
      const { data, error } = await this.supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', userId)
        .single();
      
      if (error) {
        // If no record found, return 0 balance
        if (error.code === 'PGRST116') {
          return { success: true, data: 0 };
        }
        
        this.logger.error('[TokenRepository] Failed to get user balance', { 
          error: error.message,
          code: error.code,
          userId 
        });
        return { success: false, error };
      }
      
      // Convert balance to number (in case it's stored as string)
      const balance = typeof data.balance === 'string' 
        ? parseInt(data.balance, 10) 
        : data.balance;
      
      return { success: true, data: balance };
    } catch (error) {
      this.logger.error('[TokenRepository] getUserBalance exception', { 
        error: error.message,
        stack: error.stack,
        userId 
      });
      return { success: false, error };
    }
  }

  async addTokens(
    userId: string, 
    amount: number, 
    description: string, 
    paymentId: string
  ): Promise<DbResult<number>> {
    try {
      this.logger.info('[TokenRepository] Adding tokens', { 
        userId, 
        amount, 
        description,
        paymentId 
      });
      
      // First check if user has a balance record
      const { data: existingRecord, error: queryError } = await this.supabase
        .from('user_tokens')
        .select('id, balance')
        .eq('user_id', userId)
        .single();
      
      this.logger.info('[TokenRepository] User balance check result', {
        hasExistingRecord: !!existingRecord,
        queryError: queryError ? {
          message: queryError.message,
          code: queryError.code
        } : null
      });
      
      let newBalance = amount;
      let result;
      
      // If user has a balance record, update it
      if (existingRecord) {
        // Ensure balance is treated as a number
        const currentBalance = typeof existingRecord.balance === 'string'
          ? parseInt(existingRecord.balance, 10)
          : existingRecord.balance;
        
        newBalance = currentBalance + amount;
        
        this.logger.info('[TokenRepository] Updating existing balance', {
          userId,
          currentBalance,
          amount,
          newBalance
        });
        
        result = await this.supabase
          .from('user_tokens')
          .update({ 
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } 
      // If no balance record, create one
      else {
        this.logger.info('[TokenRepository] Creating new balance record', {
          userId,
          initialBalance: amount
        });
        
        result = await this.supabase
          .from('user_tokens')
          .insert({
            user_id: userId,
            balance: amount,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      // Check for errors in the update/insert operation
      if (result.error) {
        this.logger.error('[TokenRepository] Failed to update token balance', {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
          userId,
          amount
        });
        return { success: false, error: result.error };
      }
      
      // Now record the transaction
      this.logger.info('[TokenRepository] Recording token transaction', {
        userId,
        amount,
        description,
        paymentId,
        balanceAfter: newBalance
      });
      
      try {
        const transactionResult = await this.supabase
          .from('token_transactions')
          .insert({
            user_id: userId,
            amount: amount,
            transaction_type: 'purchase',
            description: description,
            payment_id: paymentId,
            balance_after: newBalance,
            created_at: new Date().toISOString()
          });
        
        if (transactionResult.error) {
          this.logger.error('[TokenRepository] Failed to record token transaction', {
            error: transactionResult.error.message,
            code: transactionResult.error.code,
            details: transactionResult.error.details,
            userId,
            amount
          });
          // We don't fail the whole operation if just the transaction record fails
        }
      } catch (txError) {
        this.logger.error('[TokenRepository] Exception recording token transaction', {
          error: txError.message,
          stack: txError.stack,
          userId,
          amount
        });
        // Continue despite transaction recording error
      }
      
      return { success: true, data: newBalance };
    } catch (error) {
      this.logger.error('[TokenRepository] addTokens exception', {
        error: error.message,
        stack: error.stack,
        userId,
        amount,
        paymentId
      });
      return { success: false, error };
    }
  }

  async useTokens(
    userId: string, 
    amount: number, 
    description: string
  ): Promise<DbResult<number>> {
    try {
      this.logger.info('[TokenRepository] Using tokens', { 
        userId, 
        amount, 
        description 
      });
      
      // Get current balance
      const balanceResult = await this.getUserBalance(userId);
      
      if (!balanceResult.success) {
        return balanceResult;
      }
      
      const currentBalance = balanceResult.data;
      
      // Check if user has enough tokens
      if (currentBalance < amount) {
        this.logger.warn('[TokenRepository] Insufficient token balance', {
          userId,
          currentBalance,
          requestedAmount: amount
        });
        return {
          success: false,
          error: new Error('Insufficient token balance')
        };
      }
      
      // Update balance
      const newBalance = currentBalance - amount;
      
      const result = await this.supabase
        .from('user_tokens')
        .update({ 
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
      
      if (result.error) {
        this.logger.error('[TokenRepository] Failed to update token balance', {
          error: result.error.message,
          code: result.error.code,
          details: result.error.details,
          userId,
          amount
        });
        return { success: false, error: result.error };
      }
      
      // Record the transaction
      try {
        const transactionResult = await this.supabase
          .from('token_transactions')
          .insert({
            user_id: userId,
            amount: -amount, // Negative amount for usage
            transaction_type: 'usage',
            description: description,
            balance_after: newBalance,
            created_at: new Date().toISOString()
          });
        
        if (transactionResult.error) {
          this.logger.error('[TokenRepository] Failed to record token usage transaction', {
            error: transactionResult.error.message,
            code: transactionResult.error.code,
            details: transactionResult.error.details,
            userId,
            amount
          });
          // We don't fail the whole operation if just the transaction record fails
        }
      } catch (txError) {
        this.logger.error('[TokenRepository] Exception recording token usage transaction', {
          error: txError.message,
          stack: txError.stack,
          userId,
          amount
        });
        // Continue despite transaction recording error
      }
      
      return { success: true, data: newBalance };
    } catch (error) {
      this.logger.error('[TokenRepository] useTokens exception', {
        error: error.message,
        stack: error.stack,
        userId,
        amount
      });
      return { success: false, error };
    }
  }

  async getTransactionHistory(
    userId: string,
    limit: number = 10,
    offset: number = 0
  ): Promise<DbResult<any[]>> {
    try {
      this.logger.info('[TokenRepository] Getting transaction history', { 
        userId, 
        limit, 
        offset 
      });
      
      const { data, error, count } = await this.supabase
        .from('token_transactions')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) {
        this.logger.error('[TokenRepository] Failed to get transaction history', {
          error: error.message,
          code: error.code,
          userId
        });
        return { success: false, error };
      }
      
      return { 
        success: true, 
        data: data || [],
        metadata: { total: count || 0 }
      };
    } catch (error) {
      this.logger.error('[TokenRepository] getTransactionHistory exception', {
        error: error.message,
        stack: error.stack,
        userId
      });
      return { success: false, error };
    }
  }
}
```

### 2. Verify and Fix Database Schema

Run these SQL commands to ensure the database schema is correct:

```sql
-- Check token_transactions table schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'token_transactions';

-- Add any missing columns to token_transactions
ALTER TABLE public.token_transactions 
ADD COLUMN IF NOT EXISTS balance_after INTEGER;

-- Check user_tokens table schema
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
AND table_name = 'user_tokens';

-- Ensure balance is stored as integer
ALTER TABLE public.user_tokens 
ALTER COLUMN balance TYPE INTEGER USING balance::INTEGER;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id 
ON public.token_transactions(user_id);

CREATE INDEX IF NOT EXISTS idx_token_transactions_payment_id 
ON public.token_transactions(payment_id);
```

### 3. Clean Up Pending Payments

To clean up the database and ensure a consistent state:

```sql
-- Update old pending payments to FAILED status
UPDATE public.payments
SET status = 'FAILED', 
    updated_at = NOW(),
    metadata = jsonb_build_object('error', 'Payment timed out')
WHERE status = 'PENDING' 
AND created_at < NOW() - INTERVAL '1 hour';
```

### 4. Implement Retry Logic in PaymentService

Add retry logic to the PaymentService to handle transient database errors:

```javascript
// In PaymentService.capturePayment method
const MAX_RETRIES = 3;
let retryCount = 0;
let tokenResult;

while (retryCount < MAX_RETRIES) {
  tokenResult = await this.tokenService.addTokens(
    userId,
    payment.tokens_purchased,
    `Purchase via mock payment ${captureResult.transactionId}`,
    payment.id
  );
  
  if (tokenResult.success) {
    break;
  }
  
  this.logWarn(`Token addition failed, retrying (${retryCount + 1}/${MAX_RETRIES})`, {
    userId,
    orderId,
    error: tokenResult.error,
    attempt: retryCount + 1
  });
  
  // Wait before retrying (exponential backoff)
  await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
  retryCount++;
}

if (!tokenResult.success) {
  this.logError('Failed to add tokens after multiple retries', {
    userId,
    orderId,
    error: tokenResult.error,
    attempts: retryCount
  });
  
  // Update payment status to reflect the token addition failure
  await this.repository.updatePaymentStatus(
    payment.id,
    PaymentStatus.FAILED,
    {
      error: 'Token addition failed after multiple retries',
      transactionId: captureResult.transactionId
    }
  );
  
  return {
    success: false,
    error: new PaymentProcessingError('Failed to add tokens to user account')
  };
}
```

## Implementation Steps

1. **Update TokenRepository**: Implement the improved version with better error handling and logging
2. **Verify Database Schema**: Run the SQL commands to check and fix the database schema
3. **Clean Up Database**: Update old pending payments to maintain data consistency
4. **Add Retry Logic**: Implement retry logic in the PaymentService
5. **Test**: Test the complete payment flow after making these changes

## Monitoring and Verification

After implementing these changes:

1. **Monitor Logs**: Watch for detailed error logs that should now provide more information
2. **Verify Transactions**: Check that token transactions are being properly recorded
3. **Test Edge Cases**: Test with new users and existing users to ensure both flows work
4. **Performance Check**: Monitor database query performance with the new implementation

These changes should resolve the "Unknown error" issue and ensure that tokens are properly added to user accounts after successful payments. 