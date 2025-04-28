import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  packageId?: string;
  onApprove: (details: any) => void;
  onError: (error: Error) => void;
  setIsProcessing?: (isProcessing: boolean) => void;
}

/**
 * PayPal Express Checkout button component (Mock implementation)
 */
export const PayPalButton: React.FC<PayPalButtonProps> = ({
  amount,
  onApprove,
  onError,
  setIsProcessing
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Handle payment simulation
  const handlePayment = async () => {
    if (setIsProcessing) {
      setIsProcessing(true);
    }
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      const mockPaymentDetails = {
        id: 'MOCK-ORDER-ID',
        status: 'COMPLETED',
        payer: {
          email_address: 'customer@example.com',
          payer_id: 'MOCKPAYERID'
        },
        purchase_units: [{
          amount: {
            currency_code: 'USD',
            value: amount
          }
        }],
        create_time: new Date().toISOString(),
        update_time: new Date().toISOString()
      };
      
      onApprove(mockPaymentDetails);
    } catch (err) {
      onError(new Error('Payment simulation failed'));
    } finally {
      setIsLoading(false);
      if (setIsProcessing) {
        setIsProcessing(false);
      }
    }
  };

  return (
    <div className="py-2">
      <Button
        variant="primary"
        className="w-full bg-[#0070ba] hover:bg-[#003087] flex items-center justify-center"
        onClick={handlePayment}
        isLoading={isLoading}
      >
        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 5.25H4.5C3.675 5.25 3 5.925 3 6.75V17.25C3 18.075 3.675 18.75 4.5 18.75H19.5C20.325 18.75 21 18.075 21 17.25V6.75C21 5.925 20.325 5.25 19.5 5.25Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 9.75H21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Pay with PayPal
      </Button>
      <div className="text-xs text-center mt-2 text-gray-500">
        Powered by PayPal (Mock Implementation)
      </div>
    </div>
  );
};

export default PayPalButton; 