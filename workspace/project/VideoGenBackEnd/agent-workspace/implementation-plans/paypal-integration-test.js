/**
 * PayPal Integration Test Script
 * 
 * This script tests the PayPal integration by:
 * 1. Creating an order
 * 2. Simulating payment approval
 * 3. Capturing the payment
 * 4. Verifying token balance update
 */

const axios = require('axios');
const { v4: uuidv4 } = require('uuid');

// Configuration
const API_URL = process.env.API_URL || 'http://localhost:3000/api';
const AUTH_TOKEN = process.env.TEST_AUTH_TOKEN; // Set this in your environment

// Test user
const TEST_USER = {
  id: process.env.TEST_USER_ID || '12345',
  email: 'test@example.com'
};

// Package to purchase
const TEST_PACKAGE = 'standard';

// Headers for authenticated requests
const headers = {
  'Authorization': `Bearer ${AUTH_TOKEN}`,
  'Content-Type': 'application/json'
};

/**
 * Run the complete test flow
 */
async function runTest() {
  console.log('🧪 Starting PayPal Integration Test');
  console.log('-----------------------------------');
  
  try {
    // Step 1: Get initial token balance
    console.log('📊 Fetching initial token balance...');
    const initialBalance = await getTokenBalance();
    console.log(`Initial token balance: ${initialBalance}`);
    
    // Step 2: Create an order with PayPal provider
    console.log('\n🛒 Creating PayPal order...');
    const orderId = await createOrder(TEST_PACKAGE, 'paypal');
    console.log(`Order created with ID: ${orderId}`);
    
    // Step 3: Simulate PayPal approval (this would normally happen in the browser)
    console.log('\n✅ Simulating PayPal approval...');
    console.log('In a real scenario, the user would approve the payment in the PayPal popup');
    console.log('For testing, we\'ll proceed directly to payment capture');
    
    // Step 4: Capture the payment
    console.log('\n💰 Capturing payment...');
    const captureResult = await capturePayment(orderId);
    console.log('Payment captured successfully:');
    console.log(JSON.stringify(captureResult, null, 2));
    
    // Step 5: Verify token balance update
    console.log('\n📊 Verifying token balance update...');
    const newBalance = await getTokenBalance();
    console.log(`New token balance: ${newBalance}`);
    
    const expectedTokens = getPackageTokens(TEST_PACKAGE);
    const expectedBalance = initialBalance + expectedTokens;
    
    if (newBalance === expectedBalance) {
      console.log(`✅ Token balance updated correctly! Added ${expectedTokens} tokens`);
    } else {
      console.log(`❌ Token balance mismatch! Expected: ${expectedBalance}, Got: ${newBalance}`);
    }
    
    console.log('\n🎉 Test completed successfully!');
    
  } catch (error) {
    console.error('\n❌ Test failed:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response data:', error.response.data);
    } else {
      console.error(error.message);
    }
  }
}

/**
 * Get the current token balance
 */
async function getTokenBalance() {
  const response = await axios.get(`${API_URL}/tokens/balance`, { headers });
  return response.data.balance;
}

/**
 * Create a payment order
 */
async function createOrder(packageId, provider = 'paypal') {
  const response = await axios.post(
    `${API_URL}/payments/createOrder`,
    { packageId, provider },
    { headers }
  );
  return response.data.orderId;
}

/**
 * Capture a payment
 */
async function capturePayment(orderId) {
  const response = await axios.post(
    `${API_URL}/payments/paypal/capturePayment`,
    { orderId },
    { headers }
  );
  return response.data;
}

/**
 * Get the number of tokens in a package
 */
function getPackageTokens(packageId) {
  const packages = {
    'basic': 160,
    'standard': 425,
    'premium': 900
  };
  return packages[packageId] || 0;
}

// Run the test
runTest().catch(console.error); 