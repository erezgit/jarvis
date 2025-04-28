import React, { createContext, useState, useEffect, useContext, useRef } from 'react';
import { loadPayPalScript, isPayPalLoaded, PayPalNamespace } from '@/utils/paypal/sdk-loader';

// Define the PayPal SDK context type
interface PayPalSDKContextType {
  isLoaded: boolean;
  isLoading: boolean;
  error: Error | null;
  paypal: PayPalNamespace | null;
  reload: () => Promise<void>;
}

// Create context for PayPal SDK state
const PayPalSDKContext = createContext<PayPalSDKContextType>({
  isLoaded: false,
  isLoading: false,
  error: null,
  paypal: null,
  reload: async () => {}
});

/**
 * Hook for consuming PayPal SDK context
 */
export const usePayPalSDK = () => useContext(PayPalSDKContext);

// Define the default PayPal SDK options
export const DEFAULT_PAYPAL_OPTIONS = {
  'components': 'buttons',
  'enable-funding': 'card',
  'debug': 'true'
};

interface PayPalSDKProviderProps {
  children: React.ReactNode;
  options?: Record<string, string>;
}

/**
 * Provider component that loads PayPal SDK once and shares it with all child components
 */
export const PayPalSDKProvider: React.FC<PayPalSDKProviderProps> = ({ 
  children, 
  options = DEFAULT_PAYPAL_OPTIONS 
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(isPayPalLoaded());
  const [error, setError] = useState<Error | null>(null);
  const [paypal, setPaypal] = useState<PayPalNamespace | null>(
    window.paypal ? (window.paypal as unknown as PayPalNamespace) : null
  );
  const loadAttempts = useRef(0);
  const MAX_LOAD_ATTEMPTS = 3;
  
  // Add a debug message for logging purposes
  const debugInfo = useRef<string>('');
  
  // Load SDK function that can be called on demand
  const loadSDK = async (forceReload = false) => {
    // Skip if already loading
    if (isLoading) {
      console.log('[PayPalSDKProvider] SDK already loading, skipping duplicate load request');
      return;
    }
    
    // Skip if already loaded and not forcing reload
    if (isLoaded && window.paypal && !forceReload) {
      console.log('[PayPalSDKProvider] PayPal SDK already loaded and available');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Increment attempt counter
      loadAttempts.current += 1;
      
      // Log environment variables for debugging
      console.log('[PayPalSDKProvider] Environment variables check:', {
        VITE_PAYPAL_CLIENT_ID_SANDBOX: import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX,
        MODE: import.meta.env.MODE,
        DEV: import.meta.env.DEV,
        PROD: import.meta.env.PROD
      });
      
      // Log attempt information
      console.log(`[PayPalSDKProvider] Loading PayPal SDK (attempt ${loadAttempts.current}/${MAX_LOAD_ATTEMPTS}) with options:`, options);
      
      // Extract client ID directly from env variables
      const clientId = import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || 
                      'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9';
      
      console.log('[PayPalSDKProvider] Using client ID:', clientId);
      
      // Instead of using the loadPayPalScript helper, directly load the script here
      // for better control and debugging
      const scriptId = 'paypal-script';
      
      // Clean up any existing script first
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
      
      // Create new script
      const script = document.createElement('script');
      script.id = scriptId;
      
      // Directly construct the URL
      const params = new URLSearchParams({
        'client-id': clientId,
        'currency': 'USD',
        'components': 'buttons',
        'enable-funding': 'card',
        'debug': 'true'
      });
      
      const scriptUrl = `https://www.paypal.com/sdk/js?${params.toString()}`;
      debugInfo.current = `Loading from: ${scriptUrl.substring(0, 40)}...`;
      
      // Setup load handler
      script.onload = () => {
        setTimeout(() => {
          if (window.paypal) {
            console.log('[PayPalSDKProvider] PayPal SDK loaded successfully', window.paypal);
            setPaypal(window.paypal as unknown as PayPalNamespace);
            setIsLoaded(true);
            setIsLoading(false);
            debugInfo.current = 'SDK loaded successfully';
            
            // Expose PayPal globally for debugging
            (window as any).myPayPal = window.paypal;
          } else {
            console.error('[PayPalSDKProvider] Script loaded but PayPal is not available');
            setError(new Error('Script loaded but PayPal is not available'));
            setIsLoading(false);
            debugInfo.current = 'Error: Script loaded but PayPal is not available';
          }
        }, 500);
      };
      
      // Setup error handler
      script.onerror = (e) => {
        console.error('[PayPalSDKProvider] Failed to load PayPal script', e);
        setError(new Error('Failed to load PayPal script'));
        setIsLoading(false);
        debugInfo.current = 'Error: Failed to load PayPal script';
      };
      
      // Set script attributes and add to DOM
      script.src = scriptUrl;
      script.async = true;
      script.crossOrigin = "anonymous";
      
      // Add to DOM
      document.body.appendChild(script);
      
      // Add global error handling for script load failures
      const timeoutId = setTimeout(() => {
        if (!window.paypal) {
          console.error('[PayPalSDKProvider] Script load timeout after 10 seconds');
          setError(new Error('Script load timeout after 10 seconds'));
          setIsLoading(false);
          debugInfo.current = 'Error: Script load timeout after 10 seconds';
        }
      }, 10000);
      
      return () => {
        clearTimeout(timeoutId);
      };
    } catch (err) {
      console.error('[PayPalSDKProvider] Failed to load PayPal SDK:', err);
      
      // Handle errors with more detail
      const errorMessage = err instanceof Error 
        ? `${err.message} (attempt ${loadAttempts.current}/${MAX_LOAD_ATTEMPTS})` 
        : `Unknown error loading PayPal SDK (attempt ${loadAttempts.current}/${MAX_LOAD_ATTEMPTS})`;
      
      debugInfo.current = `Error: ${errorMessage}`;
      
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  };
  
  // Exposed method to reload the SDK
  const reload = async () => {
    if (isLoading) return;
    
    // Reset attempt counter when manually reloading
    loadAttempts.current = 0;
    
    // Clear previous state
    setIsLoaded(false);
    setPaypal(null);
    setError(null);
    
    // Force reload
    await loadSDK(true);
  };
  
  // Load PayPal SDK on mount if not already loaded
  useEffect(() => {
    if (!isPayPalLoaded()) {
      loadSDK();
    } else {
      console.log('[PayPalSDKProvider] PayPal SDK already loaded, using existing instance');
      setIsLoaded(true);
      setPaypal(window.paypal as unknown as PayPalNamespace);
    }
    
    // Add a window listener to help with debugging
    const handleWindowLoad = () => {
      console.log('[PayPalSDKProvider] Window loaded, PayPal available:', {
        paypal: !!window.paypal,
        buttons: window.paypal?.Buttons ? 'Yes' : 'No',
        clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX
      });
    };
    
    window.addEventListener('load', handleWindowLoad);
    
    return () => {
      window.removeEventListener('load', handleWindowLoad);
    };
  }, []);
  
  const contextValue: PayPalSDKContextType = {
    isLoaded,
    isLoading,
    error,
    paypal: paypal || null,
    reload
  };
  
  return (
    <PayPalSDKContext.Provider value={contextValue}>
      {children}
    </PayPalSDKContext.Provider>
  );
};

export default PayPalSDKProvider; 