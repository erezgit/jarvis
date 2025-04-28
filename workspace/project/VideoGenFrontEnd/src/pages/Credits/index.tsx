import React, { useState } from 'react';
import { useTokenBalance } from '@/core/services/payment/hooks';
import { usePaymentHistory } from '@/core/services/payment/hooks';
import AddCreditsModal from './components/AddCreditsModal';
import PaymentHistoryTable from './components/PaymentHistoryTable';
import { toast } from 'react-hot-toast';
import { PageHeader } from '@/components/common/PageHeader';

/**
 * Consolidated billing page component that displays:
 * 1. Current credits and auto-billing status
 * 2. Payment history table
 * 3. Modal for adding credits via PayPal
 */
const BillingPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { balance, loading: balanceLoading, error: balanceError, refetch: refetchBalance } = useTokenBalance();
  
  const { 
    payments, 
    total,
    loading: paymentsLoading, 
    error: paymentsError,
    refetch: refetchPayments
  } = usePaymentHistory({
    limit: 10,
    offset: 0,
    autoFetch: true
  });

  // Calculate total pages
  const totalPages = Math.ceil(total / 10);
  const [currentPage, setCurrentPage] = useState(1);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Note: This would typically update the offset parameter in usePaymentHistory
    // but the current implementation doesn't support this directly
    // In a full implementation, we would add this functionality
  };

  // Open/close modal functions
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    refetchBalance();
    refetchPayments();
  };

  return (
    <div className="h-full overflow-hidden flex flex-col">
      <div className="flex-none px-10 pt-6">
        <PageHeader title="Credits" className="text-2xl font-bold tracking-tight" />
      </div>
      
      <div className="flex justify-center flex-1 overflow-auto">
        <div className="w-[1000px] py-8 max-w-full">
          {/* Credits Information Box */}
          <div className="bg-neutral-900 rounded-lg p-6 mb-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-gray-400 mb-2">Current credits</h2>
                <p className="text-2xl font-bold">{balanceLoading ? '...' : balance}</p>
              </div>
              <button 
                onClick={openModal}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Add credits
              </button>
            </div>
            
            {balanceError && (
              <div className="mt-4 p-3 bg-red-900 bg-opacity-20 border border-red-800 text-red-300 rounded-lg">
                Failed to load balance. Please try again.
              </div>
            )}
          </div>
          
          {/* Error display for payments */}
          {paymentsError && (
            <div className="mb-6 p-3 bg-red-900 bg-opacity-20 border border-red-800 text-red-300 rounded-lg">
              Failed to load payment history. Please try again.
            </div>
          )}
          
          {/* Payment History Table */}
          <div className="bg-neutral-900 rounded-lg overflow-hidden">
            <PaymentHistoryTable 
              payments={payments}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={paymentsLoading}
            />
          </div>
          
          {/* Bottom spacer to allow scrolling past the end of the table */}
          <div style={{ height: '80px' }}></div>
          
          {/* Add Credits Modal */}
          <AddCreditsModal 
            isOpen={isModalOpen} 
            onClose={closeModal} 
            onSuccess={(pkg) => {
              // Refresh token balance after successful payment
              refetchBalance();
              // Show success message
              toast(`Successfully added ${pkg.tokens} tokens to your account.`);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default BillingPage; 