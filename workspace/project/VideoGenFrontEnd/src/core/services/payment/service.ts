import { BaseService } from '@/core/services/base/BaseService';
import type { ServiceResult } from '@/core/types/service';
import type { ApiResponse, ApiError } from '@/core/types/api';
import {
  IPaymentService,
  PaymentResult,
  TokenBalanceResponse,
  TokenTransactionsResponse,
  PaymentHistoryResponse,
  PaymentMethodsResponse,
  PaymentMethod,
  TokenPackage,
  DEFAULT_TOKEN_PACKAGES,
  PaymentErrorCode,
  PaymentServiceError,
  TokenTransaction,
  TokenTransactionType,
  PaymentProvider
} from './types';
import { UnifiedApiClient } from '../api/unified-client';
import { ApiClientAdapter } from './api-adapter';
import { config } from '@/config/env';

/**
 * Payment Service
 * 
 * Domain: Token/Payment Management
 * Responsibility: Handles token purchases, payment processing, and token balance management
 * 
 * This service is part of the Payment domain and interacts with:
 * - Token Balance domain (for checking and updating balances)
 * - User domain (for user-specific payment methods)
 * 
 * It maintains clear boundaries by:
 * - Only handling payment-specific logic
 * - Delegating token usage tracking to the appropriate domain
 * - Not directly manipulating project or video data
 */
export class PaymentService extends BaseService implements IPaymentService {
  private static instance: PaymentService;
  private _apiClient: UnifiedApiClient;

  private constructor() {
    super();
    
    // Create UnifiedApiClient with the correct API URL from config
    this._apiClient = new UnifiedApiClient({
      baseUrl: config.apiBaseUrl,
      apiPath: config.apiPath,
      debug: process.env.NODE_ENV === 'development'
    });
    
    // Create adapter that matches BaseService.api interface
    const apiAdapter = new ApiClientAdapter(this._apiClient);
    
    // Use the adapter for BaseService methods
    this.handleRequest = this.handleRequestWithClient.bind(this);
    
    this.log('constructor', `PaymentService initialized with API URL: ${config.apiBaseUrl}`);
  }

