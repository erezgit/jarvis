import { ServiceResult, DbResult } from '../../types';

export interface DbUserToken {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface DbTokenTransaction {
  id: string;
  user_id: string;
  transaction_type: TokenTransactionType;
  amount: number;
  balance_after: number;
  description: string;
  payment_id?: string;
  metadata?: any;
  created_at: string;
}

export enum TokenTransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
  REFUND = 'refund',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  BONUS = 'bonus'
}

export interface TokenTransaction {
  id: string;
  transactionType: TokenTransactionType;
  amount: number;
  balanceAfter: number;
  description: string;
  paymentId?: string;
  createdAt: string;
}

export interface ITokenRepository {
  getUserBalance(userId: string): Promise<DbResult<number>>;
  addTokens(userId: string, amount: number, description: string, paymentId?: string): Promise<DbResult<number>>;
  useTokens(userId: string, amount: number, description: string): Promise<DbResult<number>>;
  getTransactionHistory(userId: string, limit?: number, offset?: number): Promise<DbResult<DbTokenTransaction[]>>;
}

export interface ITokenService {
  getUserBalance(userId: string): Promise<ServiceResult<number>>;
  addTokens(userId: string, amount: number, description: string, paymentId?: string): Promise<ServiceResult<number>>;
  useTokens(userId: string, amount: number, description: string): Promise<ServiceResult<number>>;
  getTransactionHistory(userId: string, limit?: number, offset?: number): Promise<ServiceResult<TokenTransaction[]>>;
} 