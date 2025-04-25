import { paypalConfig } from '@/config/paypal';
import { loadScript } from '@paypal/paypal-js';

// Log environment variables at module level
console.log('[PayPalSDK] Environment variables check:', {
  VITE_PAYPAL_CLIENT_ID_SANDBOX: import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || 'not set',
  paypalConfigClientId: paypalConfig.clientId || 'not set',
  environment: import.meta.env.MODE,
  PROD: import.meta.env.PROD,
  DEV: import.meta.env.DEV
});

/**
 * PayPal SDK Types
 */
export interface PayPalButtonsComponentOptions {
  style?: {
    layout?: 'vertical' | 'horizontal';
    color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
    shape?: 'rect' | 'pill';
    label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
    height?: number;
  };
  fundingSource?: string;
  createOrder?: () => Promise<string>;
  onApprove?: (data: { orderID: string }) => Promise<void>;
  onCancel?: () => void;
  onError?: (err: any) => void;
}

export interface PayPalButtonsComponent {
  render: (selector: string | HTMLElement) => Promise<void>;
}

export interface PayPalPaymentFieldsOptions {
  createOrder?: () => Promise<string>;
  style?: {
    variables?: {
      fontFamily?: string;
      borderRadius?: string;
      colorBackground?: string;
      colorText?: string;
    };
    input?: {
      borderRadius?: string;
      borderColor?: string;
    };
    label?: {
      color?: string;
    };
  };
  onApprove?: (data: { orderID: string }) => Promise<void>;
  onCancel?: () => void;
  onError?: (err: any) => void;
}

export interface PayPalPaymentFieldsComponent {
  render: (selector: string) => void;
}

// Enhanced CardFields interfaces
export interface PayPalCardFieldsOptions {
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel?: () => void;
  onError?: (err: any) => void;
  style?: PayPalCardFieldsStyle;
  inputEvents?: {
    onChange?: (data: PayPalCardFieldEvent) => void;
    onFocus?: (data: PayPalCardFieldEvent) => void;
    onBlur?: (data: PayPalCardFieldEvent) => void;
    onInputSubmitRequest?: (data: PayPalCardFieldEvent) => void;
  };
}

export interface PayPalCardFieldEvent {
  isValid: boolean;
  isEmpty: boolean;
  isFocused: boolean;
  isPotentiallyValid: boolean;
  fields: {
    number?: {
      isValid: boolean;
      isEmpty: boolean;
      isPotentiallyValid: boolean;
    };
    cvv?: {
      isValid: boolean;
      isEmpty: boolean;
      isPotentiallyValid: boolean;
    };
    expirationDate?: {
      isValid: boolean;
      isEmpty: boolean;
      isPotentiallyValid: boolean;
    };
    name?: {
      isValid: boolean;
      isEmpty: boolean;
      isPotentiallyValid: boolean;
    };
  };
}

export interface PayPalCardFieldsStyle {
  input?: {
    'font-size'?: string;
    'font-family'?: string;
    'font-weight'?: string;
    color?: string;
    'background-color'?: string;
    'border-radius'?: string;
    padding?: string;
    [key: string]: string | undefined;
  };
  '.invalid'?: {
    color?: string;
    'border-color'?: string;
    [key: string]: string | undefined;
  };
  ':focus'?: {
    color?: string;
    'border-color'?: string;
    'box-shadow'?: string;
    [key: string]: string | undefined;
  };
  ':hover'?: {
    color?: string;
    'border-color'?: string;
    [key: string]: string | undefined;
  };
  '::placeholder'?: {
    color?: string;
    [key: string]: string | undefined;
  };
  [key: string]: any;
}

export interface PayPalCardFieldsInstance {
  render: (options: {
    number?: string;
    cvv?: string;
    expirationDate?: string;
    name?: string;
  }) => Promise<void>;
  submit: () => Promise<void>;
  getState: () => PayPalCardFieldEvent;
}

export interface PayPalHostedFieldsRenderOptions {
  createOrder: () => Promise<string>;
  styles?: Record<string, Record<string, string>>;
  fields: {
    number?: { selector: string; placeholder?: string };
    cvv?: { selector: string; placeholder?: string };
    expirationDate?: { selector: string; placeholder?: string };
    postalCode?: { selector: string; placeholder?: string };
  };
}

