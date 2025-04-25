import React from 'react';
import { useNavigate } from 'react-router-dom';

// Custom payment result type for our UI needs
interface CustomPaymentResult {
  success: boolean;
  details: any;
  package: any;
}

interface PaymentConfirmationProps {
  paymentResult: CustomPaymentResult;
  onClose?: () => void;
  className?: string;
}

/**
 * Component to display confirmation after a successful payment
 */
export const PaymentConfirmation: React.FC<PaymentConfirmationProps> = ({
  paymentResult,
  onClose,
  className = ''
}) => {
  const navigate = useNavigate();
  const { success, details, package: pkg } = paymentResult;
  const tokens = pkg?.tokens || 0;
  const transactionId = details?.id || 'N/A';

  // Handle return to dashboard
  const handleReturnToDashboard = () => {
    if (onClose) {
      onClose();
    } else {
      navigate('/');
    }
  };

  if (!success) {
    return (
      <div className={`bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center ${className}`}>
        <div className="text-red-500 text-4xl mb-4">❌</div>
        <h2 className="text-xl font-bold mb-2">Payment Failed</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          There was an issue processing your payment. Please try again.
        </p>
        <button
          onClick={handleReturnToDashboard}
          className="bg-gray-700 dark:bg-[hsl(var(--sidebar-background))] hover:bg-gray-800 dark:hover:bg-[hsl(var(--highlight-background))] text-white rounded-md px-4 py-2 transition-colors"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className={`bg-gray-100 dark:bg-[hsl(var(--sidebar-background))] border border-gray-300 dark:border-[hsl(var(--highlight-background))] rounded-lg p-6 text-center ${className}`}>
      <div className="text-green-500 text-4xl mb-4">✅</div>
      <h2 className="text-xl font-bold mb-2">Payment Successful!</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 dark:text-gray-300 mb-2">
          You have successfully purchased <span className="font-bold text-green-600 dark:text-green-400">{tokens}</span> tokens.
        </p>
        <p className="text-gray-700 dark:text-gray-300">
          Package: <span className="font-bold text-green-600 dark:text-green-400">{pkg?.name}</span>
        </p>
      </div>
      
      {transactionId && (
        <div className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Transaction ID: {transactionId}
        </div>
      )}
      
      <button
        onClick={handleReturnToDashboard}
        className="bg-gray-700 dark:bg-[hsl(var(--sidebar-background))] hover:bg-gray-800 dark:hover:bg-[hsl(var(--highlight-background))] text-white rounded-md px-4 py-2 transition-colors"
      >
        Return to Dashboard
      </button>
    </div>
  );
};

export default PaymentConfirmation; 