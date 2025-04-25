/**
 * Test script for Payment API endpoints
 * 
 * This script tests the following endpoints:
 * 1. Create Order
 * 2. Capture Payment
 * 3. Get Token Balance
 * 4. Get Payment History
 * 5. Get Token Transactions
 * 
 * Usage: 
 * 1. Start the server: npm run dev
 * 2. Run this script: node test-payment-api.js
 */

const axios = require('axios');

// Configuration
const API_URL = 'http://localhost:3000/api/payments';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with a valid JWT token

// Setup axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Authorization': `Bearer ${AUTH_TOKEN}`,
    'Content-Type': 'application/json'
  }
});

// Test functions
async function testCreateOrder() {
  console.log('\n--- Testing Create Order ---');
  try {
    const response = await api.post('/createOrder', {
      packageId: 'standard'
    });
    console.log('✅ Create Order Success:', response.data);
    return response.data.orderId;
  } catch (error) {
    console.error('❌ Create Order Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testCapturePayment(orderId) {
  console.log('\n--- Testing Capture Payment ---');
  try {
    const response = await api.post('/capturePayment', {
      orderId
    });
    console.log('✅ Capture Payment Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Capture Payment Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetTokenBalance() {
  console.log('\n--- Testing Get Token Balance ---');
  try {
    const response = await api.get('/tokens/balance');
    console.log('✅ Get Token Balance Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get Token Balance Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetPaymentHistory() {
  console.log('\n--- Testing Get Payment History ---');
  try {
    const response = await api.get('/history');
    console.log('✅ Get Payment History Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get Payment History Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testGetTokenTransactions() {
  console.log('\n--- Testing Get Token Transactions ---');
  try {
    const response = await api.get('/tokens/transactions');
    console.log('✅ Get Token Transactions Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Get Token Transactions Error:', error.response?.data || error.message);
    throw error;
  }
}

async function testMockPayment() {
  console.log('\n--- Testing Mock Payment Process ---');
  try {
    const response = await api.post('/mock/process', {
      amount: 25.00,
      currency: 'USD'
    });
    console.log('✅ Mock Payment Success:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Mock Payment Error:', error.response?.data || error.message);
    throw error;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Payment API Tests');
  
  try {
    // Test initial token balance
    await testGetTokenBalance();
    
    // Test create and capture payment
    const orderId = await testCreateOrder();
    await testCapturePayment(orderId);
    
    // Test updated token balance
    await testGetTokenBalance();
    
    // Test payment history
    await testGetPaymentHistory();
    
    // Test token transactions
    await testGetTokenTransactions();
    
    // Test mock payment
    await testMockPayment();
    
    console.log('\n✅ All tests completed successfully!');
  } catch (error) {
    console.error('\n❌ Tests failed:', error.message);
  }
}

// Execute tests
runTests(); 