export interface PayPalHostedFieldsInstance {
  submit: (options?: { contingencies?: string[] }) => Promise<{ orderId: string }>;
}

export interface PayPalHostedFields {
  render: (options: PayPalHostedFieldsRenderOptions) => Promise<PayPalHostedFieldsInstance>;
  isEligible: () => boolean;
}

export interface PayPalNamespace {
  Buttons: (options: any) => PayPalButtonsComponent;
  PaymentFields?: (options: PayPalPaymentFieldsOptions) => PayPalPaymentFieldsComponent;
  HostedFields?: PayPalHostedFields;
  CardFields?: (options: PayPalCardFieldsOptions) => PayPalCardFieldsInstance;
  FUNDING?: {
    PAYPAL: string;
    CARD: string;
    VENMO: string;
    PAYLATER: string;
    [key: string]: string;
  };
}

declare global {
  interface Window {
    paypal?: PayPalNamespace;
  }
}

// Default render error handler
export const defaultPayPalErrorHandler = (err: any) => {
  console.error('PayPal button render error:', err);
  return 'PayPal encountered an error. Please try again or use another payment method.';
};

// Export directly the client ID used in the application
export const PAYPAL_CLIENT_ID = import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || 
  'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9';

console.log('[sdk-loader] Using PayPal Client ID:', PAYPAL_CLIENT_ID);

/**
 * Creates direct PayPal SDK script URL with given options
 */
export const createPayPalScriptUrl = (options: Record<string, string> = {}): string => {
  // Merge default options with provided options
  const mergedOptions = {
    'client-id': PAYPAL_CLIENT_ID,
    'currency': 'USD',
    'components': 'buttons',
    'enable-funding': 'card',
    'debug': import.meta.env.DEV ? 'true' : 'false',
    ...options
  };
  
  // Build params
  const params = new URLSearchParams(mergedOptions);
  return `https://www.paypal.com/sdk/js?${params.toString()}`;
};

/**
 * Adds PayPal SDK script directly to DOM
 * This can help bypass potential issues with the paypal-js loader
 */
export const addPayPalScriptToDom = (options: Record<string, string> = {}): Promise<PayPalNamespace> => {
  console.log('[sdk-loader] Adding PayPal script to DOM with options:', options);
  
  return new Promise((resolve, reject) => {
    // Check if already loaded
    if (isPayPalLoaded()) {
      console.log('[sdk-loader] PayPal SDK already loaded, returning existing instance');
      return resolve(window.paypal as PayPalNamespace);
    }
    
    // Create script element
    const scriptId = 'paypal-js-sdk';
    let script = document.getElementById(scriptId) as HTMLScriptElement;
    
    // Remove existing script if found
    if (script) {
      console.log('[sdk-loader] Removing existing PayPal script');
      document.head.removeChild(script);
    }
    
    // Create new script element
    script = document.createElement('script');
    script.id = scriptId;
    script.src = createPayPalScriptUrl(options);
    script.async = true;
    script.dataset.paypalSdk = 'true';
    script.crossOrigin = 'anonymous';
    
    // Set up load event
    script.onload = () => {
      // Delay check to ensure PayPal object is fully initialized
      setTimeout(() => {
        if (window.paypal && window.paypal.Buttons) {
          console.log('[sdk-loader] PayPal SDK loaded successfully via DOM');
          resolve(window.paypal);
        } else {
          const error = new Error('PayPal SDK loaded but Buttons component is missing');
          console.error('[sdk-loader]', error);
          reject(error);
        }
      }, 500);
    };
    
    // Set up error event
    script.onerror = (e) => {
      const error = new Error('Failed to load PayPal SDK script');
      console.error('[sdk-loader]', error, e);
      reject(error);
    };
    
    // Add script to DOM
    document.head.appendChild(script);
    
    // Set timeout for script loading
    const timeout = setTimeout(() => {
      if (!window.paypal) {
        const error = new Error('PayPal SDK script loading timed out');
        console.error('[sdk-loader]', error);
        reject(error);
      }
    }, 10000);
    
    // Clean up timeout on success
    script.addEventListener('load', () => {
      clearTimeout(timeout);
    });
  });
};

/**
 * Loads PayPal SDK and returns the global PayPal object
 * Using the @paypal/paypal-js library
 */
