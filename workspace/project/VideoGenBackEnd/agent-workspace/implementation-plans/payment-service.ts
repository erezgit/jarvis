import { ApiResponse } from '../types/api';
import { httpClient } from '../utils/httpClient';

/**
 * Payment provider types
 */
export type PaymentProvider = 'mock' | 'paypal';

/**
 * Token package interface
 */
export interface TokenPackage {
  id: string;
  name: string;
  price: number;
  tokens: number;
  description?: string;
  isPopular?: boolean;
}

/**
 * Payment result interface
 */
export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: string;
  tokens?: number;
  newBalance?: number;
}

/**
 * Create order response
 */
export interface CreateOrderResponse {
  orderId: string;
}

/**
 * Payment history item
 */
export interface PaymentHistoryItem {
  id: string;
  paymentProvider: string;
  paymentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: string;
  tokensPurchased: number;
  packageId: string;
  createdAt: string;
}

/**
 * Token balance response
 */
export interface TokenBalanceResponse {
  balance: number;
}

/**
 * Token transaction
 */
export interface TokenTransaction {
  id: string;
  transactionType: string;
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

/**
 * Payment Service
 * 
 * Handles all payment-related API calls including:
 * - Creating orders
 * - Capturing payments
 * - Retrieving payment history
 * - Managing token balance and transactions
 */
export class PaymentService {
  private static BASE_URL = '/api/payments';

  /**
   * Create a payment order
   * 
   * @param packageId - The ID of the token package to purchase
   * @param provider - The payment provider to use (default: 'mock')
   * @returns Promise with the order ID
   */
  public static async createOrder(
    packageId: string,
    provider: PaymentProvider = 'mock'
  ): Promise<CreateOrderResponse> {
    try {
      const response = await httpClient.post<ApiResponse<CreateOrderResponse>>(
        `${this.BASE_URL}/createOrder`,
        { packageId, provider }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to create order');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Create a PayPal-specific order
   * 
   * @param packageId - The ID of the token package to purchase
   * @returns Promise with the order ID
   */
  public static async createPayPalOrder(packageId: string): Promise<CreateOrderResponse> {
    try {
      const response = await httpClient.post<ApiResponse<CreateOrderResponse>>(
        `${this.BASE_URL}/paypal/createOrder`,
        { packageId }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to create PayPal order');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error creating PayPal order:', error);
      throw error;
    }
  }

  /**
   * Capture a payment
   * 
   * @param orderId - The order ID to capture
   * @returns Promise with the payment result
   */
  public static async capturePayment(orderId: string): Promise<PaymentResult> {
    try {
      const response = await httpClient.post<ApiResponse<PaymentResult>>(
        `${this.BASE_URL}/capturePayment`,
        { orderId }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to capture payment');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error capturing payment:', error);
      throw error;
    }
  }

  /**
   * Capture a PayPal payment
   * 
   * @param orderId - The PayPal order ID to capture
   * @returns Promise with the payment result
   */
  public static async capturePayPalPayment(orderId: string): Promise<PaymentResult> {
    try {
      const response = await httpClient.post<ApiResponse<PaymentResult>>(
        `${this.BASE_URL}/paypal/capturePayment`,
        { orderId }
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to capture PayPal payment');
      }
      
      return response.data.data!;
    } catch (error) {
      console.error('Error capturing PayPal payment:', error);
      throw error;
    }
  }

  /**
   * Get payment history
   * 
   * @param limit - Optional limit for number of items to return
   * @param offset - Optional offset for pagination
   * @returns Promise with payment history items
   */
  public static async getPaymentHistory(
    limit?: number,
    offset?: number
  ): Promise<PaymentHistoryItem[]> {
    try {
      let url = `${this.BASE_URL}/history`;
      const params = new URLSearchParams();
      
      if (limit !== undefined) {
        params.append('limit', limit.toString());
      }
      
      if (offset !== undefined) {
        params.append('offset', offset.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await httpClient.get<ApiResponse<PaymentHistoryItem[]>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get payment history');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      throw error;
    }
  }

  /**
   * Get token balance
   * 
   * @returns Promise with the current token balance
   */
  public static async getTokenBalance(): Promise<number> {
    try {
      const response = await httpClient.get<ApiResponse<TokenBalanceResponse>>(
        `${this.BASE_URL}/tokens/balance`
      );
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get token balance');
      }
      
      return response.data.data!.balance;
    } catch (error) {
      console.error('Error getting token balance:', error);
      throw error;
    }
  }

  /**
   * Get token transaction history
   * 
   * @param limit - Optional limit for number of transactions to return
   * @param offset - Optional offset for pagination
   * @returns Promise with token transactions
   */
  public static async getTokenTransactions(
    limit?: number,
    offset?: number
  ): Promise<TokenTransaction[]> {
    try {
      let url = `${this.BASE_URL}/tokens/transactions`;
      const params = new URLSearchParams();
      
      if (limit !== undefined) {
        params.append('limit', limit.toString());
      }
      
      if (offset !== undefined) {
        params.append('offset', offset.toString());
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await httpClient.get<ApiResponse<TokenTransaction[]>>(url);
      
      if (!response.data.success) {
        throw new Error(response.data.error?.message || 'Failed to get token transactions');
      }
      
      return response.data.data || [];
    } catch (error) {
      console.error('Error getting token transactions:', error);
      throw error;
    }
  }
}

export default PaymentService; 