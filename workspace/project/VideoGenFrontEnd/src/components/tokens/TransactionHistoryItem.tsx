import React from 'react';
import type { TokenTransaction } from '@/core/services/payment/types';

interface TransactionHistoryItemProps {
  transaction: TokenTransaction;
  className?: string;
}

/**
 * Component to display a single transaction in the history
 */
export const TransactionHistoryItem: React.FC<TransactionHistoryItemProps> = ({
  transaction,
  className = ''
}) => {
  // Ensure transaction has all required properties with defaults
  const safeTransaction = {
    id: transaction?.id || 'unknown',
    transactionType: transaction?.transactionType || 'unknown',
    amount: typeof transaction?.amount === 'number' ? transaction.amount : 0,
    balanceAfter: typeof transaction?.balanceAfter === 'number' ? transaction.balanceAfter : 0,
    description: transaction?.description || 'No description',
    createdAt: transaction?.createdAt || new Date().toISOString()
  };
  
  const { id, transactionType, amount, balanceAfter, description, createdAt } = safeTransaction;
  
  // Format date with error handling
  const formattedDate = (() => {
    try {
      return new Date(createdAt).toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  })();
  
  // Determine transaction type styling
  const getTypeStyles = () => {
    switch (transactionType) {
      case 'purchase':
        return {
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-800 dark:text-green-400',
          icon: '+'
        };
      case 'usage':
        return {
          bgColor: 'bg-gray-200 dark:bg-[hsl(var(--highlight-background))]',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: '-'
        };
      case 'refund':
        return {
          bgColor: 'bg-gray-100 dark:bg-[hsl(var(--highlight-background))]',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: '↺'
        };
      default:
        return {
          bgColor: 'bg-gray-100 dark:bg-[hsl(var(--highlight-background))]',
          textColor: 'text-gray-700 dark:text-gray-300',
          icon: '•'
        };
    }
  };
  
  const typeStyles = getTypeStyles();
  
  return (
    <div className={`border-b border-gray-300 dark:border-[hsl(var(--highlight-background))] py-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {/* Transaction Type Badge */}
          <div className={`w-8 h-8 rounded-full ${typeStyles.bgColor} ${typeStyles.textColor} flex items-center justify-center font-bold mr-3`}>
            {typeStyles.icon}
          </div>
          
          {/* Transaction Details */}
          <div>
            <div className="font-medium capitalize">{transactionType}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{description}</div>
          </div>
        </div>
        
        <div className="text-right">
          {/* Amount */}
          <div className={`font-bold ${amount > 0 ? 'text-green-600 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>
            {amount > 0 ? '+' : ''}{amount} tokens
          </div>
          
          {/* Balance After */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Balance: {balanceAfter} tokens
          </div>
        </div>
      </div>
      
      {/* Date & ID */}
      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400 flex justify-between">
        <span>{formattedDate}</span>
        <span className="font-mono">ID: {id.substring(0, Math.min(8, id.length))}...</span>
      </div>
    </div>
  );
};

export default TransactionHistoryItem; 