import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { BaseService } from '../../lib/services/base.service';
import { ServiceResult } from '../../types';
import { ITokenService, TokenTransaction } from './types';
import { ITokenRepository } from './types';
import { InsufficientTokensError, TokenBalanceNotFoundError } from './errors';

@injectable()
export class TokenService extends BaseService implements ITokenService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.TokenRepository) private readonly repository: ITokenRepository
  ) {
    super(logger, 'TokenService');
  }

  async getUserBalance(userId: string): Promise<ServiceResult<number>> {
    try {
      this.logInfo('Getting user token balance', { userId });
      
      const result = await this.repository.getUserBalance(userId);
      
      if (result.error) {
        return {
          success: false,
          error: new TokenBalanceNotFoundError(userId)
        };
      }

      return {
        success: true,
        data: result.data || 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async addTokens(userId: string, amount: number, description: string, paymentId?: string): Promise<ServiceResult<number>> {
    try {
      this.logInfo('Adding tokens to user account', { userId, amount, paymentId });
      
      if (amount <= 0) {
        return {
          success: false,
          error: new Error('Token amount must be positive')
        };
      }

      const result = await this.repository.addTokens(userId, amount, description, paymentId);
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      this.logInfo('Tokens added successfully', { userId, amount, newBalance: result.data });
      
      return {
        success: true,
        data: result.data || 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async useTokens(userId: string, amount: number, description: string): Promise<ServiceResult<number>> {
    try {
      this.logInfo('Using tokens from user account', { userId, amount });
      
      if (amount <= 0) {
        return {
          success: false,
          error: new Error('Token amount must be positive')
        };
      }

      // Check if user has enough tokens
      const balanceResult = await this.getUserBalance(userId);
      
      if (!balanceResult.success) {
        return balanceResult;
      }

      const currentBalance = balanceResult.data || 0;
      
      if (currentBalance < amount) {
        return {
          success: false,
          error: new InsufficientTokensError(currentBalance, amount)
        };
      }

      const result = await this.repository.useTokens(userId, amount, description);
      
      if (result.error) {
        return {
          success: false,
          error: result.error
        };
      }

      this.logInfo('Tokens used successfully', { userId, amount, newBalance: result.data });
      
      return {
        success: true,
        data: result.data || 0
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getTransactionHistory(userId: string, limit?: number, offset?: number): Promise<ServiceResult<TokenTransaction[]>> {
    try {
      this.logInfo('Getting token transaction history', { userId, limit, offset });
      
      const result = await this.repository.getTransactionHistory(userId, limit, offset);
      
      if (result.error || !result.data) {
        return {
          success: false,
          error: result.error || new Error('Failed to get transaction history')
        };
      }

      const transactions = result.data.map(transaction => ({
        id: transaction.id,
        transactionType: transaction.transaction_type,
        amount: transaction.amount,
        balanceAfter: transaction.balance_after,
        description: transaction.description,
        paymentId: transaction.payment_id,
        createdAt: transaction.created_at
      }));

      return {
        success: true,
        data: transactions
      };
    } catch (error) {
      return this.handleError(error);
    }
  }
} 