  /**
   * Get the singleton instance of the PaymentService
   */
  public static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  /**
   * Custom implementation of handleRequest that uses our UnifiedApiClient
   */
  private async handleRequestWithClient<T>(
    request: () => Promise<ApiResponse<T> | ApiError>,
  ): Promise<ServiceResult<T>> {
    try {
      const response = await request();

      if (this.isApiError(response)) {
        throw new Error(response.message);
      }

      return { data: response.data, error: null };
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error'),
      };
    }
  }

  /**
   * Retry a function with exponential backoff
   * @param fn The function to retry
   * @param maxRetries Maximum number of retries
   * @param initialDelay Initial delay in milliseconds
   * @returns The result of the function
   */
  private async withRetry<T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    initialDelay = 300
  ): Promise<T> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');
        
        // Don't retry if we've reached the maximum number of retries
        if (attempt === maxRetries) {
          break;
        }
        
        // Calculate delay with exponential backoff
        const delay = initialDelay * Math.pow(2, attempt);
        
        // Log the retry
        this.log('withRetry', { 
          attempt, 
          maxRetries, 
          delay, 
          error: lastError.message 
        }, 'debug');
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    // If we get here, all retries failed
    throw lastError || new Error('All retries failed');
  }

  /**
   * Validate an API response
   * @param response The API response to validate
   * @returns Validation result
   */
  private validateApiResponse<T>(
    response: ApiResponse<T> | ApiError
  ): { valid: boolean; data?: T; error?: string } {
    if (this.isApiError(response)) {
      return { 
        valid: false, 
        error: response.message || 'API returned an error' 
      };
    }
    
    if (!response || typeof response !== 'object') {
      return { 
        valid: false, 
        error: 'Invalid response format (not an object)' 
      };
    }
    
    if (!('data' in response)) {
      return { 
        valid: false, 
        error: 'Invalid response format (missing data property)' 
      };
    }
    
    return { valid: true, data: response.data };
  }

  /**
   * Create a standardized service error
   * @param code Error code
   * @param message Error message
   * @param status HTTP status code
   * @param details Additional error details
   * @returns Standardized service error
   */
  private createServiceError(
    code: PaymentErrorCode,
    message: string,
    status = 500,
    details?: Record<string, unknown>
  ): PaymentServiceError {
    const error = new Error(message) as PaymentServiceError;
    error.code = code;
    error.status = status;
    
    if (details) {
      error.details = details;
    }
    
    return error;
  }

  /**
   * Map an error to a standardized service error
   * @param error The error to map
   * @returns Standardized service error
   */
  private mapToServiceError(error: unknown): PaymentServiceError {
    if (error && typeof error === 'object' && 'code' in error && 'message' in error) {
      // Already a service error
      return error as PaymentServiceError;
    }
    
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    
    // Map to appropriate error code based on message
    let code = PaymentErrorCode.SERVER_ERROR;
    let status = 500;
    
    if (message.includes('network') || message.includes('fetch')) {
      code = PaymentErrorCode.NETWORK_ERROR;
      status = 0; // Network errors don't have a status code
    } else if (message.includes('unauthorized') || message.includes('401')) {
      code = PaymentErrorCode.UNAUTHORIZED;
      status = 401;
    } else if (message.includes('not found') || message.includes('404')) {
      code = PaymentErrorCode.ORDER_NOT_FOUND;
      status = 404;
    }
    
    return this.createServiceError(code, message, status);
  }

  /**
   * Track an error for monitoring and analytics
   * @param category Error category
   * @param error The error object
   * @param metadata Additional metadata
   */
  private trackError(
    category: string,
    error: unknown,
    metadata?: Record<string, unknown>
  ): void {
    // Log the error
    this.log(`trackError:${category}`, { error, metadata }, 'error');
    
    // Send to error tracking service if available
    if (window.errorTracker && typeof window.errorTracker.captureException === 'function') {
      try {
        window.errorTracker.captureException(error, {
          tags: { category, service: 'PaymentService' },
          extra: metadata
        });
      } catch (e) {
        console.error('Failed to send error to error tracker:', e);
      }
    }
    
    // Record error metrics if available
    if (window.metrics && typeof window.metrics.increment === 'function') {
      try {
        window.metrics.increment('payment_service.error', {
          category,
          code: error && typeof error === 'object' && 'code' in error 
            ? (error as PaymentServiceError).code 
            : 'unknown'
        });
      } catch (e) {
        console.error('Failed to record error metrics:', e);
      }
    }
  }

  /**
   * Create a payment order for a token package
   * 
   * @param packageId The ID of the token package to purchase
   * @param provider The payment provider to use (default: 'mock')
   * @returns A ServiceResult containing the order ID if successful, or an error if the operation failed
   */
  public async createOrder(
    packageId: string, 
    provider: PaymentProvider = PaymentProvider.MOCK
  ): Promise<ServiceResult<string>> {
    this.log('createOrder', { packageId, provider });

    try {
      // Use a relative endpoint path without the /api/ prefix to avoid duplication
      const endpoint = 'payments/createOrder';
      
      // Log the request details with more information
      this.log('createOrder:request', { 
        endpoint,
        fullUrl: this._apiClient.getFullApiUrl(endpoint), // Log the full URL for debugging
        method: 'POST', 
        body: { packageId, provider },
        apiBaseUrl: config.apiBaseUrl,
        apiPath: config.apiPath,
        environment: config.environment
      }, 'debug');

      // Make the API call with retry logic for transient errors
      const response = await this.withRetry(() => 
        this._apiClient.post<{ orderId: string }>(endpoint, { packageId, provider })
      );
      
      // Log the raw response for debugging
      this.log('createOrder:rawResponse', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        isError: this.isApiError(response),
        response: JSON.stringify(response).substring(0, 500) // Log part of the response for debugging
      }, 'debug');
      
      // Validate the response structure
      const validation = this.validateApiResponse<{ orderId: string }>(response);
      
      if (!validation.valid) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          validation.error || 'Invalid response format',
          400
        );
        
        this.log('createOrder:validationError', { error }, 'error');
        return { data: null, error };
      }
      
      // Extract the data safely
      const data = validation.data!;
      
      // Validate the orderId property
      if (typeof data.orderId !== 'string' || !data.orderId) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          'Invalid or missing orderId in response',
          400
        );
        
        this.log('createOrder:invalidOrderId', { 
          orderId: data.orderId,
          type: typeof data.orderId,
          error
        }, 'error');
        
        return { data: null, error };
      }
      
      // Log the success
      this.log('createOrder:success', { orderId: data.orderId, provider }, 'info');
      
      // Return the successful result
      return {
        data: data.orderId,
        error: null,
      };
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      this.log('createOrder:error', { 
        error,
        message: errorMessage,
        packageId,
        provider
      }, 'error');
      
      // Convert to standardized service error
      const serviceError = this.mapToServiceError(error);
      
      // Return a standardized error result
      return {
        data: null,
        error: serviceError,
      };
    }
  }

  /**
   * Capture payment for an order
   * 
   * This method completes the payment process for an order that was previously created.
   * It communicates with the backend API to process the payment and update the token balance.
   * 
   * @param orderId The ID of the order to capture payment for
   * @returns A ServiceResult containing the payment result if successful, or an error if the operation failed
   */
  public async capturePayment(orderId: string): Promise<ServiceResult<PaymentResult>> {
    this.log('capturePayment', { orderId });

    try {
      // Use a relative endpoint path without the /api/ prefix to avoid duplication
      const endpoint = 'payments/capturePayment';
      
      // Log the request details with more information
      this.log('capturePayment:request', { 
        endpoint,
        fullUrl: this._apiClient.getFullApiUrl(endpoint), // Log the full URL for debugging
        method: 'POST', 
        body: { orderId },
        apiBaseUrl: config.apiBaseUrl,
        apiPath: config.apiPath,
        environment: config.environment
      }, 'debug');

      // Make the API call with retry logic for transient errors
      const response = await this.withRetry(() => 
        this._apiClient.post<PaymentResult>(endpoint, { orderId })
      );
      
      // Log the raw response for debugging
      this.log('capturePayment:rawResponse', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        isError: this.isApiError(response),
        response: JSON.stringify(response).substring(0, 500) // Log part of the response for debugging
      }, 'debug');
      
      // Validate the response structure
      const validation = this.validateApiResponse<PaymentResult>(response);
      
      if (!validation.valid) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          validation.error || 'Invalid response format',
          400
        );
        
        this.log('capturePayment:validationError', { error }, 'error');
        return { data: null, error };
      }
      
      // Extract the data safely
      const data = validation.data!;
      
      // Log the success
      this.log('capturePayment:success', { 
        success: data.success,
        transactionId: data.transactionId,
        status: data.status,
        tokens: data.tokens,
        newBalance: data.newBalance
      }, 'info');
      
      // Return the successful result
      return {
        data,
        error: null,
      };
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      this.log('capturePayment:error', { 
        error,
        message: errorMessage,
        orderId
      }, 'error');
      
      // Convert to standardized service error
      const serviceError = this.mapToServiceError(error);
      
      // Return a standardized error result
      return {
        data: null,
        error: serviceError,
      };
    }
  }

  /**
   * Get the user's current token balance
   * @returns A ServiceResult containing the token balance or an error
   */
  public async getTokenBalance(): Promise<ServiceResult<TokenBalanceResponse>> {
    this.log('getTokenBalance', 'Fetching token balance');

    try {
      // Make the API call with retry logic for transient errors
      const response = await this.withRetry(() => 
        this._apiClient.get<TokenBalanceResponse>('/api/payments/tokens/balance')
      );
      
      // Log the raw response for debugging
      this.log('getTokenBalance:rawResponse', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        isError: this.isApiError(response)
      }, 'debug');
      
      // Validate the response structure
      const validation = this.validateApiResponse<TokenBalanceResponse>(response);
      
      if (!validation.valid) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          validation.error || 'Invalid response format',
          400
        );
        
        this.log('getTokenBalance:validationError', { error }, 'error');
        return { data: null, error };
      }
      
      // Extract the data safely
      const data = validation.data!;
      
      // Log the success
      this.log('getTokenBalance:success', { balance: data.balance }, 'info');
      
      // Return the successful result
      return {
        data,
        error: null,
      };
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      this.log('getTokenBalance:error', { 
        error,
        message: errorMessage
      }, 'error');
      
      // Convert to standardized service error
      const serviceError = this.mapToServiceError(error);
      
      // Return a standardized error result
      return {
        data: null,
        error: serviceError,
      };
    }
  }

  /**
   * Get the user's token transaction history
   * @param limit Optional limit for the number of transactions to return
   * @param offset Optional offset for pagination
   * @returns A ServiceResult containing the token transactions or an error
   */
  public async getTokenTransactions(limit = 10, offset = 0): Promise<ServiceResult<TokenTransactionsResponse>> {
    this.log('getTokenTransactions', { limit, offset });

    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());
      
      // Add cache-busting parameter to prevent 304 responses
      params.append('_t', Date.now().toString());

      const queryString = params.toString();
      const url = `/api/payments/tokens/transactions${queryString ? `?${queryString}` : ''}`;
      
      this.log('getTokenTransactions:request', { url }, 'debug');
      
      // Make the API call with retry logic for transient errors
      const response = await this.withRetry(() => 
        this._apiClient.get<TokenTransactionsResponse | TokenTransaction[]>(url)
      );
      
      // Log the raw response for debugging
      this.log('getTokenTransactions:rawResponse', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        isError: this.isApiError(response)
      }, 'debug');
      
      // Check if the response is an HTML error (isHtmlResponse property added by our enhanced UnifiedApiClient)
      if (this.isApiError(response) && (response as ApiError & { isHtmlResponse?: boolean }).isHtmlResponse) {
        this.log('getTokenTransactions:htmlResponse', 'API returned HTML instead of JSON, using mock data', 'warn');
        
        // Return mock data for development
        return this.getMockTokenTransactions(limit, offset);
      }
      
      // Validate the response structure
      const validation = this.validateApiResponse<TokenTransactionsResponse | TokenTransaction[]>(response);
      
      if (!validation.valid) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          validation.error || 'Invalid response format',
          400
        );
        
        this.log('getTokenTransactions:validationError', { error }, 'error');
        this.trackError('getTokenTransactions', error, { limit, offset });
        return { data: null, error };
      }
      
      // Extract the data safely
      const data = validation.data!;
      
      this.log('getTokenTransactions:data', { 
        dataType: typeof data,
        isArray: Array.isArray(data)
      }, 'debug');
      
      // Handle both response formats
      if (Array.isArray(data)) {
        // If the API returns an empty array, return an empty transactions list
        if (data.length === 0) {
          this.log('getTokenTransactions:emptyArray', 'API returned empty array', 'debug');
          return {
            data: {
              transactions: [],
              total: 0
            },
            error: null,
          };
        }
        
        // Validate each transaction in the array
        const validatedTransactions = data.map(transaction => {
          // Ensure all required fields are present
          return {
            id: transaction.id || '',
            transactionType: transaction.transactionType || 'unknown',
            amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
            balanceAfter: typeof transaction.balanceAfter === 'number' ? transaction.balanceAfter : 0,
            description: transaction.description || '',
            paymentId: transaction.paymentId || null,
            createdAt: transaction.createdAt || new Date().toISOString()
          };
        });
        
        this.log('getTokenTransactions:transformingArrayResponse', { 
          transactionsCount: validatedTransactions.length 
        }, 'debug');
        
        return {
          data: {
            transactions: validatedTransactions,
            total: validatedTransactions.length
          },
          error: null,
        };
      } else {
        // If the API returns the expected format, validate the transactions array
        const transactions = data.transactions || [];
        
        // Validate each transaction in the array
        const validatedTransactions = transactions.map(transaction => {
          // Ensure all required fields are present
          return {
            id: transaction.id || '',
            transactionType: transaction.transactionType || 'unknown',
            amount: typeof transaction.amount === 'number' ? transaction.amount : 0,
            balanceAfter: typeof transaction.balanceAfter === 'number' ? transaction.balanceAfter : 0,
            description: transaction.description || '',
            paymentId: transaction.paymentId || null,
            createdAt: transaction.createdAt || new Date().toISOString()
          };
        });
        
        this.log('getTokenTransactions:success', { 
          transactionsCount: validatedTransactions.length,
          total: data.total || validatedTransactions.length
        }, 'info');
        
        return {
          data: {
            transactions: validatedTransactions,
            total: data.total || validatedTransactions.length
          },
          error: null,
        };
      }
    } catch (error) {
      // Enhanced error handling
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      this.log('getTokenTransactions:error', { 
        error,
        message: errorMessage,
        limit,
        offset
      }, 'error');
      
      this.trackError('getTokenTransactions', error, { limit, offset });
      
      // Convert to standardized service error
      const serviceError = this.mapToServiceError(error);
      
      // Return a standardized error result
      return {
        data: null,
        error: serviceError,
      };
    }
  }

  /**
   * Get mock token transactions for development
   * @param limit Number of transactions to return
   * @param offset Pagination offset
   * @returns A ServiceResult containing mock token transactions
   */
  private getMockTokenTransactions(limit = 10, offset = 0): ServiceResult<TokenTransactionsResponse> {
    // Create mock transactions based on the TokenTransactionType enum
    const mockTransactions: TokenTransaction[] = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: TokenTransactionType.PURCHASE,
        amount: 100,
        balanceAfter: 100,
        description: 'Initial token purchase',
        paymentId: 'pay_123e4567e89b12d3a456',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        transactionType: TokenTransactionType.USAGE,
        amount: -10,
        balanceAfter: 90,
        description: 'Used for prompt generation',
        paymentId: null,
        createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6 days ago
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174002',
        transactionType: TokenTransactionType.ADMIN_ADJUSTMENT,
        amount: 50,
        balanceAfter: 140,
        description: 'Bonus tokens for early adopter',
        paymentId: null,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5 days ago
      },
      {
        id: '423e4567-e89b-12d3-a456-426614174003',
        transactionType: TokenTransactionType.USAGE,
        amount: -15,
        balanceAfter: 125,
        description: 'Used for video generation',
        paymentId: null,
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4 days ago
      },
      {
        id: '523e4567-e89b-12d3-a456-426614174004',
        transactionType: TokenTransactionType.BONUS,
        amount: 25,
        balanceAfter: 150,
        description: 'Referral bonus',
        paymentId: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: '623e4567-e89b-12d3-a456-426614174005',
        transactionType: TokenTransactionType.USAGE,
        amount: -20,
        balanceAfter: 130,
        description: 'Used for image generation',
        paymentId: null,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days ago
      },
      {
        id: '723e4567-e89b-12d3-a456-426614174006',
        transactionType: TokenTransactionType.PURCHASE,
        amount: 200,
        balanceAfter: 330,
        description: 'Standard package purchase',
        paymentId: 'pay_223e4567e89b12d3a456',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      },
      {
        id: '823e4567-e89b-12d3-a456-426614174007',
        transactionType: TokenTransactionType.USAGE,
        amount: -30,
        balanceAfter: 300,
        description: 'Used for premium feature',
        paymentId: null,
        createdAt: new Date().toISOString() // today
      }
    ];

    // Apply pagination
    const paginatedTransactions = mockTransactions.slice(offset, offset + limit);
    
    this.log('getMockTokenTransactions', { 
      totalMockTransactions: mockTransactions.length,
      returnedTransactions: paginatedTransactions.length,
      limit,
      offset
    }, 'debug');
    
    return {
      data: {
        transactions: paginatedTransactions,
        total: mockTransactions.length
      },
      error: null
    };
  }

  /**
   * Get the auth token for API requests
   * @returns The authentication token
   */
  private async getAuthToken(): Promise<string> {
    try {
      // Try to get the token from the TokenService in the window object
      // @ts-ignore - TokenService might be available globally
      const tokenService = window.TokenService || window.tokenService;
      if (tokenService && typeof tokenService.getAccessToken === 'function') {
        try {
          const token = await tokenService.getAccessToken();
          if (token) return token;
        } catch (e) {
          console.warn('Error getting token from TokenService:', e);
        }
      }
      
      // Try to get the token from localStorage
      const localToken = localStorage.getItem('auth_token') || localStorage.getItem('token');
      if (localToken) return localToken;
      
      // Try to get the token from sessionStorage
      const sessionToken = sessionStorage.getItem('auth_token') || sessionStorage.getItem('token');
      if (sessionToken) return sessionToken;
      
      // If all else fails, return an empty string
      console.warn('No auth token found');
      return '';
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return '';
    }
  }

  /**
   * Get the user's payment history
   * @param limit Optional limit for the number of payments to return
   * @param offset Optional offset for pagination
   * @returns A ServiceResult containing the payment history or an error
   */
  public async getPaymentHistory(limit = 10, offset = 0): Promise<ServiceResult<PaymentHistoryResponse>> {
    this.log('getPaymentHistory', { limit, offset });

    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit.toString());
      if (offset) params.append('offset', offset.toString());

      const queryString = params.toString();
      const url = `/api/payments/history${queryString ? `?${queryString}` : ''}`;
      
      this.log('getPaymentHistory', { url }, 'debug');
      
      // Use the API client to make the request with retry logic
      const response = await this.withRetry(() => 
        this._apiClient.get<PaymentHistoryResponse>(url)
      );
      
      // Log the raw response for debugging
      this.log('getPaymentHistory:rawResponse', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        isError: this.isApiError(response)
      }, 'debug');
      
      // Check if the response is an HTML error
      if (this.isApiError(response) && (response as ApiError & { isHtmlResponse?: boolean }).isHtmlResponse) {
        this.log('getPaymentHistory:htmlResponse', 'API returned HTML instead of JSON, using mock data', 'warn');
        
        // Return mock data for development
        return this.getMockPaymentHistory(limit, offset);
      }
      
      // Validate the response structure
      const validation = this.validateApiResponse<PaymentHistoryResponse>(response);
      
      if (!validation.valid) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          validation.error || 'Invalid response format',
          400
        );
        
        this.log('getPaymentHistory:validationError', { error }, 'error');
        this.trackError('getPaymentHistory', error, { limit, offset });
        return { data: null, error };
      }
      
      // Extract the data safely
      const data = validation.data!;
      
      // Ensure payments is an array
      if (!Array.isArray(data.payments)) {
        data.payments = [];
      }
      
      // Ensure total is a number
      if (typeof data.total !== 'number') {
        data.total = data.payments.length;
      }
      
      this.log('getPaymentHistory', { responseData: data.payments }, 'debug');
      
      return {
        data,
        error: null,
      };
    } catch (error) {
      this.log('getPaymentHistory', { error }, 'error');
      this.trackError('getPaymentHistory', error, { limit, offset });
      return {
        data: null,
        error: this.mapToServiceError(error),
      };
    }
  }
  
  /**
   * Get mock payment history for development
   * @param limit Number of payments to return
   * @param offset Pagination offset
   * @returns A ServiceResult containing mock payment history
   */
  private getMockPaymentHistory(limit = 10, offset = 0): ServiceResult<PaymentHistoryResponse> {
    // Create mock payments
    const mockPayments = [
      {
        id: '123e4567-e89b-12d3-a456-426614174000',
        paymentProvider: 'Stripe',
        amount: 10,
        currency: 'USD',
        status: 'SUCCEEDED' as PaymentStatus,
        tokensPurchased: 160,
        packageId: 'basic',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days ago
      },
      {
        id: '223e4567-e89b-12d3-a456-426614174001',
        paymentProvider: 'Stripe',
        amount: 25,
        currency: 'USD',
        status: 'SUCCEEDED' as PaymentStatus,
        tokensPurchased: 425,
        packageId: 'standard',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
      },
      {
        id: '323e4567-e89b-12d3-a456-426614174002',
        paymentProvider: 'PayPal',
        amount: 50,
        currency: 'USD',
        status: 'SUCCEEDED' as PaymentStatus,
        tokensPurchased: 900,
        packageId: 'premium',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
      }
    ];

    // Apply pagination
    const paginatedPayments = mockPayments.slice(offset, offset + limit);
    
    this.log('getMockPaymentHistory', { 
      totalMockPayments: mockPayments.length,
      returnedPayments: paginatedPayments.length,
      limit,
      offset
    }, 'debug');
    
    return {
      data: {
        payments: paginatedPayments,
        total: mockPayments.length
      },
      error: null
    };
  }

  /**
   * Get the user's payment methods
   * @returns A ServiceResult containing the payment methods or an error
   */
  public async getPaymentMethods(): Promise<ServiceResult<PaymentMethodsResponse>> {
    this.log('getPaymentMethods', 'Fetching payment methods');

    try {
      const response = await this._apiClient.get<PaymentMethodsResponse>('/api/payments/methods');
      
      if (this.isApiError(response)) {
        this.log('getPaymentMethods', { error: response }, 'error');
        this.trackError('getPaymentMethods', response, {});
        throw new Error(response.message);
      }
      
      this.log('getPaymentMethods', { responseData: response.data }, 'debug');
      
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      this.log('getPaymentMethods', { error }, 'error');
      this.trackError('getPaymentMethods', error, {});
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Add a payment method
   * @param paymentMethodId The payment method ID to add
   * @returns A ServiceResult containing the added payment method or an error
   */
  public async addPaymentMethod(paymentMethodId: string): Promise<ServiceResult<PaymentMethod>> {
    this.log('addPaymentMethod', { paymentMethodId });

    try {
      const response = await this._apiClient.post<PaymentMethod>('/api/payments/methods', { 
        paymentMethodId 
      });
      
      if (this.isApiError(response)) {
        this.log('addPaymentMethod', { error: response }, 'error');
        this.trackError('addPaymentMethod', response, { paymentMethodId });
        throw new Error(response.message);
      }
      
      this.log('addPaymentMethod', { responseData: response.data }, 'debug');
      
      return {
        data: response.data,
        error: null,
      };
    } catch (error) {
      this.log('addPaymentMethod', { error }, 'error');
      this.trackError('addPaymentMethod', error, { paymentMethodId });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Remove a payment method
   * @param methodId The payment method ID to remove
   * @returns A ServiceResult containing void or an error
   */
  public async removePaymentMethod(methodId: string): Promise<ServiceResult<void>> {
    this.log('removePaymentMethod', { methodId });

    try {
      const response = await this._apiClient.delete<void>(`/api/payments/methods/${methodId}`);
      
      if (this.isApiError(response)) {
        this.log('removePaymentMethod', { error: response }, 'error');
        this.trackError('removePaymentMethod', response, { methodId });
        throw new Error(response.message);
      }
      
      this.log('removePaymentMethod', { success: true }, 'debug');
      
      return {
        data: undefined,
        error: null,
      };
    } catch (error) {
      this.log('removePaymentMethod', { error }, 'error');
      this.trackError('removePaymentMethod', error, { methodId });
      return {
        data: null,
        error: error instanceof Error ? error : new Error('Unknown error occurred'),
      };
    }
  }

  /**
   * Get the available token packages
   * @returns Array of token packages
   */
  public getTokenPackages(): TokenPackage[] {
    return DEFAULT_TOKEN_PACKAGES;
  }

  /**
   * Get a token package by ID
   * @param id The ID of the token package
   * @returns The token package, or null if not found
   */
  public getTokenPackageById(id: string): Promise<TokenPackage | null> {
    this.log('getTokenPackageById', `Getting token package with ID: ${id}`);
    
    // Find the package in the default packages
    const pkg = this.getTokenPackages().find(p => p.id === id);
    
    return Promise.resolve(pkg || null);
  }

  /**
   * Capture a PayPal payment
   * 
   * This method completes the payment process for a PayPal order that was previously created.
   * It communicates with the backend API to process the payment and update the token balance.
   * 
   * @param orderId The ID of the PayPal order to capture
   * @returns A ServiceResult containing the payment result if successful, or an error if the operation failed
   */
  public async capturePayPalPayment(orderId: string): Promise<ServiceResult<PaymentResult>> {
    this.log('capturePayPalPayment', { orderId });

    try {
      const endpoint = 'payments/paypal/capturePayment';
      
      this.log('capturePayPalPayment:request', { 
        endpoint,
        fullUrl: this._apiClient.getFullApiUrl(endpoint),
        method: 'POST', 
        body: { orderId },
        apiBaseUrl: config.apiBaseUrl,
        apiPath: config.apiPath,
        environment: config.environment
      }, 'debug');

      const response = await this.withRetry(() => 
        this._apiClient.post<PaymentResult>(endpoint, { orderId })
      );
      
      this.log('capturePayPalPayment:rawResponse', {
        responseType: typeof response,
        hasData: response && 'data' in response,
        isError: this.isApiError(response),
        response: JSON.stringify(response).substring(0, 500)
      }, 'debug');
      
      const validation = this.validateApiResponse<PaymentResult>(response);
      
      if (!validation.valid) {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          validation.error || 'Invalid response format',
          400
        );
        
        this.log('capturePayPalPayment:validationError', { error }, 'error');
        return { data: null, error };
      }
      
      const data = validation.data!;
      
      // Validate the payment result
      if (typeof data.success !== 'boolean' || 
          typeof data.transactionId !== 'string' || 
          !data.transactionId ||
          typeof data.tokens !== 'number' ||
          typeof data.newBalance !== 'number') {
        const error = this.createServiceError(
          PaymentErrorCode.RESPONSE_FORMAT_ERROR,
          'Invalid payment result format',
          400
        );
        
        this.log('capturePayPalPayment:invalidResult', { 
          result: data,
          error
        }, 'error');
        
        return { data: null, error };
      }
      
      // Set the provider to PayPal
      data.provider = PaymentProvider.PAYPAL;
      
      this.log('capturePayPalPayment:success', { 
        transactionId: data.transactionId,
        success: data.success,
        tokens: data.tokens,
        newBalance: data.newBalance
      }, 'info');
      
      return {
        data,
        error: null,
      };
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Unknown error occurred';
      
      this.log('capturePayPalPayment:error', { 
        error,
        message: errorMessage,
        orderId
      }, 'error');
      
      const serviceError = this.mapToServiceError(error);
      
      return {
        data: null,
        error: serviceError,
      };
    }
  }

  protected log(method: string, data: unknown, level: 'debug' | 'error' | 'info' | 'warn' = 'info'): void {
    // Only log debug messages in development
    if (level === 'debug' && process.env.NODE_ENV !== 'development') {
      return;
    }
    
    if (level === 'warn') {
      console.warn(`[${this.constructor.name}] ${method}:`, data);
    } else {
      console[level](`[${this.constructor.name}] ${method}:`, data);
    }
  }
}