/**
 * @deprecated This component is deprecated and will be removed in a future release.
 * Please use the BillingPage component from src/pages/Billing instead.
 * All token purchase functionality has been moved to the consolidated Billing page.
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TokenPackage from '@/components/tokens/TokenPackage';
import PaymentConfirmation from '@/components/tokens/PaymentConfirmation';
import { paymentService } from '@/core/services/payment';
import type { TokenPackage as TokenPackageType } from '@/core/services/payment/types';
import { useTokenBalance } from '@/core/services/payment/hooks';
import { CheckoutPage } from '@/pages/Tokens/Checkout';
import { usePaymentService } from '@/core/services/payment/usePaymentService';
import { PageTitle } from '@/components/ui/page-title';

// Custom payment result type for our UI needs
interface CustomPaymentResult {
  success: boolean;
  details: any;
  package: TokenPackageType | null;
}

/**
 * Page for purchasing tokens
 */
const TokenPurchasePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { refetch: refetchBalance } = useTokenBalance();
  const [selectedPackage, setSelectedPackage] = useState<TokenPackageType | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<CustomPaymentResult | null>(location.state?.paymentResult || null);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState<boolean>(false);
  
  // Get token packages
  const tokenPackages = paymentService.getTokenPackages();
  
  useEffect(() => {
    console.log('[TokenPurchasePage] Component mounted');
    console.log('[TokenPurchasePage] Available packages:', tokenPackages);
    
    // Check for payment result in location state
    if (location.state?.paymentResult) {
      console.log('[TokenPurchasePage] Payment result found in location state:', location.state.paymentResult);
      setPaymentResult(location.state.paymentResult);
      // Clear the location state to avoid showing the result again on refresh
      window.history.replaceState({}, document.title);
      // Refresh the token balance
      refetchBalance();
    }
  }, [tokenPackages, location.state, refetchBalance]);
  
  // Handle package selection
  const handleSelectPackage = (pkg: TokenPackageType) => {
    console.log('[TokenPurchasePage] Package selected:', pkg);
    setSelectedPackage(pkg);
    setError(null);
    
    // Open checkout modal instead of navigating
    setIsCheckoutModalOpen(true);
  };
  
  // Handle closing the checkout modal
  const handleCloseCheckout = () => {
    setIsCheckoutModalOpen(false);
  };
  
  // Handle successful payment completion
  const handlePaymentSuccess = (result: CustomPaymentResult) => {
    setIsCheckoutModalOpen(false);
    setPaymentResult(result);
    refetchBalance();
  };
  
  // Handle navigation to transactions page
  const handleViewTransactions = () => {
    navigate('/tokens/transactions');
  };
  
  // Render package selection UI
  const renderPackageSelection = () => {
    return (
      <div>
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-2 text-center">Select Token Package</h2>
          <p className="text-gray-600 dark:text-gray-400 text-center">
            Choose the token package that best fits your needs
          </p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {tokenPackages.map(pkg => (
            <TokenPackage
              key={pkg.id}
              package={pkg}
              isSelected={selectedPackage?.id === pkg.id}
              onSelect={() => handleSelectPackage(pkg)}
            />
          ))}
        </div>
        
        {loading && (
          <div className="flex justify-center my-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg">Processing...</span>
          </div>
        )}
      </div>
    );
  };
  
  // Render payment confirmation UI after successful payment
  const renderPaymentConfirmation = () => {
    if (!paymentResult) return null;
    
    return (
      <PaymentConfirmation
        paymentResult={paymentResult}
        onClose={handleViewTransactions}
      />
    );
  };
  
  // Render fullscreen checkout modal
  const renderCheckoutModal = () => {
    if (!isCheckoutModalOpen || !selectedPackage) return null;
    
    return (
      <div className="fixed inset-0 z-50 flex items-stretch overflow-hidden">
        <button 
          onClick={handleCloseCheckout}
          className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 md:hidden"
          aria-label="Close checkout"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <CheckoutPage 
          packageId={selectedPackage.id} 
          onPaymentSuccess={handlePaymentSuccess}
          isEmbedded={true}
        />
      </div>
    );
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Purchase Tokens</h1>
        
        {paymentResult ? renderPaymentConfirmation() : renderPackageSelection()}
        
        {renderCheckoutModal()}
      </div>
    </div>
  );
};

export default TokenPurchasePage; 