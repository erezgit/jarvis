import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePaymentService } from '@/core/services/payment/usePaymentService';
import type { TokenPackage } from '@/core/services/payment/types';
import { PaymentProvider } from '@/core/services/payment/types';
import { PageTitle } from '@/components/ui/page-title';
import { useDarkMode } from '@/hooks/useDarkMode';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import PayPalButton from '@/components/tokens/PayPalButton';
import { PayPalSDKProvider, usePayPalSDK } from '@/components/tokens/PayPalButtonSDK';
import { PaymentService } from '@/core/services/payment/service';

// Mock toast implementation until we install the real one
const toast = {
  error: (message: string) => console.error(message),
  success: (message: string) => console.log(message)
};

// Custom payment result type for our UI needs
interface CustomPaymentResult {
  success: boolean;
  details: any;
  package: TokenPackage | null;
}

// Simple PayPal Button Container Component that uses the PayPal SDK
const PayPalButtonContainer: React.FC<{
  packageId: string;
  onSuccess: (data: any) => void;
  onError: (error: Error) => void;
}> = ({ packageId, onSuccess, onError }) => {
  const { isLoaded, isLoading, error: sdkError, paypal } = usePayPalSDK();
  const containerId = "paypal-button-container";
  
  useEffect(() => {
    // Skip if SDK not loaded or button already rendered
    if (!isLoaded || !paypal || document.querySelector(`#${containerId} iframe`)) {
      return;
    }
    
    console.log("Rendering PayPal button directly");
    
    if (!paypal.Buttons) {
      console.error("PayPal Buttons not available");
      return;
    }
    
    try {
      const button = paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          height: 40
        },
        createOrder: async () => {
          console.log("Creating order for package:", packageId);
          try {
            const paymentService = PaymentService.getInstance();
            const result = await paymentService.createOrder(packageId, PaymentProvider.PAYPAL);
            if (result.error) {
              throw result.error;
            }
            return result.data;
          } catch (err) {
            console.error("Error creating order:", err);
            throw err;
          }
        },
        onApprove: async (data: any) => {
          console.log("Payment approved:", data);
          try {
            const paymentService = PaymentService.getInstance();
            const result = await paymentService.capturePayPalPayment(data.orderID);
            if (result.error) {
              throw result.error;
            }
            onSuccess(result.data);
          } catch (err) {
            console.error("Error capturing payment:", err);
            onError(err instanceof Error ? err : new Error(String(err)));
          }
        },
        onCancel: () => {
          console.log("Payment cancelled");
        },
        onError: (err: Error) => {
          console.error("PayPal error:", err);
          onError(err);
        }
      });
      
      button.render(`#${containerId}`);
    } catch (err) {
      console.error("Error rendering PayPal button:", err);
    }
  }, [isLoaded, paypal, packageId, onSuccess, onError]);
  
  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center h-12 mb-4">
          <Spinner />
          <span className="ml-2">Loading payment options...</span>
        </div>
      )}
      <div id={containerId} className="my-4 min-h-[50px]"></div>
    </div>
  );
};

interface CheckoutPageProps {
  packageId?: string; // Optional direct packageId for embedded mode
  isEmbedded?: boolean; // Whether the checkout is embedded in a modal
  onPaymentSuccess?: (result: CustomPaymentResult) => void; // Callback for embedded mode
}

