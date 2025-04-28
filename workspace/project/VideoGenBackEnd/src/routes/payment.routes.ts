import { Router } from 'express';
import { container } from '../config/container';
import { PaymentService, PaymentProvider } from '../services/payment/service';
import { MockPaymentService } from '../services/payment/mock/client.service';
import { PayPalPaymentService } from '../services/payment/paypal/client.service';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../lib/server/logger';
import { TYPES } from '../lib/types';
import { TokenService } from '../services/token/service';

const router = Router();
const paymentService = container.resolve<PaymentService>(PaymentService);
const mockPaymentService = container.resolve<MockPaymentService>(MockPaymentService);
const paypalPaymentService = container.resolve<PayPalPaymentService>(TYPES.PayPalPaymentService);
const tokenService = container.resolve<TokenService>(TYPES.TokenService);

// Get payment methods for a user
router.get('/methods', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const methods = await paymentService.listPaymentMethods(userId);
    res.json({ methods });
  } catch (error) {
    next(error);
  }
});

// Add a new payment method
router.post('/methods', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { paymentMethodId } = req.body;
    const method = await paymentService.attachPaymentMethod(userId, paymentMethodId);
    res.status(201).json({ method });
  } catch (error) {
    next(error);
  }
});

// Remove a payment method
router.delete('/methods/:methodId', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { methodId } = req.params;
    await paymentService.detachPaymentMethod(userId, methodId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Process a payment
router.post('/process', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { amount, currency, paymentMethodId } = req.body;
    const payment = await paymentService.createPayment(userId, {
      amount,
      currency,
      paymentMethodId
    });
    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
});

// Mock payment endpoint for testing
router.post('/mock/process', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user!.id;
    const { amount, currency } = req.body;
    
    // Create a mock order first
    const orderId = await mockPaymentService.createOrder(amount, `Mock payment of ${amount} ${currency}`);
    
    // Then capture the payment
    const captureResult = await mockPaymentService.capturePayment(orderId);
    
    // Create a payment response
    const payment = {
      id: captureResult.transactionId,
      amount,
      currency,
      status: 'SUCCEEDED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      metadata: {
        userId,
        mock: true,
        orderId
      }
    };
    
    res.status(201).json({ payment });
  } catch (error) {
    next(error);
  }
});

/**
 * Create a payment order
 */
router.post('/createOrder', authenticateToken, async (req, res) => {
  try {
    const { packageId, provider = 'mock' } = req.body;
    const userId = req.user!.id;
    
    // Validate provider
    if (provider !== 'mock' && provider !== 'paypal') {
      return res.status(400).json({ error: 'Invalid payment provider' });
    }
    
    const result = await paymentService.createOrder(userId, packageId, provider as PaymentProvider);
    
    if (result.success) {
      return res.status(200).json({ orderId: result.data });
    } else {
      logger.error('Failed to create order', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in create order endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PayPal-specific endpoints
 */

/**
 * Create a PayPal order
 */
router.post('/paypal/createOrder', authenticateToken, async (req, res) => {
  try {
    const { packageId } = req.body;
    const userId = req.user!.id;
    
    const result = await paymentService.createOrder(userId, packageId, 'paypal');
    
    if (result.success) {
      return res.status(200).json({ orderId: result.data });
    } else {
      logger.error('Failed to create PayPal order', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in create PayPal order endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Capture a PayPal payment
 */
router.post('/paypal/capturePayment', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user!.id;
    
    const result = await paymentService.capturePayment(userId, orderId);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      logger.error('Failed to capture PayPal payment', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in capture PayPal payment endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Capture a payment
 */
router.post('/capturePayment', authenticateToken, async (req, res) => {
  try {
    const { orderId } = req.body;
    const userId = req.user!.id;
    
    const result = await paymentService.capturePayment(userId, orderId);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      logger.error('Failed to capture payment', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in capture payment endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get payment history
 */
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    
    const result = await paymentService.getPaymentHistory(userId, limit, offset);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      logger.error('Failed to get payment history', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in get payment history endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get token balance
 */
router.get('/tokens/balance', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    
    const result = await tokenService.getUserBalance(userId);
    
    if (result.success) {
      return res.status(200).json({ balance: result.data });
    } else {
      logger.error('Failed to get token balance', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in get token balance endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Get token transactions
 */
router.get('/tokens/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user!.id;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : undefined;
    
    const result = await tokenService.getTransactionHistory(userId, limit, offset);
    
    if (result.success) {
      return res.status(200).json(result.data);
    } else {
      logger.error('Failed to get token transactions', { error: result.error });
      return res.status(500).json({ error: result.error });
    }
  } catch (error) {
    logger.error('Unexpected error in get token transactions endpoint', { 
      error: error instanceof Error ? error.message : 'Unknown error' 
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router; 