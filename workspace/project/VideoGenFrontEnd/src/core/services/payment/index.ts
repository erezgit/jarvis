import { PaymentService } from './service';

/**
 * Singleton instance of the PaymentService
 * This is the preferred way to access the PaymentService
 */
export const paymentService = PaymentService.getInstance();

// Re-export the service class and types
export { PaymentService } from './service';
export * from './types'; 