// Placeholder PaymentConfirmation component until we create the actual component
const PaymentConfirmation: React.FC<{
  success: boolean;
  packageName: string;
  amount: number;
  tokens: number;
}> = ({ success, packageName, amount, tokens }) => {
  const navigate = useNavigate();
  
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg p-8 shadow-md mt-12">
      <div className="text-center mb-6">
        {success ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Successful!</h2>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Failed</h2>
          </>
        )}
      </div>
      
      {success && (
        <div className="mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Package:</span>
              <span className="font-medium">{packageName}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Amount:</span>
              <span className="font-medium">₪{amount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Tokens Added:</span>
              <span className="font-medium">{tokens}</span>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6">
        <button
          onClick={() => navigate('/tokens')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg py-3 px-4 transition-colors"
        >
          {success ? 'Return to Tokens' : 'Try Again'}
        </button>
      </div>
    </div>
  );
};

/**
 * Checkout page for completing token purchase
 */
export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  packageId: propPackageId,
  isEmbedded = false,
  onPaymentSuccess
}) => {
  const params = useParams<{ packageId: string }>();
  const navigate = useNavigate();
  const paymentService = usePaymentService();
  const { isDarkMode } = useDarkMode();
  const { isLoaded: sdkReady } = usePayPalSDK();
  
  // Use packageId from props if available, otherwise from route params
  const packageId = propPackageId || params.packageId;
  
  const [selectedPackage, setSelectedPackage] = useState<TokenPackage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  
  // Animation states
  const [containerVisible, setContainerVisible] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  
  // Fetch the selected package when the component mounts
  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!packageId) {
          throw new Error('No package ID provided');
        }
        
        // Get package by ID - this is now a Promise
        const pkg = await paymentService.getTokenPackageById(packageId);
        if (!pkg) {
          throw new Error('Package not found');
        }
        
        setSelectedPackage(pkg);
        
        // Start animation sequence
        setContainerVisible(true);
        
        // Delay content appearance
        const timer = setTimeout(() => {
          setContentVisible(true);
        }, 300);
        
        return;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load package details');
        toast.error('Failed to load package details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchPackage();
  }, [packageId, paymentService]);
  
  // Handle going back to package selection
  const handleBackToPackages = () => {
    if (isEmbedded) {
      // Just close the modal by calling parent's callback with empty data
      // The parent component will handle the actual closing
      return;
    }
    navigate('/tokens/purchase');
  };
  
  // Handle successful payment
  const handlePaymentSuccess = (details: any) => {
    setIsPurchasing(false);
    toast.success('Payment successful!');
    
    const paymentResult: CustomPaymentResult = {
      success: true,
      details,
      package: selectedPackage
    };
    
    if (isEmbedded && onPaymentSuccess) {
      // Call the parent's callback
      onPaymentSuccess(paymentResult);
      return;
    }
    
    // Navigate back to the token purchase page with a success flag
    navigate('/tokens/purchase?status=success', { 
      state: { paymentResult }
    });
  };
  
  // Handle payment error
  const handlePaymentError = (error: Error) => {
    setIsPurchasing(false);
    toast.error(`Payment failed: ${error.message}`);
  };
  
  // Render loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col items-center justify-center ${isEmbedded ? "min-h-screen bg-gray-900" : "min-h-[60vh]"}`}>
        <Spinner size="lg" />
        <p className="mt-4 text-gray-600 dark:text-gray-400">Loading package details...</p>
      </div>
    );
  }
  
  // Render error state
  if (error || !selectedPackage) {
    return (
      <div className={`flex flex-col items-center justify-center ${isEmbedded ? "min-h-screen bg-gray-900" : "min-h-[60vh]"}`}>
        <div className="text-red-500 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">{error || 'Failed to load package details'}</p>
        <Button onClick={handleBackToPackages}>Back to Packages</Button>
      </div>
    );
  }
  
  // Define the container class based on embedded state
  const containerClass = isEmbedded 
    ? "w-full min-h-screen flex items-stretch" // Remove padding, use stretch for equal height
    : "container max-w-4xl mx-auto px-4 py-8";
  
  // Company logo component - replace with your actual logo
  const CompanyLogo = () => (
    <div className="mb-6 flex items-center">
      <button 
        onClick={handleBackToPackages}
        className="mr-2 text-gray-400 hover:text-white"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
      </button>
      <h1 className="text-2xl font-bold tracking-tight">runway</h1>
    </div>
  );
  
  return (
    <div className={containerClass}>
      <PayPalSDKProvider options={{ 
        'components': 'buttons,funding-eligibility', 
        'debug': 'true',
        'enable-funding': 'card,credit' 
      }}>
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <Spinner className="h-12 w-12 text-blue-500" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-lg mb-4">{error}</div>
            <Button
              onClick={() => navigate('/tokens/purchase')}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              Return to Packages
            </Button>
          </div>
        ) : (
          <div 
            className="w-full h-screen flex flex-col md:flex-row transition-opacity duration-500 ease-in-out"
            style={{ opacity: containerVisible ? 1 : 0 }}
          >
            {/* Left side - black background with order summary */}
            <div className="w-full md:w-1/2 bg-black text-white p-8 md:p-12 flex flex-col justify-center">
              <div 
                className="max-w-sm mx-auto w-full transition-opacity duration-500 ease-in-out"
                style={{ opacity: contentVisible ? 1 : 0 }}
              >
                <CompanyLogo />
                
                <div className="mb-6">
                  <p className="text-white mb-3 text-sm">Choose a currency:</p>
                  <div className="flex space-x-2">
                    <button className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm flex items-center border border-gray-700">
                      <span className="mr-1">₪</span>
                      <span>{selectedPackage.price.toFixed(2)}</span>
                    </button>
                    <button className="bg-gray-900 bg-opacity-30 text-white px-3 py-1.5 rounded-md text-sm flex items-center border border-transparent">
                      <span className="mr-1">$</span>
                      <span>{(selectedPackage.price / 3.5).toFixed(2)}</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">1 USD = 3.5000 ILS (includes 4% conversion fee)</p>
                </div>
                
                <p className="text-gray-400 mb-1 text-sm">Credits</p>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm">Qty {selectedPackage.tokens}</span>
                  <span className="text-xl font-medium">₪{selectedPackage.price.toFixed(2)}</span>
                </div>
                <div className="text-xs text-gray-500 mb-4">₪{(selectedPackage.price / selectedPackage.tokens).toFixed(2)} each</div>
                
                <div className="space-y-3 mb-6">
                  <div className="pt-3 border-t border-gray-800">
                    <div className="flex justify-between mb-3 text-sm">
                      <span>Subtotal</span>
                      <span>₪{selectedPackage.price.toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center text-sm">
                    <div className="flex items-center">
                      <span className="text-gray-400">Tax</span>
                      <div className="ml-1 text-gray-500 cursor-pointer">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                    <span>₪0.00</span>
                  </div>
                  
                  <div className="pt-3 border-t border-gray-800">
                    <div className="flex justify-between font-bold">
                      <span>Total due</span>
                      <span>₪{selectedPackage.price.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                
                <button
                  className="w-full bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white py-2 px-4 rounded text-sm mb-4 transition-colors"
                >
                  Add promotion code
                </button>
              </div>
            </div>
            
            {/* Right side - white background with payment form */}
            <div className="hidden md:block w-1/2 bg-white p-8 md:p-12 flex flex-col justify-center overflow-y-auto">
              <div 
                className="max-w-sm mx-auto transition-opacity duration-500 ease-in-out"
                style={{ opacity: contentVisible ? 1 : 0 }}
              >
                <div className="flex justify-between items-center mb-8">
                  <h1 className="text-xl font-medium text-gray-800">Enter payment details</h1>
                  <button 
                    onClick={handleBackToPackages}
                    className="text-green-600 font-medium"
                  >
                    Cancel
                  </button>
                </div>

                {!isLoading && selectedPackage && !paymentResult && (
                  <div className="mb-8">
                    <div className="mb-6">
                      <h2 className="text-xl font-semibold mb-1">{selectedPackage.name}</h2>
                      <div className="flex items-baseline">
                        <span className="text-2xl font-bold">₪{selectedPackage.price.toFixed(2)}</span>
                        {selectedPackage.discount && (
                          <span className="ml-2 text-green-600 text-sm">Save {selectedPackage.discount}%</span>
                        )}
                      </div>
                      <p className="text-gray-600 mt-1">{selectedPackage.tokens} tokens</p>
                    </div>
                  </div>
                )}
                
                {/* Desktop credit card payment section with PayPal Button */}
                <div className="mb-4">
                  <h3 className="text-md font-medium text-gray-700 mb-2">Pay with PayPal or credit card</h3>
                  <div className="text-sm text-gray-600 mb-4">
                    Click the button below to pay with PayPal or credit card
                  </div>
                </div>
                
                {/* PayPal Button Container */}
                <PayPalButtonContainer
                  packageId={selectedPackage.id}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                />
                
                <div className="mt-16 text-sm text-gray-500 text-center">
                  <div className="flex justify-center items-center mb-2">
                    <span>Powered by</span>
                    <span className="ml-1 font-medium">PayPal</span>
                  </div>
                  <div className="flex justify-center space-x-4">
                    <a href="#" className="hover:text-gray-700">Terms</a>
                    <a href="#" className="hover:text-gray-700">Privacy</a>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Mobile view */}
            <div className="md:hidden bg-white p-6">
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Pay with PayPal or credit card</h3>
                <div className="text-gray-600 text-sm mb-4">
                  Click the button below to pay with PayPal or credit card
                </div>
              </div>
              
              {/* PayPal Button Container for mobile */}
              <PayPalButtonContainer
                packageId={selectedPackage.id}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
              />
              
              <div className="mt-16 text-sm text-gray-500 text-center">
                <div className="flex justify-center items-center mb-2">
                  <span>Powered by</span>
                  <span className="ml-1 font-medium">PayPal</span>
                </div>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="hover:text-gray-700">Terms</a>
                  <a href="#" className="hover:text-gray-700">Privacy</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </PayPalSDKProvider>
    </div>
  );
};

export default CheckoutPage; 