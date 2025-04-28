import React from 'react';
import type { PaymentHistoryItem as PaymentHistoryItemType, PaymentStatus } from '@/core/services/payment/types';

interface PaymentHistoryItemProps {
  payment: PaymentHistoryItemType;
  className?: string;
}

/**
 * Component to display a single payment in the history
 */
export const PaymentHistoryItem: React.FC<PaymentHistoryItemProps> = ({
  payment,
  className = ''
}) => {
  // Ensure payment has all required properties with defaults
  const safePayment = {
    id: payment?.id || 'unknown',
    paymentProvider: payment?.paymentProvider || 'Unknown Provider',
    amount: typeof payment?.amount === 'number' ? payment.amount : 0,
    currency: payment?.currency || 'USD',
    status: (payment?.status || 'PENDING') as PaymentStatus,
    tokensPurchased: typeof payment?.tokensPurchased === 'number' ? payment.tokensPurchased : 0,
    packageId: payment?.packageId || 'unknown',
    createdAt: payment?.createdAt || new Date().toISOString()
  };
  
  const { id, paymentProvider, amount, currency, status, tokensPurchased, packageId, createdAt } = safePayment;
  
  // Format date with error handling
  const formattedDate = (() => {
    try {
      return new Date(createdAt).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  })();
  
  // Format amount with currency with error handling
  const formattedAmount = (() => {
    try {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
      }).format(amount);
    } catch (error) {
      console.error('Error formatting amount:', error);
      return `${amount} ${currency}`;
    }
  })();
  
  // Get status styling
  const getStatusStyles = (status: PaymentStatus) => {
    switch (status) {
      case 'SUCCEEDED':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-400'
        };
      case 'FAILED':
        return {
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-800 dark:text-red-400'
        };
      case 'PENDING':
        return {
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-800 dark:text-yellow-400'
        };
      case 'REFUNDED':
        return {
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
          textColor: 'text-purple-800 dark:text-purple-400'
        };
      default:
        return {
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-800 dark:text-gray-400'
        };
    }
  };
  
  const statusStyles = getStatusStyles(status);
  
  // Safely format package name
  const packageName = (() => {
    try {
      if (!packageId) return 'Unknown Package';
      return packageId.charAt(0).toUpperCase() + packageId.slice(1) + ' Package';
    } catch (error) {
      return 'Unknown Package';
    }
  })();
  
  return (
    <div className={`border-b border-gray-200 dark:border-gray-700 py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          {/* Package ID */}
          <div className="font-medium">
            {packageName}
          </div>
          
          {/* Payment Provider */}
          <div className="text-sm text-gray-500 dark:text-gray-400">
            via {paymentProvider}
          </div>
        </div>
        
        <div className="text-right">
          {/* Amount */}
          <div className="font-bold">{formattedAmount}</div>
          
          {/* Tokens */}
          <div className="text-sm text-blue-600 dark:text-blue-400">
            {tokensPurchased} tokens
          </div>
        </div>
      </div>
      
      <div className="flex justify-between items-center mt-2">
        {/* Date */}
        <div className="text-xs text-gray-500 dark:text-gray-500">
          {formattedDate}
        </div>
        
        {/* Status Badge */}
        <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusStyles.bgColor} ${statusStyles.textColor}`}>
          {status}
        </div>
      </div>
      
      {/* Payment ID */}
      <div className="mt-1 text-xs text-gray-500 dark:text-gray-500 font-mono">
        ID: {id.substring(0, Math.min(8, id.length))}...
      </div>
    </div>
  );
};

export default PaymentHistoryItem; 