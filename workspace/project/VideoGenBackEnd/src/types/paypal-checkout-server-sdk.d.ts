declare module '@paypal/checkout-server-sdk' {
  namespace core {
    class PayPalHttpClient {
      constructor(environment: Environment);
      execute<T>(request: any): Promise<{ result: T }>;
    }
    
    interface Environment {}
    
    class SandboxEnvironment implements Environment {
      constructor(clientId: string, clientSecret: string);
    }
    
    class LiveEnvironment implements Environment {
      constructor(clientId: string, clientSecret: string);
    }
  }
  
  namespace orders {
    class OrdersCreateRequest {
      prefer(preference: string): void;
      requestBody(body: any): void;
    }
    
    class OrdersCaptureRequest {
      constructor(orderId: string);
      prefer(preference: string): void;
    }
    
    interface OrderResponse {
      id: string;
      status: string;
      purchase_units: Array<{
        payments: {
          captures: Array<{
            id: string;
          }>;
        };
      }>;
    }
  }
} 