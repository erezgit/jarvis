// Add module declaration to fix TypeScript error
// @ts-ignore
import checkoutNodeJssdk from '@paypal/checkout-server-sdk';
import { injectable } from 'tsyringe';
import { logger } from '../../../lib/server/logger';
import { config } from '../../../config';

@injectable()
export class PayPalPaymentService {
  private client: any; // Use any type to avoid TypeScript errors

  constructor() {
    // Initialize PayPal environment
    const environment = config.isProduction
      ? new checkoutNodeJssdk.core.LiveEnvironment(
          config.paypal.production.clientId,
          config.paypal.production.clientSecret
        )
      : new checkoutNodeJssdk.core.SandboxEnvironment(
          config.paypal.sandbox.clientId,
          config.paypal.sandbox.clientSecret
        );

    this.client = new checkoutNodeJssdk.core.PayPalHttpClient(environment);
    
    // Log initialization status
    logger.info('PayPal payment service initialized', {
      environment: config.isProduction ? 'production' : 'sandbox',
      isConfigured: config.paypal.isConfigured
    });
  }

  async createOrder(amount: number, description: string): Promise<string> {
    logger.info('Creating PayPal order', { amount, description });

    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    request.prefer('return=representation');
    request.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'USD',
          value: amount.toString()
        },
        description
      }]
    });

    try {
      const response = await this.client.execute(request);
      logger.info('PayPal order created', { orderId: response.result.id });
      return response.result.id;
    } catch (error) {
      logger.error('Failed to create PayPal order', { error });
      throw error;
    }
  }

  async capturePayment(orderId: string): Promise<{ success: boolean, transactionId: string }> {
    logger.info('Capturing PayPal payment', { orderId });

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderId);
    request.prefer('return=representation');

    try {
      const response = await this.client.execute(request);
      const captureId = response.result.purchase_units[0].payments.captures[0].id;
      
      logger.info('Successfully captured PayPal payment', { 
        orderId, 
        captureId,
        status: response.result.status
      });
      
      return { 
        success: response.result.status === 'COMPLETED', 
        transactionId: captureId
      };
    } catch (error) {
      logger.error('Failed to capture PayPal payment', { error, orderId });
      throw error;
    }
  }
} 