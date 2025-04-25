import React from 'react';
import { useTokenBalance } from '@/core/services/payment/hooks';
import { useNavigate } from 'react-router-dom';

interface TokenBalanceProps {
  className?: string;
  showAddButton?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Component to display the user's token balance
 */
export const TokenBalance: React.FC<TokenBalanceProps> = ({
  className = '',
  showAddButton = true,
  size = 'md'
}) => {
  const { balance, loading, error, refetch } = useTokenBalance();
  const navigate = useNavigate();

  // Size-based classes
  const sizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg'
  };

  // Handle add tokens button click
  const handleAddTokens = () => {
    navigate('/tokens/purchase');
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center ${className} ${sizeClasses[size]}`}>
        <div className="animate-pulse bg-white/20 rounded h-5 w-24"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center ${className} ${sizeClasses[size]}`}>
        <span>Error loading balance</span>
        <button 
          onClick={() => refetch()} 
          className="ml-2 underline text-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center ${className} ${sizeClasses[size]}`}>
      <div className="text-center">
        <span className="font-medium">Balance:</span>{' '}
        <span className="font-bold">
          {balance !== null ? balance : '–'} tokens
        </span>
        
        {showAddButton && (
          <button
            onClick={handleAddTokens}
            className="ml-3 bg-gray-500 hover:bg-gray-600 text-white rounded-md px-3 py-1 text-sm transition-colors"
          >
            Add Tokens
          </button>
        )}
      </div>
    </div>
  );
};

export default TokenBalance; 