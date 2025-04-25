import React from 'react';
import { formatDate } from '@/utils/date';
import type { PaymentHistoryItem } from '@/core/services/payment/types';

/**
 * Props for the PaymentHistoryTable component
 */
interface PaymentHistoryTableProps {
  payments: PaymentHistoryItem[];
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

/**
 * Table component for displaying payment history
 * Includes pagination controls
 */
const PaymentHistoryTable: React.FC<PaymentHistoryTableProps> = ({
  payments,
  currentPage,
  totalPages,
  onPageChange,
  loading = false
}) => {
  return (
    <>
      <h2 className="p-4 text-xl font-medium">Payments</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-neutral-800">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Amount charged</th>
              <th className="px-4 py-3 text-left">Credits purchased</th>
              <th className="px-4 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                </td>
              </tr>
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <tr key={payment.id}>
                  <td className="px-4 py-4">
                    {formatDate(payment.createdAt)}
                  </td>
                  <td className="px-4 py-4">
                    ${payment.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    {payment.tokensPurchased}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <button 
                      className="text-gray-400 hover:text-white"
                      aria-label="More options"
                    >
                      ⋯
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No payment history found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-between items-center p-4 bg-neutral-800">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1 || loading}
            className={`px-3 py-1 rounded ${
              currentPage <= 1 || loading
                ? 'bg-neutral-700 text-gray-500 cursor-not-allowed' 
                : 'bg-neutral-700 text-white hover:bg-neutral-600'
            }`}
          >
            Previous
          </button>
          
          <span className="text-gray-400">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages || loading}
            className={`px-3 py-1 rounded ${
              currentPage >= totalPages || loading
                ? 'bg-neutral-700 text-gray-500 cursor-not-allowed' 
                : 'bg-neutral-700 text-white hover:bg-neutral-600'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default PaymentHistoryTable; 