import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { BaseService } from '../../lib/services/base.service';
import { ServiceResult } from '../../types';
import { IPaymentService, PaymentResult, PaymentResponse, PaymentStatus, TOKEN_PACKAGES, PaymentMethod, PaymentIntent } from './types';
import { MockPaymentService } from './mock/client.service';
import { PayPalPaymentService } from './paypal/client.service';
import { IPaymentRepository } from './types';
import { ITokenService } from '../token/types';
import { InvalidPackageError, PaymentNotFoundError, PaymentProcessingError } from './errors';

// Payment provider types
export type PaymentProvider = 'mock' | 'paypal';

@injectable()
export class PaymentService extends BaseService implements IPaymentService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger,
    @inject(TYPES.MockPaymentService) private readonly mockPaymentClient: MockPaymentService,
    @inject(TYPES.PayPalPaymentService) private readonly paypalPaymentClient: PayPalPaymentService,
    @inject(TYPES.TokenService) private readonly tokenService: ITokenService,
    @inject(TYPES.PaymentRepository) private readonly repository: IPaymentRepository
  ) {
    super(logger, 'PaymentService');
  }

  async createOrder(userId: string, packageId: string, provider: PaymentProvider = 'mock'): Promise<ServiceResult<string>> {
    try {
      this.logInfo('Creating order', { userId, packageId, provider });
      
      // Get package details
      const packageDetails = TOKEN_PACKAGES[packageId];
      if (!packageDetails) {
        return {
          success: false,
          error: new InvalidPackageError(packageId)
        };
      }

      // Create order with the selected payment provider
      let orderId: string;
      if (provider === 'paypal') {
        orderId = await this.paypalPaymentClient.createOrder(
          packageDetails.price,
          `Purchase of ${packageDetails.tokens} tokens`
        );
      } else {
        // Default to mock payment
        orderId = await this.mockPaymentClient.createOrder(
          packageDetails.price,
          `Purchase of ${packageDetails.tokens} tokens`
        );
      }

      // Create payment record in pending state
      await this.repository.createPayment({
        userId,
        paymentProvider: provider,
        paymentId: 'pending',
        orderId,
        amount: packageDetails.price,
        currency: 'USD',
        status: PaymentStatus.PENDING,
        tokensPurchased: packageDetails.tokens,
        packageId
      });

      this.logInfo('Order created successfully', { userId, packageId, provider, orderId });
      
      return {
        success: true,
        data: orderId
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async capturePayment(userId: string, orderId: string): Promise<ServiceResult<PaymentResult>> {
    try {
      this.logInfo('Capturing payment', { userId, orderId });
      
      // Get payment record
      const paymentResult = await this.repository.getPaymentByOrderId(orderId);
      if (paymentResult.error || !paymentResult.data) {
        return {
          success: false,
          error: new PaymentNotFoundError(orderId)
        };
      }

      const payment = paymentResult.data;
      const provider = payment.payment_provider as PaymentProvider;

      // Capture payment with the appropriate provider
      let captureResult: { success: boolean, transactionId: string };
      if (provider === 'paypal') {
        captureResult = await this.paypalPaymentClient.capturePayment(orderId);
      } else {
        // Default to mock payment
        captureResult = await this.mockPaymentClient.capturePayment(orderId);
      }
      
      if (captureResult.success) {
        // Update payment status
        await this.repository.updatePaymentStatus(
          payment.id,
          PaymentStatus.SUCCEEDED,
          { transactionId: captureResult.transactionId }
        );

        // Add tokens to user's balance with retry logic
        const MAX_RETRIES = 3;
        let retryCount = 0;
        let tokenResult;
        let lastError;

        while (retryCount < MAX_RETRIES) {
          try {
            this.logInfo(`Adding tokens to user account (attempt ${retryCount + 1}/${MAX_RETRIES})`, {
              userId,
              tokens: payment.tokens_purchased,
              paymentId: payment.id,
              orderId
            });

            tokenResult = await this.tokenService.addTokens(
              userId,
              payment.tokens_purchased,
              `Purchase via ${provider} payment ${captureResult.transactionId}`,
              payment.id
            );

            if (tokenResult.success) {
              break;
            }

            lastError = tokenResult.error;
            this.logInfo(`Token addition failed, retrying (${retryCount + 1}/${MAX_RETRIES})`, {
              userId,
              orderId,
              error: lastError,
              attempt: retryCount + 1
            });
          } catch (error) {
            lastError = error;
            this.logError(`Exception during token addition, retrying (${retryCount + 1}/${MAX_RETRIES})`, {
              userId,
              orderId,
              error: error instanceof Error ? error.message : 'Unknown error',
              stack: error instanceof Error ? error.stack : undefined,
              attempt: retryCount + 1
            });
          }

          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
          retryCount++;
        }

        // Check if token addition was successful after retries
        if (!tokenResult || !tokenResult.success) {
          this.logError('Failed to add tokens after multiple retries', {
            userId,
            orderId,
            error: lastError,
            attempts: retryCount
          });

          // Update payment status to reflect the token addition failure
          await this.repository.updatePaymentStatus(
            payment.id,
            PaymentStatus.FAILED,
            {
              error: 'Token addition failed after multiple retries',
              transactionId: captureResult.transactionId
            }
          );

          return {
            success: false,
            error: new PaymentProcessingError('Failed to add tokens to user account after multiple attempts')
          };
        }

        this.logInfo('Payment captured successfully', { 
          userId, 
          orderId, 
          provider,
          transactionId: captureResult.transactionId,
          tokens: payment.tokens_purchased,
          newBalance: tokenResult.data
        });
        
        return {
          success: true,
          data: {
            success: true,
            transactionId: captureResult.transactionId,
            status: PaymentStatus.SUCCEEDED,
            tokens: payment.tokens_purchased,
            newBalance: tokenResult.data
          }
        };
      } else {
        // Payment capture failed
        await this.repository.updatePaymentStatus(
          payment.id,
          PaymentStatus.FAILED
        );

        return {
          success: false,
          error: new PaymentProcessingError('Payment capture failed')
        };
      }
    } catch (error) {
      return this.handleError(error);
    }
  }

  async getPaymentHistory(userId: string, limit?: number, offset?: number): Promise<ServiceResult<PaymentResponse[]>> {
    try {
      this.logInfo('Getting payment history', { userId, limit, offset });
      
      const result = await this.repository.getUserPayments(userId, limit, offset);
      
      if (result.error || !result.data) {
        return {
          success: false,
          error: result.error || new Error('Failed to get payment history')
        };
      }

      const payments = result.data.map(payment => ({
        id: payment.id,
        paymentProvider: payment.payment_provider,
        paymentId: payment.payment_id,
        orderId: payment.order_id,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        tokensPurchased: payment.tokens_purchased,
        packageId: payment.package_id,
        createdAt: payment.created_at
      }));

      return {
        success: true,
        data: payments
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  async listPaymentMethods(userId: string): Promise<PaymentMethod[]> {
    // Implementation needed
    this.logInfo('Listing payment methods', { userId });
    return [];
  }

  async attachPaymentMethod(userId: string, paymentMethodId: string): Promise<PaymentMethod> {
    // Implementation needed
    this.logInfo('Attaching payment method', { userId, paymentMethodId });
    throw new Error('Method not implemented');
  }

  async detachPaymentMethod(userId: string, paymentMethodId: string): Promise<void> {
    // Implementation needed
    this.logInfo('Detaching payment method', { userId, paymentMethodId });
    throw new Error('Method not implemented');
  }

  async createPayment(userId: string, params: {
    amount: number;
    currency: string;
    paymentMethodId: string;
  }): Promise<PaymentIntent> {
    // Implementation needed
    this.logInfo('Creating payment', { userId, params });
    throw new Error('Method not implemented');
  }
} 