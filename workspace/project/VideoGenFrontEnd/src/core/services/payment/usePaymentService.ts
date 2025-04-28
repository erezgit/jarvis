import { useMemo } from 'react';
import { PaymentService } from './service';

/**
 * React hook that provides access to the PaymentService instance
 * @returns The singleton PaymentService instance
 */
export function usePaymentService() {
  const paymentService = useMemo(() => PaymentService.getInstance(), []);
  return paymentService;
}

export default usePaymentService; 