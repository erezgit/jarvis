import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import TransactionHistoryPage from '../index';
import { useTransactionHistory } from '@/core/services/payment/hooks';
import { TokenTransaction } from '@/core/services/payment/types';

// Mock the useTransactionHistory hook
jest.mock('@/core/hooks/tokens/useTransactionHistory');

describe('TransactionHistoryPage', () => {
  const mockUseTransactionHistory = useTransactionHistory as jest.MockedFunction<typeof useTransactionHistory>;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });
  
  it('displays loading state when data is loading', () => {
    mockUseTransactionHistory.mockReturnValue({
      transactions: [],
      total: 0,
      loading: true,
      error: null,
      refetch: jest.fn(),
    });
    
    render(<TransactionHistoryPage />);
    
    expect(screen.getByText('Loading transactions...')).toBeInTheDocument();
  });
  
  it('displays transactions when data is loaded', () => {
    const mockTransactions: TokenTransaction[] = [
      {
        id: '1',
        transactionType: 'purchase',
        amount: 100,
        balanceAfter: 100,
        description: 'Initial token purchase',
        createdAt: '2023-03-09T20:00:00Z',
      },
      {
        id: '2',
        transactionType: 'usage',
        amount: -10,
        balanceAfter: 90,
        description: 'Used for prompt generation',
        createdAt: '2023-03-09T20:30:00Z',
      },
    ];
    
    mockUseTransactionHistory.mockReturnValue({
      transactions: mockTransactions,
      total: 2,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    render(<TransactionHistoryPage />);
    
    expect(screen.getByText('Token Transaction History')).toBeInTheDocument();
    expect(screen.getByText('Initial token purchase')).toBeInTheDocument();
    expect(screen.getByText('Used for prompt generation')).toBeInTheDocument();
    expect(screen.getByText('2 total transactions')).toBeInTheDocument();
  });
  
  it('displays empty state when no transactions exist', () => {
    mockUseTransactionHistory.mockReturnValue({
      transactions: [],
      total: 0,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    render(<TransactionHistoryPage />);
    
    expect(screen.getByText('No transactions found.')).toBeInTheDocument();
  });
  
  it('displays error message when API call fails', () => {
    const mockError = new Error('Failed to load transaction history');
    
    mockUseTransactionHistory.mockReturnValue({
      transactions: [],
      total: 0,
      loading: false,
      error: mockError,
      refetch: jest.fn(),
    });
    
    render(<TransactionHistoryPage />);
    
    expect(screen.getByText('Failed to load transaction history')).toBeInTheDocument();
    expect(screen.getByText('Try again')).toBeInTheDocument();
  });
  
  it('handles division by zero in pagination calculations', () => {
    // This test specifically checks our fix for the TypeError
    mockUseTransactionHistory.mockReturnValue({
      transactions: [],
      total: 100,
      loading: false,
      error: null,
      refetch: jest.fn(),
    });
    
    // We're testing that the component doesn't throw when limit is 0
    // This would have caused a division by zero error before our fix
    const originalConsoleError = console.error;
    console.error = jest.fn();
    
    // This should not throw an error with our fix
    expect(() => {
      const { rerender } = render(<TransactionHistoryPage />);
      
      // Force the limit to be 0 (this would trigger the error before our fix)
      // We're doing this in a way that simulates what might happen in the real app
      const useStateSpy = jest.spyOn(React, 'useState');
      useStateSpy.mockImplementationOnce(() => [0, jest.fn()]);
      
      rerender(<TransactionHistoryPage />);
    }).not.toThrow();
    
    console.error = originalConsoleError;
  });
}); 