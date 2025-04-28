import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/core/services/payment/service';
import type { TokenTransaction } from '@/core/services/payment/types';

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
}

/**
 * Hook to fetch and manage the user's token transaction history
 * @param options Configuration options for the hook
 * @returns Object containing transactions, total count, loading state, error, and refetch function
 */
export function useTransactionHistory({
  limit = 10,
  offset = 0,
  autoFetch = true
}: UseTransactionHistoryOptions = {}): UseTransactionHistoryResult {
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchTransactions = useCallback(async () => {
    console.log('useTransactionHistory - fetchTransactions called with:', { limit, offset });
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.getTokenTransactions(limit, offset);
      console.log('useTransactionHistory - API response:', result);
      
      if (result.data) {
        // Handle both response formats:
        // 1. {transactions: TokenTransaction[], total: number}
        // 2. TokenTransaction[] (array directly)
        if (Array.isArray(result.data)) {
          // API returned an array directly
          console.log('useTransactionHistory - API returned array format, setting transactions:', result.data);
          setTransactions(result.data);
          setTotal(result.data.length);
        } else if (result.data.transactions) {
          // API returned the expected object format
          console.log('useTransactionHistory - Setting transactions:', result.data.transactions);
          console.log('useTransactionHistory - Setting total:', result.data.total);
          setTransactions(result.data.transactions || []);
          setTotal(result.data.total || 0);
        } else {
          // Unexpected format
          console.error('useTransactionHistory - Unexpected data format:', result.data);
          setTransactions([]);
          setTotal(0);
          setError(new Error('Unexpected data format received from API'));
        }
      } else if (result.error) {
        console.error('useTransactionHistory - Error from API:', result.error);
        setError(result.error);
      }
    } catch (err) {
      console.error('useTransactionHistory - Exception caught:', err);
      setError(err instanceof Error ? err : new Error('Failed to load transaction history'));
    } finally {
      setLoading(false);
      console.log('useTransactionHistory - Loading set to false');
    }
  }, [limit, offset]);

  useEffect(() => {
    if (autoFetch) {
      console.log('useTransactionHistory - Auto-fetching transactions');
      fetchTransactions();
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

export default useTransactionHistory; 