import React, { useState, useEffect, useRef } from 'react';
import { DEFAULT_TOKEN_PACKAGES, TokenPackage } from '@/core/services/payment/types';
import PayPalButton from '@/components/tokens/PayPalButton';

/**
 * Props for the AddCreditsModal component
 */
interface AddCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pkg: any) => void;
}

/**
 * Modal for adding credits via PayPal
 * Contains:
 * 1. Package selection step
 * 2. Payment method step with PayPal integration
 */
const AddCreditsModal: React.FC<AddCreditsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  // State for multi-step flow
  const [step, setStep] = useState<'select' | 'payment'>('select');
  
  // State for package selection
  const [selectedPackage, setSelectedPackage] = useState(DEFAULT_TOKEN_PACKAGES.find(pkg => pkg.isPopular) || DEFAULT_TOKEN_PACKAGES[0]);
  
  // State for transaction and UI
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionComplete, setTransactionComplete] = useState(false);
  
  // Refs
  const modalRef = useRef<HTMLDivElement>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedPackage(DEFAULT_TOKEN_PACKAGES.find(pkg => pkg.isPopular) || DEFAULT_TOKEN_PACKAGES[0]);
      setError(null);
      setIsProcessing(false);
      setTransactionComplete(false);
    }
  }, [isOpen]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        handleClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Package selection handler
  const handleSelectPackage = (packageId: string) => {
    const pkg = DEFAULT_TOKEN_PACKAGES.find(p => p.id === packageId);
    if (pkg) {
      setSelectedPackage(pkg);
    }
  };

  // Navigation handlers
  const handleContinue = () => setStep('payment');
  const handleBack = () => setStep('select');
  const handleClose = () => onClose();
  
  // PayPal payment handlers
  const handlePaymentSuccess = (paymentResult: any) => {
    console.log('[AddCreditsModal] Payment successful:', paymentResult);
    setIsProcessing(false);
    setTransactionComplete(true);
    
    // Short delay before closing the modal
    setTimeout(() => {
      onSuccess(selectedPackage);
      onClose();
    }, 1500);
  };
  
  const handlePaymentError = (error: Error) => {
    console.error('[AddCreditsModal] Payment error:', error);
    setError(`Payment failed: ${error.message}`);
    setIsProcessing(false);
  };
  
  const handlePaymentCancel = () => {
    console.log('[AddCreditsModal] Payment cancelled by user');
    setError('Payment was cancelled. Please try again when ready.');
    setIsProcessing(false);
  };

  // If modal is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
      <div 
        ref={modalRef}
        className="bg-white rounded-lg w-full max-w-md mx-4 my-8 text-gray-800"
        style={{ maxHeight: '90vh' }}
      >
        {/* Modal Header */}
        <div className="sticky top-0 z-10 flex justify-between items-center p-4 border-b border-gray-200 bg-white rounded-t-lg">
          <h2 className="text-lg font-medium">
            {step === 'select' && 'Add Credits'}
            {step === 'payment' && 'Complete Payment'}
          </h2>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        
        {/* Modal Content - Scrollable */}
        <div className="overflow-y-auto p-4" style={{ 
          maxHeight: 'calc(90vh - 60px)',
          scrollbarWidth: 'thin',
          scrollbarColor: '#CBD5E0 #EDF2F7'
        }}>
          {/* Package Selection Step */}
          {step === 'select' && (
            <div>
              <p className="text-gray-600 mb-4">Select a credit package:</p>
              
              <div className="space-y-3">
                {DEFAULT_TOKEN_PACKAGES.map((pkg) => (
                  <div 
                    key={pkg.id}
                    onClick={() => handleSelectPackage(pkg.id)}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPackage.id === pkg.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <div className="flex justify-between">
                      <h3 className="font-medium">{pkg.name}</h3>
                      <span className="font-bold">${pkg.price.toFixed(2)}</span>
                    </div>
                    <p className="text-gray-600 mt-1">{pkg.tokens} credits</p>
                    {pkg.isPopular && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded mt-2 inline-block">
                        Most Popular
                      </span>
                    )}
                    {pkg.isBestValue && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded mt-2 inline-block">
                        Best Value
                      </span>
                    )}
                    {pkg.discount && pkg.discount > 0 && (
                      <span className="text-xs text-green-600 mt-1 block">
                        Save ${pkg.discount.toFixed(2)}
                      </span>
                    )}
                  </div>
                ))}
              </div>
              
              <button
                onClick={handleContinue}
                className="mt-6 w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}
          
          {/* Payment Step */}
          {step === 'payment' && (
            <div className="flex flex-col items-center">
              <h3 className="text-xl font-semibold mb-4">Complete Your Purchase</h3>
              
              <div className="bg-gray-50 p-4 rounded-lg mb-6 w-full">
                <p className="text-lg font-medium">Package: {selectedPackage?.name}</p>
                <p className="text-xl font-bold">Price: ${selectedPackage?.price}</p>
                <p>Tokens: {selectedPackage?.tokens}</p>
              </div>
              
              {/* Transaction Complete Message */}
              {transactionComplete && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4 w-full">
                  <p className="font-semibold">Payment Successful!</p>
                  <p>Your tokens have been added to your account.</p>
                </div>
              )}
              
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded mb-4 w-full">
                  <p>{error}</p>
                </div>
              )}
              
              {/* PayPal Button Component */}
              {!transactionComplete && (
                <div className="w-full mb-4 min-h-[150px]">
                  <PayPalButton
                    packageId={selectedPackage.id}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onCancel={handlePaymentCancel}
                    size="large"
                    shape="rect"
                    color="gold"
                    containerId="add-credits-paypal-container"
                  />
                </div>
              )}
              
              {/* Back button */}
              <button
                onClick={handleBack}
                className="mt-6 text-gray-600 hover:text-gray-800"
                disabled={isProcessing}
              >
                ← Back to Package Selection
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddCreditsModal; 