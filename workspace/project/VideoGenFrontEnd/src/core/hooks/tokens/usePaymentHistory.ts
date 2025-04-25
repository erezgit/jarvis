import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '@/core/services/payment/service';
import type { PaymentHistoryItem } from '@/core/services/payment/types';

interface UsePaymentHistoryResult {
  payments: PaymentHistoryItem[];
  total: number;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

interface UsePaymentHistoryOptions {
  limit?: number;
  offset?: number;
  autoFetch?: boolean;
}

/**
 * Hook to fetch and manage the user's payment history
 * @param options Configuration options for the hook
 * @returns Object containing payments, total count, loading state, error, and refetch function
 */
export function usePaymentHistory({
  limit = 10,
  offset = 0,
  autoFetch = true
}: UsePaymentHistoryOptions = {}): UsePaymentHistoryResult {
  const [payments, setPayments] = useState<PaymentHistoryItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(autoFetch);
  const [error, setError] = useState<Error | null>(null);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await paymentService.getPaymentHistory(limit, offset);
      
      if (result.data) {
        setPayments(result.data.payments);
        setTotal(result.data.total);
      } else if (result.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load payment history'));
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments();
    }
  }, [fetchPayments, autoFetch]);

  return {
    payments,
    total,
    loading,
    error,
    refetch: fetchPayments
  };
}

export default usePaymentHistory; 