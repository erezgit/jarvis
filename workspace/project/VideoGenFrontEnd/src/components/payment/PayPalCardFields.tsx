import React, { useState } from 'react';
import { Button } from '@/components/ui/button';

interface PayPalCardFieldsProps {
  amount: string;
  currency?: string;
  packageId?: string;
  onApprove: (details: any) => void;
  onError: (error: Error) => void;
  setIsProcessing?: (isProcessing: boolean) => void;
  theme?: any;
}

/**
 * PayPal Card Fields component for credit/debit card payments (Mock implementation)
 */
export const PayPalCardFields: React.FC<PayPalCardFieldsProps> = ({
  amount,
  onApprove,
  onError,
  setIsProcessing
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [cardName, setCardName] = useState('');

  // Handle submit payment
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    // Simple validation
    if (!cardNumber || !expiry || !cvv || !cardName) {
      onError(new Error('Please fill in all card details'));
      return;
    }
    
    if (setIsProcessing) {
      setIsProcessing(true);
    }
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful payment
      const mockPaymentDetails = {
        id: 'MOCK-CARD-PAYMENT',
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
        update_time: new Date().toISOString(),
        payment_source: {
          card: {
            last_digits: cardNumber.slice(-4),
            brand: 'VISA',
            type: 'CREDIT'
          }
        }
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Card Holder Name */}
      <div>
        <label htmlFor="card-name" className="block text-sm font-medium mb-1">
          Cardholder Name
        </label>
        <input
          id="card-name"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          placeholder="John Smith"
          required
        />
      </div>
      
      {/* Card Number */}
      <div>
        <label htmlFor="card-number" className="block text-sm font-medium mb-1">
          Card Number
        </label>
        <input
          id="card-number"
          type="text"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
          value={cardNumber}
          onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').slice(0, 16))}
          placeholder="4111 1111 1111 1111"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* Expiration Date */}
        <div>
          <label htmlFor="expiry" className="block text-sm font-medium mb-1">
            Expiration Date
          </label>
          <input
            id="expiry"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={expiry}
            onChange={(e) => setExpiry(e.target.value.replace(/\D/g, '').slice(0, 4))}
            placeholder="MM/YY"
            required
          />
        </div>
        
        {/* CVV */}
        <div>
          <label htmlFor="cvv" className="block text-sm font-medium mb-1">
            Security Code (CVV)
          </label>
          <input
            id="cvv"
            type="text"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))}
            placeholder="123"
            required
          />
        </div>
      </div>
      
      <Button
        type="submit"
        className="w-full mt-4"
        isLoading={isLoading}
      >
        Pay ${parseFloat(amount).toFixed(2)}
      </Button>
      
      <div className="text-xs text-center mt-2 text-gray-500">
        Secure payment processing (Mock Implementation)
      </div>
    </form>
  );
};

export default PayPalCardFields; 