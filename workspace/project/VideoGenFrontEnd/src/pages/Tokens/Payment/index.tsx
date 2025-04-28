import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { paymentService } from '@/core/services/payment';
import { PaymentProvider, PaymentStatus } from '@/core/services/payment/types';
import type { PaymentResult } from '@/core/services/payment/types';
import { paypalConfig } from '@/config/paypal';

/**
 * Payment page for credit card payments
 */
const PaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const { packageId } = useParams<{ packageId: string }>();
  const location = useLocation();
  const packageDetails = location.state?.packageDetails;
  
  const [loading, setLoading] = useState(true);
  const [initializingPayment, setInitializingPayment] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Check if package ID is provided
  useEffect(() => {
    if (!packageId) {
      setError('No package selected. Please go back and select a token package.');
      setLoading(false);
      return;
    }
    
    // Show loading state briefly before redirecting
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    return () => {
      clearTimeout(timer);
    };
  }, [packageId]);
  
  // Handle direct checkout to PayPal's credit card page
  const handleCreditCardCheckout = async () => {
    try {
      setInitializingPayment(true);
      setError(null);
      
      console.log('[PaymentPage] Creating order for package:', packageId);
      
      // Create an order via the backend
      const result = await paymentService.createOrder(packageId, PaymentProvider.PAYPAL);
      
      if (result.error) {
        console.error('[PaymentPage] Error creating order:', result.error);
        setError(`Failed to create order: ${result.error.message}`);
        setInitializingPayment(false);
        return;
      }
      
      const orderId = result.data;
      console.log('[PaymentPage] Order created successfully:', orderId);
      
      // Redirect to PayPal checkout page with credit card only UX
      // The fundingSource=card parameter forces the credit card form
      window.location.href = `https://www.paypal.com/checkoutnow?token=${orderId}&fundingSource=card`;
      
    } catch (err: any) {
      console.error('[PaymentPage] Error redirecting to payment:', err);
      setError(`Payment failed: ${err.message || 'Unknown error'}`);
      setInitializingPayment(false);
    }
  };
  
  // Handle cancel button click
  const handleCancel = () => {
    navigate('/tokens/purchase');
  };
  
  // Try with a mock payment for development
  const handleMockPayment = () => {
    // In development, this would directly navigate to success
    navigate('/tokens/purchase', { 
      state: { 
        paymentResult: {
          id: 'MOCK-PAYMENT-123',
          status: 'completed' as PaymentStatus,
          amount: packageDetails?.price || 0,
          currency: 'USD',
          createdAt: new Date().toISOString(),
          tokens: packageDetails?.tokens || 0
        }
      }
    });
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-4 text-center">Secure Payment</h1>
          
          {packageDetails && (
            <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg">
              <h2 className="font-bold text-lg mb-2">{packageDetails.name}</h2>
              <div className="flex justify-between">
                <span>Price:</span>
                <span className="font-medium">${packageDetails.price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tokens:</span>
                <span className="font-medium">{packageDetails.tokens}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-300 border-t-blue-600"></div>
              <span className="ml-3">Preparing payment form...</span>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-blue-700 dark:text-blue-300">
                <p className="text-sm">
                  You'll be redirected to PayPal's secure payment page to enter your credit card details. No PayPal account is required.
                </p>
              </div>
              
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={handleCreditCardCheckout}
                  disabled={initializingPayment}
                  className={`w-full py-3 rounded-lg font-medium ${
                    initializingPayment
                      ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {initializingPayment ? (
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-300 border-t-white"></div>
                      <span className="ml-2">Processing...</span>
                    </div>
                  ) : (
                    'Pay with Credit Card'
                  )}
                </button>
                
                {process.env.NODE_ENV !== 'production' && (
                  <button
                    type="button"
                    onClick={handleMockPayment}
                    className="w-full py-3 bg-green-600 text-white hover:bg-green-700 rounded-lg font-medium"
                  >
                    Use Mock Payment (Dev Only)
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={initializingPayment}
                  className="w-full py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  Cancel
                </button>
              </div>
              
              <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
                <p>Your payment information is secure and encrypted.</p>
                <div className="flex justify-center items-center mt-2 space-x-2">
                  <span className="w-8 h-5 bg-gray-200 rounded-sm"></span>
                  <span className="w-8 h-5 bg-gray-200 rounded-sm"></span>
                  <span className="w-8 h-5 bg-gray-200 rounded-sm"></span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentPage; 