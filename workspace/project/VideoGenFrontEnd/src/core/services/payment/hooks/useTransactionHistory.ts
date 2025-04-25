import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '..';
import type { TokenTransaction, TokenTransactionType } from '../types';

interface UseTransactionHistoryResult {
  transactions: TokenTransaction[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UseTransactionHistoryOptions {
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
  transactionType?: TokenTransactionType | string;
}

/**
 * Hook to fetch and manage the user's token transaction history
 * @param options Configuration options for the hook
 * @returns Object containing transactions, total count, loading state, error, and refetch function
 */
export function useTransactionHistory({
  limit = 10,
  offset = 0,
  autoFetch = true,
  transactionType
}: UseTransactionHistoryOptions = {}): UseTransactionHistoryResult {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Validate input parameters
      const validLimit = Math.max(1, Math.min(100, limit || 10)); // Ensure limit is between 1 and 100
      const validOffset = Math.max(0, offset || 0); // Ensure offset is non-negative
      
      const result = await paymentService.getTokenTransactions(validLimit, validOffset);
      
      if (result.data) {
        // Extract transactions from the response with safety checks
        const fetchedTransactions = Array.isArray(result.data.transactions) 
          ? result.data.transactions 
          : [];
        
        // Filter by transaction type if specified
        const filteredTransactions = transactionType && typeof transactionType === 'string'
          ? fetchedTransactions.filter(t => t && t.transactionType === transactionType)
          : fetchedTransactions;
        
        // Apply defensive rendering - ensure all transactions have required properties
        const safeTransactions = filteredTransactions
          .filter(transaction => transaction !== null && transaction !== undefined)
          .map(transaction => ({
            id: transaction.id || '',
            transactionType: transaction.transactionType || 'unknown',
            amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
            balanceAfter: typeof transaction.balanceAfter === 'number' ? transaction.balanceAfter : 0,
            description: transaction.description || '',
            paymentId: transaction.paymentId || null,
            createdAt: transaction.createdAt || new Date().toISOString()
          }));
        
        setTransactions(safeTransactions);
        setTotal(typeof result.data.total === 'number' ? result.data.total : safeTransactions.length);
      } else if (result.error) {
        console.error('Error fetching transaction history:', result.error);
        setError(result.error);
        // Set empty transactions array on error to avoid undefined issues
        setTransactions([]);
      }
    } catch (err) {
      console.error('Exception caught while fetching transaction history:', err);
      setError(err instanceof Error ? err : new Error('Failed to load transaction history'));
      // Set empty transactions array on error to avoid undefined issues
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  }, [limit, offset, transactionType]);

  useEffect(() => {
    if (autoFetch) {
      fetchTransactions().catch(err => {
        console.error('Error in auto-fetch of transaction history:', err);
        // Set error state if auto-fetch fails
        setError(err instanceof Error ? err : new Error('Failed to auto-fetch transaction history'));
        setLoading(false);
      });
    }
  }, [fetchTransactions, autoFetch]);

  return {
    transactions,
    total,
    loading,
    error,
    refetch: fetchTransactions
  };
} 