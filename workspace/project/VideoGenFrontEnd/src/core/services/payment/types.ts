import type { ServiceResult } from '@/core/types/service';

// Payment-specific error codes
export enum PaymentErrorCode {
  INVALID_PACKAGE = 'payment/invalid-package',
  ORDER_NOT_FOUND = 'payment/order-not-found',
  PROCESSING_FAILED = 'payment/processing-failed',
  ALREADY_PROCESSED = 'payment/already-processed',
  INSUFFICIENT_BALANCE = 'token/insufficient-balance',
  NETWORK_ERROR = 'payment/network-error',
  RESPONSE_FORMAT_ERROR = 'payment/response-format-error',
  UNAUTHORIZED = 'payment/unauthorized',
  SERVER_ERROR = 'payment/server-error',
  PAYPAL_ERROR = 'payment/paypal-error'
}

// Service error interface
export interface PaymentServiceError extends Error {
  code: PaymentErrorCode;
  status?: number;
  details?: Record<string, unknown>;
}

// Token package definition
export interface TokenPackage {
  id: string;       // "basic", "standard", or "premium"
  name: string;     // Display name
  price: number;    // Price in USD
  tokens: number;   // Number of tokens
  rate: number;     // Tokens per dollar
  currency?: string; // Currency code (e.g., "USD")
  isPopular?: boolean;  // For "Most Popular" label
  isBestValue?: boolean; // For "Best Value" label
  discount?: number; // Amount discounted from regular price
}

// Payment status
export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

// Payment result from capturePayment
export interface PaymentResult {
  success: boolean;
  transactionId: string;
  status: PaymentStatus;
  tokens: number;
  newBalance: number;
  provider?: PaymentProvider;
}

// Payment history item
export interface PaymentHistoryItem {
  id: string;
  paymentProvider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tokensPurchased: number;
  packageId: string;
  createdAt: string;
}

// Token transaction types
export enum TokenTransactionType {
  PURCHASE = 'purchase',
  USAGE = 'usage',
  REFUND = 'refund',
  ADMIN_ADJUSTMENT = 'admin_adjustment',
  BONUS = 'bonus'
}

// Token transaction
export interface TokenTransaction {
  id: string;
  transactionType: TokenTransactionType | string;
  amount: number;
  balanceAfter: number;
  description: string;
  paymentId?: string | null;
  createdAt: string;
}

// Payment method
export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
  isDefault: boolean;
}

// Token balance response
export interface TokenBalanceResponse {
  balance: number;
}

// Token transactions response
export interface TokenTransactionsResponse {
  transactions: TokenTransaction[];
  total: number;
}

// Payment history response
export interface PaymentHistoryResponse {
  payments: PaymentHistoryItem[];
  total: number;
}

// Payment methods response
export interface PaymentMethodsResponse {
  methods: PaymentMethod[];
}

// Default token packages as defined in the implementation plan
export const DEFAULT_TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: 'basic',
    name: 'Basic Package',
    price: 10,
    tokens: 160,
    currency: 'USD',
    rate: 16, // 16 tokens per dollar
    discount: 0
  },
  {
    id: 'standard',
    name: 'Standard Package',
    price: 25,
    tokens: 425,
    currency: 'USD',
    isPopular: true,
    rate: 17, // 17 tokens per dollar (6.25% bonus)
    discount: 2.5 // $2.50 discount
  },
  {
    id: 'premium',
    name: 'Premium Package',
    price: 50,
    tokens: 900,
    currency: 'USD',
    isBestValue: true,
    rate: 18, // 18 tokens per dollar (12.5% bonus)
    discount: 10 // $10 discount
  }
];

// Payment provider enum
export enum PaymentProvider {
  MOCK = 'mock',
  PAYPAL = 'paypal'
}

// Create order request interface
export interface CreateOrderRequest {
  packageId: string;
  provider?: PaymentProvider;
}

// PayPal-specific capture request
export interface PayPalCaptureRequest {
  orderId: string;
}

// Payment service interface
export interface IPaymentService {
  createOrder(packageId: string, provider?: PaymentProvider): Promise<ServiceResult<string>>;
  capturePayment(orderId: string): Promise<ServiceResult<PaymentResult>>;
  capturePayPalPayment(orderId: string): Promise<ServiceResult<PaymentResult>>;
  getTokenBalance(): Promise<ServiceResult<TokenBalanceResponse>>;
  getTokenTransactions(limit?: number, offset?: number): Promise<ServiceResult<TokenTransactionsResponse>>;
  getPaymentHistory(limit?: number, offset?: number): Promise<ServiceResult<PaymentHistoryResponse>>;
  getPaymentMethods(): Promise<ServiceResult<PaymentMethodsResponse>>;
  addPaymentMethod(paymentMethodId: string): Promise<ServiceResult<PaymentMethod>>;
  removePaymentMethod(methodId: string): Promise<ServiceResult<void>>;
} 