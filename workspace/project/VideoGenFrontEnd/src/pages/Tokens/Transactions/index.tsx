/**
 * @deprecated This component is deprecated and will be removed in a future release.
 * Please use the BillingPage component from src/pages/Billing instead.
 * All token transaction history functionality has been moved to the consolidated Billing page.
 */

import React, { useState } from 'react';
import TransactionHistoryItem from '@/components/tokens/TransactionHistoryItem';
import { useTransactionHistory } from '@/core/services/payment/hooks';

/**
 * Page for displaying token transaction history
 */
const TransactionHistoryPage: React.FC = () => {
  const [limit, setLimit] = useState<number>(10);
  const [offset, setOffset] = useState<number>(0);
  const [filter, setFilter] = useState<string>('all');
  
  const { transactions = [], total = 0, loading, error, refetch } = useTransactionHistory({
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
  
  // Filter transactions with null checks
  const safeTransactions = transactions || [];
  const filteredTransactions = filter === 'all'
    ? safeTransactions
    : safeTransactions.filter(transaction => 
        transaction && transaction.transactionType === filter
      );
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Token Transaction History</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          View your token transaction history below.
        </p>
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6 text-red-700 dark:text-red-400">
            <p>{error.message}</p>
            <button 
              onClick={() => refetch()} 
              className="mt-2 text-sm font-medium underline"
            >
              Try again
            </button>
          </div>
        )}
        
        {/* Filter and total count */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <div className="flex items-center">
            <label htmlFor="filter" className="mr-2 text-gray-700 dark:text-gray-300">
              Filter by:
            </label>
            <select
              id="filter"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="border border-gray-300 dark:border-gray-700 rounded-md px-3 py-2 bg-white dark:bg-[hsl(var(--highlight-background))]"
            >
              <option value="all">All Transactions</option>
              <option value="purchase">Purchases</option>
              <option value="usage">Usage</option>
              <option value="refund">Refunds</option>
            </select>
          </div>
          
          <div className="text-gray-600 dark:text-gray-400">
            {total || 0} total transactions
          </div>
        </div>
        
        {/* Transactions list */}
        <div className="bg-gray-100 dark:bg-[hsl(var(--sidebar-background))] rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin mr-2">⟳</div>
              Loading transactions...
            </div>
          ) : !filteredTransactions || filteredTransactions.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              No transactions found.
            </div>
          ) : (
            <div className="divide-y divide-gray-300 dark:divide-[hsl(var(--highlight-background))]">
              {filteredTransactions.map(transaction => (
                transaction && (
                  <TransactionHistoryItem
                    key={transaction.id || `transaction-${Math.random()}`}
                    transaction={transaction}
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

export default TransactionHistoryPage; 