export const loadPayPalScript = async (options: Record<string, string> = {}): Promise<PayPalNamespace | null> => {
  try {
    // First check if PayPal is already loaded
    if (isPayPalLoaded()) {
      console.log('[sdk-loader] PayPal SDK already loaded, returning existing instance');
      return window.paypal as PayPalNamespace;
    }
    
    // Prioritize options, then environment variables, then fallback
    const clientId = options['client-id'] || 
                    import.meta.env.VITE_PAYPAL_CLIENT_ID_SANDBOX || 
                    'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9';
    
    console.log('[sdk-loader] Loading PayPal SDK with client ID:', clientId);
    
    // Simplified parameters for cleaner loading
    const paypalOptions = {
      'client-id': clientId,
      'components': 'buttons',
      'enable-funding': 'card',
      'currency': 'USD',
      'debug': import.meta.env.DEV ? 'true' : 'false',
      ...options
    };
    
    console.log('[sdk-loader] Loading PayPal SDK with options:', paypalOptions);
    
    // Load the PayPal SDK using the library
    await loadScript(paypalOptions);
    
    // Verify PayPal is defined
    if (!window.paypal) {
      console.error('[sdk-loader] PayPal object is undefined after script loaded');
      // Make the error visible in the UI for better debugging
      document.body.innerHTML += `
        <div style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;">
          PayPal SDK Error: PayPal object is undefined after loading
        </div>
      `;
      return null;
    }
    
    // Verify Buttons component is available
    if (!window.paypal.Buttons) {
      console.error('[sdk-loader] PayPal Buttons component is undefined');
      document.body.innerHTML += `
        <div style="position: fixed; top: 10px; right: 10px; background: red; color: white; padding: 10px; z-index: 9999;">
          PayPal SDK Error: Buttons component is missing
        </div>
      `;
      return null;
    }
    
    console.log('[sdk-loader] PayPal SDK loaded successfully:', window.paypal);
    return window.paypal;
  } catch (error) {
    console.error('[sdk-loader] Error loading PayPal SDK:', error);
    return null;
  }
};

// Let's create a singleton pattern for loading the PayPal SDK
let sdkLoadPromise: Promise<PayPalNamespace | null> | null = null;
let loadAttempts = 0;
const MAX_LOAD_ATTEMPTS = 3;

/**
 * Gets a singleton instance of the PayPal SDK
 * Ensures we only load the SDK once in the application
 */
export const getPayPalSDK = async (options: Record<string, string> = {}): Promise<PayPalNamespace | null> => {
  // If already loaded, return the loaded instance
  if (isPayPalLoaded()) {
    return window.paypal as PayPalNamespace;
  }
  
  // If already loading, return the existing promise
  if (sdkLoadPromise) {
    return sdkLoadPromise;
  }
  
  // Create and store the promise for loading the SDK
  loadAttempts++;
  sdkLoadPromise = new Promise(async (resolve) => {
    try {
      // Try direct DOM approach first (more reliable)
      const paypal = await addPayPalScriptToDom(options);
      resolve(paypal);
    } catch (error) {
      console.warn('[sdk-loader] DOM approach failed, trying library approach:', error);
      
      try {
        // Fall back to the library approach
        const paypal = await loadPayPalScript(options);
        resolve(paypal);
      } catch (secondError) {
        console.error('[sdk-loader] Both approaches failed:', secondError);
        
        // Try again if we haven't reached max attempts
        if (loadAttempts < MAX_LOAD_ATTEMPTS) {
          console.log(`[sdk-loader] Retrying SDK load (attempt ${loadAttempts + 1}/${MAX_LOAD_ATTEMPTS})`);
          // Clear the promise so we can try again
          sdkLoadPromise = null;
          // Wait a bit before retrying
          setTimeout(async () => {
            const result = await getPayPalSDK(options);
            resolve(result);
          }, loadAttempts * 2000); // Exponential backoff
        } else {
          console.error('[sdk-loader] Max load attempts reached, giving up');
          resolve(null);
        }
      }
    }
  });
  
  return sdkLoadPromise;
};

/**
 * Check if the PayPal SDK is already loaded
 */
export const isPayPalLoaded = (): boolean => {
  return !!(window.paypal && window.paypal.Buttons);
};

/**
 * Check if PayPal Card Fields are available
 */
export const isCardFieldsAvailable = (): boolean => {
  return !!window.paypal?.CardFields;
}; 