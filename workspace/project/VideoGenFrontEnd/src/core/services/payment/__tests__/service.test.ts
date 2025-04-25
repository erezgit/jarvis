import { PaymentService } from '../service';
import { PaymentErrorCode } from '../types';

// Mock the API client
jest.mock('@/core/services/api/factory', () => ({
  getApiClient: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
  })),
  getUnifiedApiClient: jest.fn(() => ({
    post: jest.fn(),
    get: jest.fn(),
  })),
}));

describe('PaymentService', () => {
  let service: PaymentService;
  let mockApi: any;
  
  beforeEach(() => {
    // Get the service instance
    service = PaymentService.getInstance();
    
    // Access the mocked API client
    mockApi = (service as any).api;
  });
  
  afterEach(() => {
    jest.clearAllMocks();
  });
  
  describe('createOrder', () => {
    it('should successfully create an order', async () => {
      // Arrange
      const packageId = 'basic';
      const orderId = 'mock_order_123';
      mockApi.post.mockResolvedValue({
        data: { orderId }
      });
      
      // Act
      const result = await service.createOrder(packageId);
      
      // Assert
      expect(result.data).toBe(orderId);
      expect(result.error).toBeNull();
      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/payments/createOrder',
        { packageId }
      );
    });
    
    it('should handle API errors', async () => {
      // Arrange
      const packageId = 'basic';
      const errorMessage = 'Invalid package ID';
      mockApi.post.mockResolvedValue({
        message: errorMessage,
        status: 400
      });
      
      // Act
      const result = await service.createOrder(packageId);
      
      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe(errorMessage);
      expect((result.error as any).code).toBe(PaymentErrorCode.RESPONSE_FORMAT_ERROR);
    });
    
    it('should handle missing orderId in response', async () => {
      // Arrange
      const packageId = 'basic';
      mockApi.post.mockResolvedValue({
        data: { /* no orderId */ }
      });
      
      // Act
      const result = await service.createOrder(packageId);
      
      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Invalid or missing orderId');
      expect((result.error as any).code).toBe(PaymentErrorCode.RESPONSE_FORMAT_ERROR);
    });
    
    it('should handle network errors and retry', async () => {
      // Arrange
      const packageId = 'basic';
      const orderId = 'mock_order_123';
      const networkError = new TypeError('Failed to fetch');
      
      // Mock first call to fail, second to succeed
      mockApi.post
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce({
          data: { orderId }
        });
      
      // Act
      const result = await service.createOrder(packageId);
      
      // Assert
      expect(result.data).toBe(orderId);
      expect(result.error).toBeNull();
      expect(mockApi.post).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('capturePayment', () => {
    it('should successfully capture a payment', async () => {
      // Arrange
      const orderId = 'mock_order_123';
      const paymentResult = {
        success: true,
        transactionId: 'mock_transaction_123',
        status: 'SUCCEEDED',
        tokens: 160,
        newBalance: 160
      };
      mockApi.post.mockResolvedValue({
        data: paymentResult
      });
      
      // Act
      const result = await service.capturePayment(orderId);
      
      // Assert
      expect(result.data).toEqual(paymentResult);
      expect(result.error).toBeNull();
      expect(mockApi.post).toHaveBeenCalledWith(
        '/api/payments/capturePayment',
        { orderId }
      );
    });
    
    it('should handle payment failure', async () => {
      // Arrange
      const orderId = 'mock_order_123';
      const errorMessage = 'Payment processing failed';
      mockApi.post.mockResolvedValue({
        message: errorMessage,
        status: 400
      });
      
      // Act
      const result = await service.capturePayment(orderId);
      
      // Assert
      expect(result.data).toBeNull();
      expect(result.error).toBeDefined();
      expect((result.error as any).code).toBe(PaymentErrorCode.RESPONSE_FORMAT_ERROR);
    });
  });
  
  describe('getTokenBalance', () => {
    it('should successfully get token balance', async () => {
      // Arrange
      const balance = 500;
      mockApi.get.mockResolvedValue({
        data: { balance }
      });
      
      // Act
      const result = await service.getTokenBalance();
      
      // Assert
      expect(result.data).toEqual({ balance });
      expect(result.error).toBeNull();
      expect(mockApi.get).toHaveBeenCalledWith('/api/payments/tokens/balance');
    });
  });
}); 