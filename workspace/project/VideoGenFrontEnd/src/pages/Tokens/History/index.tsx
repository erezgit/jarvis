/**
 * @deprecated This component is deprecated and will be removed in a future release.
 * Please use the BillingPage component from src/pages/Billing instead.
 * All payment history functionality has been moved to the consolidated Billing page.
 */

import React, { useState } from 'react';
import PaymentHistoryItem from '@/components/tokens/PaymentHistoryItem';
import { usePaymentHistory } from '@/core/services/payment/hooks';

/**
 * Page for displaying payment history
 */
const PaymentHistoryPage: React.FC = () => {
  const [limit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  
  const { payments = [], total = 0, loading, error, refetch } = usePaymentHistory({
    limit,
    offset,
    autoFetch: true
  });
  
  // Safely calculate pagination values with guards against division by zero
  const totalPages = limit > 0 ? Math.ceil((total || 0) / limit) : 0;
  const currentPage = limit > 0 ? Math.floor((offset || 0) / limit) + 1 : 1;
  
  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setOffset((currentPage - 2) * limit);
    }
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setOffset(currentPage * limit);
    }
  };
  
  // Ensure payments is always an array
  const safePayments = Array.isArray(payments) ? payments : [];
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Payment History</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          View your payment history for token purchases below.
        </p>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
            <p>{error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 text-gray-500 hover:text-gray-700"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* Payment count */}
        <div className="flex justify-end mb-6">
          <div className="text-gray-600 dark:text-gray-400">
            {total || 0} total payments
          </div>
        </div>
        
        {/* Payments list */}
        <div className="bg-gray-100 dark:bg-[hsl(var(--sidebar-background))] rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin mr-2">⟳</div>
              Loading payment history...
            </div>
          ) : !safePayments || safePayments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No payment history found.
            </div>
          ) : (
            <div className="divide-y divide-gray-300 dark:divide-[hsl(var(--highlight-background))]">
              {safePayments.map(payment => (
                payment && (
                  <PaymentHistoryItem
                    key={payment.id || `payment-${Math.random()}`}
                    payment={payment}
                    className="px-4"
                  />
                )
              ))}
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-md ${
                currentPage === 1
                  ? 'bg-gray-200 dark:bg-[hsl(var(--highlight-background))] text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 dark:bg-[hsl(var(--sidebar-background))] text-white hover:bg-gray-800 dark:hover:bg-[hsl(var(--highlight-background))]'
              }`}
            >
              Previous
            </button>
            
            <div className="text-gray-600 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            
            <button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-md ${
                currentPage === totalPages
                  ? 'bg-gray-200 dark:bg-[hsl(var(--highlight-background))] text-gray-500 dark:text-gray-400 cursor-not-allowed'
                  : 'bg-gray-700 dark:bg-[hsl(var(--sidebar-background))] text-white hover:bg-gray-800 dark:hover:bg-[hsl(var(--highlight-background))]'
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentHistoryPage; 