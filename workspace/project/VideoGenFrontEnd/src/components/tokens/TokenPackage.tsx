import React from 'react';
import type { TokenPackage as TokenPackageType } from '@/core/services/payment/types';

interface TokenPackageProps {
  package: TokenPackageType;
  isSelected: boolean;
  onSelect: () => void;
  className?: string;
}

/**
 * Component to display a purchasable token package
 */
export const TokenPackage: React.FC<TokenPackageProps> = ({
  package: pkg,
  isSelected,
  onSelect,
  className = ''
}) => {
  const { name, price, tokens, rate, isPopular, isBestValue } = pkg;
  
  // Format price with 2 decimal places
  const formattedPrice = `$${price.toFixed(2)}`;
  
  return (
    <div 
      className={`
        relative border rounded-lg transition-all cursor-pointer
        ${isSelected 
          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 shadow-lg transform scale-105' 
          : 'border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md hover:scale-105'
        }
        h-full flex flex-col transform transition-transform duration-200
        ${className}
      `}
      onClick={onSelect}
      role="button"
      aria-pressed={isSelected}
    >
      {/* Header section */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700">
        {/* Package Name */}
        <h3 className="text-xl font-bold text-center mb-1">{name}</h3>
        
        {/* Price */}
        <div className="text-3xl font-bold text-center mb-2">
          {formattedPrice}
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">per year</span>
        </div>
      </div>
      
      {/* Body section */}
      <div className="p-5 flex-grow">
        {/* Tokens */}
        <div className="text-center mb-4">
          <span className="text-xl font-bold">{tokens}</span>
          <span className="text-gray-600 dark:text-gray-400 ml-2">tokens</span>
        </div>
        
        {/* Rate */}
        <div className="text-sm text-gray-600 dark:text-gray-400 text-center mb-5">
          Rate: {rate} tokens per dollar
        </div>
        
        {/* CTA button - always visible */}
        <div className="mt-auto">
          <div className={`
            w-full py-2 text-center rounded-md flex items-center justify-center
            ${isSelected 
              ? 'bg-blue-600 text-white' 
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }
          `}>
            {isSelected ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Selected
              </>
            ) : (
              'Select & Checkout'
            )}
          </div>
        </div>
      </div>
      
      {/* Popular/Best Value Badge */}
      {(isPopular || isBestValue) && (
        <div className={`
          absolute top-0 right-0 transform translate-x-2 -translate-y-1/2
          px-3 py-1 text-xs font-bold text-white rounded-full
          ${isPopular ? 'bg-orange-500' : 'bg-green-500'}
        `}>
          {isPopular ? 'Most Popular' : 'Best Value'}
        </div>
      )}
    </div>
  );
};

export default TokenPackage; 