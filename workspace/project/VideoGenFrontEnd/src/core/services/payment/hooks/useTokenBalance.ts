import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '..';
import type { TokenBalanceResponse } from '../types';

interface UseTokenBalanceResult {
  balance: number | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook to fetch and manage the user's token balance
 * @returns Object containing balance, loading state, error, and refetch function
 */
export function useTokenBalance(): UseTokenBalanceResult {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.getTokenBalance();
      
      if (result.data) {
        setBalance(result.data.balance);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load token balance'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  };
}

/**
 * Hook to fetch and manage the user's token balance with automatic refresh
 * @param refreshInterval Interval in milliseconds to refresh the balance
 * @returns Object containing balance, loading state, error, and refetch function
 */
export function useTokenBalanceWithRefresh(refreshInterval = 30000): UseTokenBalanceResult {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.getTokenBalance();
      
      if (result.data) {
        setBalance(result.data.balance);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load token balance'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBalance();
    
    // Set up automatic refresh
    const intervalId = setInterval(() => {
      fetchBalance();
    }, refreshInterval);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [fetchBalance, refreshInterval]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance
  };
} 