import { useState, useEffect, useCallback } from 'react';
import { paymentService } from '..';
import type { PaymentHistoryItem, PaymentStatus } from '../types';

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
      // Validate input parameters
      const validLimit = Math.max(1, Math.min(100, limit || 10)); // Ensure limit is between 1 and 100
      const validOffset = Math.max(0, offset || 0); // Ensure offset is non-negative
      
      const result = await paymentService.getPaymentHistory(validLimit, validOffset);
      
      if (result.data) {
        // Check if we're dealing with the mock data (which is an array directly)
        if (Array.isArray(result.data)) {
          const safePayments = result.data
            .filter(payment => payment !== null && payment !== undefined)
            .map(payment => ({
              id: payment.id || '',
              paymentProvider: payment.paymentProvider || 'Unknown',
              amount: typeof payment.amount === 'number' ? payment.amount : 0,
              currency: payment.currency || 'USD',
              status: (payment.status || 'PENDING') as PaymentStatus,
              tokensPurchased: typeof payment.tokensPurchased === 'number' ? payment.tokensPurchased : 0,
              packageId: payment.packageId || 'unknown',
              createdAt: payment.createdAt || new Date().toISOString()
            }));
          
          setPayments(safePayments);
          setTotal(safePayments.length);
          return;
        }
        
        // Extract payments from the response with safety checks
        const fetchedPayments = Array.isArray(result.data.payments) 
          ? result.data.payments 
          : [];
        
        // Apply defensive rendering - ensure all payments have required properties
        const safePayments = fetchedPayments
          .filter(payment => payment !== null && payment !== undefined)
          .map(payment => ({
            id: payment.id || '',
            paymentProvider: payment.paymentProvider || 'Unknown',
            amount: typeof payment.amount === 'number' ? payment.amount : 0,
            currency: payment.currency || 'USD',
            status: (payment.status || 'PENDING') as PaymentStatus,
            tokensPurchased: typeof payment.tokensPurchased === 'number' ? payment.tokensPurchased : 0,
            packageId: payment.packageId || 'unknown',
            createdAt: payment.createdAt || new Date().toISOString()
          }));
        
        setPayments(safePayments);
        setTotal(typeof result.data.total === 'number' ? result.data.total : safePayments.length);
      } else if (result.error) {
        console.error('Error fetching payment history:', result.error);
        setError(result.error);
        // Set empty payments array on error to avoid undefined issues
        setPayments([]);
      }
    } catch (err) {
      console.error('Exception caught while fetching payment history:', err);
      setError(err instanceof Error ? err : new Error('Failed to load payment history'));
      // Set empty payments array on error to avoid undefined issues
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [limit, offset]);

  useEffect(() => {
    if (autoFetch) {
      fetchPayments().catch(err => {
        console.error('Error in auto-fetch of payment history:', err);
        // Set error state if auto-fetch fails
        setError(err instanceof Error ? err : new Error('Failed to auto-fetch payment history'));
        setLoading(false);
      });
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