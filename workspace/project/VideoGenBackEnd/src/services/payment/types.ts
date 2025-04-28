import { ServiceResult, DbResult } from '../../types';

export interface DbPayment {
  id: string;
  user_id: string;
  payment_provider: string;
  payment_id: string;
  order_id?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tokens_purchased: number;
  package_id: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export interface PaymentResponse {
  id: string;
  paymentProvider: string;
  paymentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tokensPurchased: number;
  packageId: string;
  createdAt: string;
}

export interface CreatePaymentParams {
  userId: string;
  paymentProvider: string;
  paymentId: string;
  orderId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  tokensPurchased: number;
  packageId: string;
  metadata?: any;
}

export interface IPaymentRepository {
  createPayment(payment: CreatePaymentParams): Promise<DbResult<DbPayment>>;
  updatePaymentStatus(paymentId: string, status: PaymentStatus, metadata?: any): Promise<DbResult<DbPayment>>;
  getPaymentByOrderId(orderId: string): Promise<DbResult<DbPayment>>;
  getUserPayments(userId: string, limit?: number, offset?: number): Promise<DbResult<DbPayment[]>>;
}

export interface IPaymentService {
  createOrder(userId: string, packageId: string): Promise<ServiceResult<string>>;
  capturePayment(userId: string, orderId: string): Promise<ServiceResult<PaymentResult>>;
  getPaymentHistory(userId: string, limit?: number, offset?: number): Promise<ServiceResult<PaymentResponse[]>>;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status: PaymentStatus;
  tokens?: number;
  newBalance?: number;
}

export interface TokenPackage {
  id: string;
  name: string;
  price: number;
  tokens: number;
  description?: string;
  isPopular?: boolean;
}

export const TOKEN_PACKAGES: Record<string, TokenPackage> = {
  'basic': {
    id: 'basic',
    name: 'Basic Package',
    price: 10,
    tokens: 160,
    description: '16 tokens per dollar'
  },
  'standard': {
    id: 'standard',
    name: 'Standard Package',
    price: 25,
    tokens: 425,
    description: '17 tokens per dollar (6.25% bonus)',
    isPopular: true
  },
  'premium': {
    id: 'premium',
    name: 'Premium Package',
    price: 50,
    tokens: 900,
    description: '18 tokens per dollar (12.5% bonus)'
  }
};

export interface PaymentMethod {
  id: string;
  type: string;
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
}

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethodId?: string;
  createdAt: Date;
  updatedAt: Date;
  metadata?: Record<string, any>;
} 