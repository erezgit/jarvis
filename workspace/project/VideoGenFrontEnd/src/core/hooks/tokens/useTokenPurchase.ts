import { useState, useCallback, useMemo } from 'react';
import { PaymentService } from '@/core/services/payment/service';
import type { PaymentResult, PaymentServiceError } from '@/core/services/payment/types';
import type { ServiceResult } from '@/core/types/service';

export interface TokenPurchaseOptions {
  onSuccess?: (result: PaymentResult) => void;
  onError?: (error: PaymentServiceError) => void;
}

/**
 * Hook for token purchase functionality
 * 
 * @param options Configuration options
 * @returns Methods and state for token purchase
 */
export function useTokenPurchase(options?: TokenPurchaseOptions) {
  const paymentService = useMemo(() => PaymentService.getInstance(), []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<PaymentServiceError | null>(null);
  const [result, setResult] = useState<PaymentResult | null>(null);
  
  /**
   * Purchase tokens with the specified package ID
   * 
   * @param packageId The ID of the token package to purchase
   * @returns Result of the purchase operation
   */
  const purchaseTokens = useCallback(async (packageId: string): Promise<ServiceResult<PaymentResult>> => {
    setLoading(true);
    setError(null);
    setResult(null);
    
    try {
      // Step 1: Create the order
      const orderResult = await paymentService.createOrder(packageId);
      
      if (orderResult.error) {
        setError(orderResult.error as PaymentServiceError);
        setLoading(false);
        options?.onError?.(orderResult.error as PaymentServiceError);
        return { data: null, error: orderResult.error };
      }
      
      // Step 2: Capture the payment
      const captureResult = await paymentService.capturePayment(orderResult.data!);
      
      setLoading(false);
      
      if (captureResult.error) {
        setError(captureResult.error as PaymentServiceError);
        options?.onError?.(captureResult.error as PaymentServiceError);
        return { data: null, error: captureResult.error };
      }
      
      // Success
      setResult(captureResult.data);
      options?.onSuccess?.(captureResult.data!);
      return { data: captureResult.data, error: null };
    } catch (error) {
      setLoading(false);
      const serviceError = error instanceof Error 
        ? Object.assign(error, { code: 'payment/unknown-error' }) as PaymentServiceError
        : new Error('Unknown error') as PaymentServiceError;
      
      setError(serviceError);
      options?.onError?.(serviceError);
      return { data: null, error: serviceError };
    }
  }, [paymentService, options]);
  
  return {
    purchaseTokens,
    loading,
    error,
    result
  };
} 