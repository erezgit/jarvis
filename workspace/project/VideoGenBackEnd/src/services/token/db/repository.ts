import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../../lib/types';
import { BaseRepository } from '../../../lib/services/repository.base';
import { createServerSupabase } from '../../../lib/supabase/server';
import { DbResult } from '../../../lib/db/types';
import { DbTokenTransaction, DbUserToken, ITokenRepository, TokenTransactionType } from '../types';

@injectable()
export class TokenRepository extends BaseRepository implements ITokenRepository {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'TokenRepository');
  }

  async getUserBalance(userId: string): Promise<DbResult<number>> {
    return this.executeQuery('getUserBalance', async () => {
      const supabase = createServerSupabase();
      
      // Try to get the user's token balance
      const { data, error } = await supabase
        .from('user_tokens')
        .select('balance')
        .eq('user_id', userId)
        .single();

      if (error) {
        // If the user doesn't have a token balance yet, create one with 0 tokens
        if (error.code === 'PGRST116') { // No rows returned
          this.logger.info('[TokenRepository] No token balance found for user, creating new record', { userId });
          
          const { data: newData, error: createError } = await supabase
            .from('user_tokens')
            .insert({
              user_id: userId,
              balance: 0
            })
            .select('balance')
            .single();

          if (createError) {
            this.logger.error('[TokenRepository] Failed to create token balance record', {
              error: createError.message,
              code: createError.code,
              details: createError.details,
              userId
            });
            throw createError;
          }
          
          this.logger.info('[TokenRepository] Created new token balance record', { userId, balance: newData.balance });
          return newData.balance;
        }
        
        this.logger.error('[TokenRepository] Failed to get token balance', {
          error: error.message,
          code: error.code,
          details: error.details,
          userId
        });
        throw error;
      }

      // Ensure balance is treated as a number
      const balance = typeof data.balance === 'string' 
        ? parseInt(data.balance, 10) 
        : data.balance;
        
      this.logger.info('[TokenRepository] Retrieved token balance', { userId, balance });
      return balance;
    });
  }

  async addTokens(userId: string, amount: number, description: string, paymentId?: string): Promise<DbResult<number>> {
    return this.executeQuery('addTokens', async () => {
      const supabase = createServerSupabase();
      
      this.logger.info('[TokenRepository] Adding tokens', { 
        userId, 
        amount, 
        description,
        paymentId 
      });
      
      // First check if transaction already exists to prevent duplicates
      if (paymentId) {
        const { data: existingTx, error: txCheckError } = await supabase
          .from('token_transactions')
          .select('id')
          .eq('payment_id', paymentId)
          .eq('transaction_type', TokenTransactionType.PURCHASE)
          .maybeSingle();
          
        if (txCheckError) {
          this.logger.warn('[TokenRepository] Error checking for existing transaction', {
            error: txCheckError.message,
            code: txCheckError.code,
            details: txCheckError.details,
            paymentId
          });
          // Continue despite error checking for duplicates
        } else if (existingTx) {
          this.logger.warn('[TokenRepository] Transaction already exists for this payment', {
            paymentId,
            transactionId: existingTx.id
          });
          
          // Get current balance and return it
          const { data: userData, error: userError } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', userId)
            .single();
            
          if (userError) {
            this.logger.error('[TokenRepository] Failed to get user balance after duplicate transaction check', {
              error: userError.message,
              code: userError.code,
              details: userError.details,
              userId
            });
            throw userError;
          }
          
          return userData.balance;
        }
      }
      
      // Use individual operations instead of a transaction for better error handling
      try {
        // Get current balance or create if not exists
        let currentBalance = 0;
        const { data: userData, error: userError } = await supabase
          .from('user_tokens')
          .select('balance')
          .eq('user_id', userId)
          .single();
        
        if (userError) {
          if (userError.code === 'PGRST116') { // No rows returned
            this.logger.info('[TokenRepository] No token balance found for user, creating new record', { userId, initialBalance: amount });
            
            // Create new user token record
            const { data: newUserData, error: createError } = await supabase
              .from('user_tokens')
              .insert({
                user_id: userId,
                balance: amount
              })
              .select('balance')
              .single();
            
            if (createError) {
              this.logger.error('[TokenRepository] Failed to create token balance record', {
                error: createError.message,
                code: createError.code,
                details: createError.details,
                userId,
                amount
              });
              throw createError;
            }
            
            currentBalance = newUserData.balance;
            this.logger.info('[TokenRepository] Created new token balance record', { userId, balance: currentBalance });
          } else {
            this.logger.error('[TokenRepository] Failed to get token balance', {
              error: userError.message,
              code: userError.code,
              details: userError.details,
              userId
            });
            throw userError;
          }
        } else {
          // Ensure balance is treated as a number
          const existingBalance = typeof userData.balance === 'string' 
            ? parseInt(userData.balance, 10) 
            : userData.balance;
            
          // Update existing balance
          const newBalance = existingBalance + amount;
          
          this.logger.info('[TokenRepository] Updating existing balance', {
            userId,
            currentBalance: existingBalance,
            amount,
            newBalance
          });
          
          const { error: updateError } = await supabase
            .from('user_tokens')
            .update({
              balance: newBalance,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', userId);
          
          if (updateError) {
            this.logger.error('[TokenRepository] Failed to update token balance', {
              error: updateError.message,
              code: updateError.code,
              details: updateError.details,
              userId,
              currentBalance: existingBalance,
              amount,
              newBalance
            });
            throw updateError;
          }
          
          currentBalance = newBalance;
          this.logger.info('[TokenRepository] Updated token balance', { userId, newBalance: currentBalance });
        }
        
        // Record the transaction
        this.logger.info('[TokenRepository] Recording token transaction', {
          userId,
          amount,
          transactionType: TokenTransactionType.PURCHASE,
          description,
          paymentId,
          balanceAfter: currentBalance
        });
        
        try {
          const { error: transactionError } = await supabase
            .from('token_transactions')
            .insert({
              user_id: userId,
              transaction_type: TokenTransactionType.PURCHASE,
              amount: amount,
              balance_after: currentBalance,
              description: description,
              payment_id: paymentId
            });
          
          if (transactionError) {
            this.logger.error('[TokenRepository] Failed to record token transaction', {
              error: transactionError.message,
              code: transactionError.code,
              details: transactionError.details,
              userId,
              amount,
              paymentId
            });
            // Continue despite transaction recording error
            // We don't want to fail the whole operation if just the transaction record fails
          } else {
            this.logger.info('[TokenRepository] Token transaction recorded successfully', {
              userId,
              amount,
              balanceAfter: currentBalance
            });
          }
        } catch (txError) {
          this.logger.error('[TokenRepository] Exception recording token transaction', {
            error: txError instanceof Error ? txError.message : 'Unknown error',
            stack: txError instanceof Error ? txError.stack : undefined,
            userId,
            amount,
            paymentId
          });
          // Continue despite transaction recording error
        }
        
        return currentBalance;
      } catch (error) {
        this.logger.error('[TokenRepository] addTokens failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          userId,
          amount,
          paymentId
        });
        throw error;
      }
    });
  }

  async useTokens(userId: string, amount: number, description: string): Promise<DbResult<number>> {
    return this.executeQuery('useTokens', async () => {
      const supabase = createServerSupabase();
      
      this.logger.info('[TokenRepository] Using tokens', { 
        userId, 
        amount, 
        description 
      });
      
      try {
        // Get current balance
        const { data: userData, error: userError } = await supabase
          .from('user_tokens')
          .select('balance')
          .eq('user_id', userId)
          .single();
        
        if (userError) {
          this.logger.error('[TokenRepository] Failed to get token balance', {
            error: userError.message,
            code: userError.code,
            details: userError.details,
            userId
          });
          throw userError;
        }
        
        // Ensure balance is treated as a number
        const currentBalance = typeof userData.balance === 'string' 
          ? parseInt(userData.balance, 10) 
          : userData.balance;
        
        // Check if user has enough tokens
        if (currentBalance < amount) {
          this.logger.warn('[TokenRepository] Insufficient token balance', {
            userId,
            currentBalance,
            requestedAmount: amount
          });
          throw new Error(`Insufficient tokens: ${currentBalance} available, ${amount} required`);
        }
        
        // Update balance
        const newBalance = currentBalance - amount;
        
        this.logger.info('[TokenRepository] Updating token balance', {
          userId,
          currentBalance,
          amount,
          newBalance
        });
        
        const { error: updateError } = await supabase
          .from('user_tokens')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
        
        if (updateError) {
          this.logger.error('[TokenRepository] Failed to update token balance', {
            error: updateError.message,
            code: updateError.code,
            details: updateError.details,
            userId,
            amount
          });
          throw updateError;
        }
        
        // Record the transaction
        this.logger.info('[TokenRepository] Recording token usage transaction', {
          userId,
          amount,
          transactionType: TokenTransactionType.USAGE,
          description,
          balanceAfter: newBalance
        });
        
        try {
          const { error: transactionError } = await supabase
            .from('token_transactions')
            .insert({
              user_id: userId,
              transaction_type: TokenTransactionType.USAGE,
              amount: -amount, // Negative amount for usage
              balance_after: newBalance,
              description: description
            });
          
          if (transactionError) {
            this.logger.error('[TokenRepository] Failed to record token usage transaction', {
              error: transactionError.message,
              code: transactionError.code,
              details: transactionError.details,
              userId,
              amount
            });
            // Continue despite transaction recording error
          } else {
            this.logger.info('[TokenRepository] Token usage transaction recorded successfully', {
              userId,
              amount,
              balanceAfter: newBalance
            });
          }
        } catch (txError) {
          this.logger.error('[TokenRepository] Exception recording token usage transaction', {
            error: txError instanceof Error ? txError.message : 'Unknown error',
            stack: txError instanceof Error ? txError.stack : undefined,
            userId,
            amount
          });
          // Continue despite transaction recording error
        }
        
        return newBalance;
      } catch (error) {
        this.logger.error('[TokenRepository] useTokens failed', {
          error: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined,
          userId,
          amount
        });
        throw error;
      }
    });
  }

  async getTransactionHistory(userId: string, limit?: number, offset?: number): Promise<DbResult<DbTokenTransaction[]>> {
    return this.executeQuery('getTransactionHistory', async () => {
      const supabase = createServerSupabase();
      
      this.logger.info('[TokenRepository] Getting transaction history', { 
        userId, 
        limit, 
        offset 
      });
      
      let query = supabase
        .from('token_transactions')
        .select()
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (limit) {
        query = query.limit(limit);
      }
      
      if (offset) {
        query = query.range(offset, offset + (limit || 10) - 1);
      }
      
      const { data, error, count } = await query;
      
      if (error) {
        this.logger.error('[TokenRepository] Failed to get transaction history', {
          error: error.message,
          code: error.code,
          details: error.details,
          userId
        });
        throw error;
      }
      
      this.logger.info('[TokenRepository] Retrieved transaction history', { 
        userId, 
        count: data?.length || 0 
      });
      
      return data as DbTokenTransaction[];
    });
  }
} 