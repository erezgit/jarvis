/**
 * PayPal Integration Test Script
 * 
 * This script tests the PayPal integration by creating an order and verifying
 * that the PayPal client is properly configured.
 * 
 * THIS IS A TEST SCRIPT AND SHOULD NOT BE RUN AS PART OF THE MAIN APPLICATION.
 * To run this script manually, use: npm run test:paypal
 */

console.log('=== Running PayPal integration test script (src/scripts/test-paypal-integration.ts) ===');

import 'reflect-metadata';
import 'dotenv/config';
import { container } from 'tsyringe';
import '../config/container';
import { PayPalPaymentService } from '../services/payment/paypal/client.service';
import { logger } from '../lib/server/logger';
import { config } from '../config';
import { TYPES } from '../lib/types';

// Check if this script is being run directly
const isRunningDirectly = require.main === module;

async function testPayPalIntegration() {
  console.log('🧪 Starting PayPal Integration Test');
  console.log('-----------------------------------');
  
  // Log environment
  console.log(`Environment: ${config.environment}`);
  console.log(`Using PayPal ${config.isProduction ? 'Production' : 'Sandbox'} environment`);
  
  // Check if PayPal is configured
  if (!config.paypal.isConfigured) {
    console.error('❌ PayPal is not properly configured. Check environment variables.');
    return;
  }
  
  console.log('✅ PayPal environment variables are configured');
  
  try {
    // Get PayPal client
    const paypalClient = container.resolve<PayPalPaymentService>(TYPES.PayPalPaymentService);
    
    // Test creating an order
    console.log('Creating test order...');
    const orderId = await paypalClient.createOrder(10.00, 'Test Order');
    
    console.log(`✅ Successfully created PayPal order: ${orderId}`);
    console.log('PayPal integration is working correctly!');
    
    // Note: We don't capture the payment in this test since that would require user interaction
    console.log('To complete the test, you would need to capture the payment, which requires user interaction.');
    console.log('This can be tested through the frontend integration.');
    
  } catch (error) {
    console.error('❌ PayPal integration test failed:');
    console.error(error);
  }
}

// Only run the test if this script is being run directly
if (isRunningDirectly) {
  testPayPalIntegration()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed with error:', error);
      process.exit(1);
    });
} else {
  console.log('PayPal integration test script loaded but not run (imported as a module).');
}

// Export the test function for use in other scripts
export { testPayPalIntegration }; 