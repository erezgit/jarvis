# Token System Implementation Plan

## Current State Analysis

Based on the database query results and error logs, we've identified the specific issues with the token system:

1. **User Tokens Table**:
   - The table exists with the correct schema
   - The `balance` column is correctly stored as an integer
   - All required columns are present

2. **Token Transactions Table**:
   - The query returned "No rows returned" which suggests either:
     - The table doesn't exist
     - The table exists but has no records

3. **Error Pattern**:
   - Payment capture works successfully
   - Token addition fails with "Unknown error"
   - No token transactions are being recorded

## Implementation Plan

### Step 1: Verify Token Transactions Table Existence

Run this SQL query to check if the token_transactions table exists:

```sql
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name = 'token_transactions'
);
```

If the table doesn't exist, create it:

```sql
CREATE TABLE IF NOT EXISTS public.token_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    transaction_type TEXT NOT NULL,
    description TEXT,
    payment_id UUID REFERENCES public.payments(id) ON DELETE SET NULL,
    balance_after INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    CONSTRAINT valid_transaction_type CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'adjustment'))
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_transactions_user_id ON public.token_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_token_transactions_payment_id ON public.token_transactions(payment_id);
```

### Step 2: Update TokenRepository Implementation

Replace the current TokenRepository implementation with this improved version:

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

### Step 3: Update PaymentService with Retry Logic

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

### Step 4: Clean Up Pending Payments

Run this SQL to clean up old pending payments:

```sql
-- Update old pending payments to FAILED status
UPDATE public.payments
SET status = 'FAILED', 
    updated_at = NOW(),
    metadata = jsonb_build_object('error', 'Payment timed out')
WHERE status = 'PENDING' 
AND created_at < NOW() - INTERVAL '1 hour';
```

## Implementation Checklist

- [ ] **Step 1: Verify and Create Token Transactions Table**
  - [ ] Run SQL to check if table exists
  - [ ] Create table if it doesn't exist
  - [ ] Add necessary indexes

- [ ] **Step 2: Update TokenRepository Implementation**
  - [ ] Replace current implementation with improved version
  - [ ] Add detailed error logging
  - [ ] Handle type conversion properly
  - [ ] Implement proper error handling for token transaction recording

- [ ] **Step 3: Update PaymentService with Retry Logic**
  - [ ] Add retry mechanism with exponential backoff
  - [ ] Improve error handling and logging
  - [ ] Update payment status on token addition failure

- [ ] **Step 4: Clean Up Database**
  - [ ] Update old pending payments to FAILED status

- [ ] **Step 5: Test the Implementation**
  - [ ] Test complete payment flow
  - [ ] Verify token balance updates
  - [ ] Check transaction recording
  - [ ] Test with both new and existing users

## Expected Results

After implementing these changes:

1. The token_transactions table will be properly created if it doesn't exist
2. Token addition will work correctly for both new and existing users
3. Detailed error logs will be available if issues occur
4. The payment flow will be more resilient with retry logic
5. The database will be in a consistent state with no lingering pending payments

These changes should resolve the "Unknown error" issue and ensure that tokens are properly added to user accounts after successful payments. 