import React, { useEffect, useState, useRef } from 'react';
import { loadPayPalScript, isPayPalLoaded, isCardFieldsAvailable, PayPalCardFieldEvent, PayPalCardFieldsStyle } from '@/utils/paypal/sdk-loader';
import { Spinner } from '@/components/ui/spinner';
import { PayPalCardFieldsTheme } from '@/utils/paypal/card-fields-theme';
import { usePayPalSDK } from './PayPalButtonSDK';
import { PaymentService } from '@/core/services/payment/service';
import { PaymentProvider } from '@/core/services/payment/types';

// Get a reference to the payment service
const paymentService = PaymentService.getInstance();

// Debug logging function
const logDebug = (message: string, data?: any) => {
  const formattedMessage = `[PayPalCardFields] ${message}`;
  if (data !== undefined) {
    console.log(formattedMessage, data);
  } else {
    console.log(formattedMessage);
  }
};

// Debug error logging function
const logError = (message: string, error?: any) => {
  const formattedMessage = `[PayPalCardFields] ERROR: ${message}`;
  if (error !== undefined) {
    console.error(formattedMessage, error);
    // Add special mobile logging that's more visible in mobile debug consoles
    console.error(`PayPal Card Fields Error (Mobile): `, error);
  } else {
    console.error(formattedMessage);
  }
};

interface PayPalCardFieldsProps {
  packageId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  styleCustomization?: PayPalCardFieldsStyle;
  theme?: PayPalCardFieldsTheme;
  autoFocus?: boolean; // New prop to control autofocus behavior
}

/**
 * PayPal Card Fields component that renders credit card form fields directly on the page
 */
const PayPalCardFields: React.FC<PayPalCardFieldsProps> = ({
  packageId,
  onSuccess,
  onError,
  onCancel,
  styleCustomization,
  theme,
  autoFocus = true // Default to true for better UX
}) => {
  // Component state
  const [isLoading, setIsLoading] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [cardFieldsRendered, setCardFieldsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [payPalEnvInfo, setPayPalEnvInfo] = useState<string>(''); // For debugging
  const [cardFieldsStatus, setCardFieldsStatus] = useState<string>('Not initialized'); // For debugging
  const MAX_RETRIES = 2;
  
  // Store cardFields instance in a ref
  const cardFieldsRef = useRef<any>(null);
  
  // Use the PayPal SDK from context instead of loading it directly
  const { isLoaded, isLoading: isSdkLoading, error: sdkError, paypal, reload } = usePayPalSDK();
  const sdkReady = isLoaded && !isSdkLoading && !sdkError && !!paypal;
  
  // Function to handle and report errors
  const handleError = (message: string, originalError?: any) => {
    logError(message, originalError);
    setError(message);
    setIsLoading(false);
    setProcessingPayment(false);
    
    if (onError) {
      const error = originalError instanceof Error 
        ? originalError 
        : new Error(message);
      onError(error);
    }
  };
  
  // Function to retry card initialization
  const retryCardInitialization = () => {
    setError(null);
    setRetryCount(0);
    setIsLoading(true);
    
    // First reload the SDK
    reload().then(() => {
      // After SDK is reloaded, the sdkReady effect will trigger again
      logDebug('PayPal SDK reloaded, retrying card initialization');
    }).catch(err => {
      handleError('Failed to reload PayPal SDK. Please refresh the page.', err);
    });
  };
  
  // Load the PayPal SDK with retry capability
  useEffect(() => {
    // Skip if we're done loading or we've exhausted retries
    if (sdkReady || retryCount >= MAX_RETRIES) {
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const loadSdk = async () => {
      try {
        setCardFieldsStatus('Loading SDK...');
        logDebug(`Loading PayPal SDK (attempt ${retryCount + 1}/${MAX_RETRIES + 1})`);
        
        // Collect information about the environment for debugging
        setPayPalEnvInfo(`
          Client ID: ${window.PAYPAL_CLIENT_ID ? 'Set from global' : 'Not set'}
          Window Location: ${window.location.href}
          User Agent: ${navigator.userAgent}
          Document Ready State: ${document.readyState}
          Document Element Count: ${document.getElementsByTagName('*').length}
        `);
        
        // Try to load the SDK using the global client ID
        await loadPayPalScript({
          'debug': 'true',
          'components': 'buttons,card-fields',
          'client-id': window.PAYPAL_CLIENT_ID
        });
        
        // Check if CardFields is available
        if (!isCardFieldsAvailable()) {
          setCardFieldsStatus('CardFields not available!');
          throw new Error('PayPal CardFields not available after loading SDK');
        }
        
        setCardFieldsStatus('SDK loaded successfully');
        setCardFieldsRendered(true);
      } catch (err) {
        setCardFieldsStatus('SDK load failed: ' + (err instanceof Error ? err.message : String(err)));
        logError('Failed to load PayPal SDK', err);
        setRetryCount(prev => prev + 1);
        
        // If this was the last attempt, report the final error
        if (retryCount + 1 >= MAX_RETRIES) {
          handleError('Failed to initialize payment form. Please try refreshing the page.', err);
        }
      }
    };
    
    if (!isPayPalLoaded()) {
      loadSdk();
    } else if (!isCardFieldsAvailable()) {
      setCardFieldsStatus('PayPal loaded but CardFields not available');
      handleError('Card payment method is not available. Please try an alternative payment method.');
    } else {
      setCardFieldsStatus('PayPal SDK & CardFields already available');
      setCardFieldsRendered(true);
    }
  }, [retryCount, onError]);
  
  // Initialize Card Fields after SDK is loaded
  useEffect(() => {
    if (!sdkReady || !paypal || !paypal.CardFields) {
      return;
    }
    
    // If already rendered, skip
    if (cardFieldsRendered && cardFieldsRef.current) {
      return;
    }
      
    // Add a small delay to ensure DOM is ready
    const renderTimeout = setTimeout(() => {
      const initCardFields = async () => {
        try {
          logDebug('Initializing Card Fields for package:', packageId);
          
          // Find containers for the appropriate view (mobile or desktop)
          const containers = await findContainers();
          
          logDebug('All card field containers found, initializing PayPal CardFields');
          
          // Default style if none provided
          const defaultStyle: PayPalCardFieldsStyle = {
            input: {
              'font-size': '16px',
              'font-family': 'system-ui, -apple-system, sans-serif',
              'font-weight': '400',
              color: 'var(--text-color, #333333)'
            },
            '.invalid': {
              color: 'var(--error-color, #E53935)'
            },
            ':focus': {
              color: 'var(--focus-color, #0070BA)'
            }
          };
          
          const style = styleCustomization || defaultStyle;
          
          // Create Card Fields instance with the verified containers
          const cardFields = paypal.CardFields({
            style,
            createOrder: async () => {
              try {
                logDebug('Creating order for package:', packageId);
                const result = await paymentService.createOrder(packageId, PaymentProvider.PAYPAL);
                
                if (result.error) {
                  throw result.error;
                }
                
                return result.data;
              } catch (err) {
                logError('Error creating order:', err);
                throw err;
              }
            },
            onApprove: async (data) => {
              try {
                logDebug('Payment approved, capturing payment:', data.orderID);
                setProcessingPayment(true);
                const result = await paymentService.capturePayPalPayment(data.orderID);
                
                if (result.error) {
                  logError('Error capturing payment:', result.error);
                  setError('Payment processing failed. Please try again.');
                  setProcessingPayment(false);
                  onError && onError(result.error);
                  return;
                }
                
                logDebug('Payment captured successfully:', result.data);
                setProcessingPayment(false);
                onSuccess && onSuccess(result.data);
              } catch (err) {
                logError('Error in payment approval:', err);
                setError('Payment processing failed. Please try again.');
                setProcessingPayment(false);
                onError && onError(err);
              }
            },
            onCancel: () => {
              logDebug('Payment cancelled by user');
              setProcessingPayment(false);
              onCancel && onCancel();
            },
            onError: (err) => {
              logError('PayPal error:', err);
              setError('There was a problem with the payment form. Please try again.');
              setProcessingPayment(false);
              onError && onError(err);
            },
            inputEvents: {
              onChange: (event) => {
                // Log validation changes for debugging
                logDebug('Card fields change event:', {
                  isValid: event.isValid,
                  isPotentiallyValid: event.isPotentiallyValid,
                  fields: event.fields
                });
                
                // Track field validation state for improved UX
                if (event.fields) {
                  // Update validation classes on field containers for visual feedback
                  const isMobileView = window.innerWidth < 768;
                  const updateFieldValidation = (fieldType: string, fieldState: any) => {
                    if (!fieldState) return;
                    
                    const containerId = isMobileView 
                      ? `card-${fieldType}-mobile` 
                      : `card-${fieldType}`;
                    const container = document.getElementById(containerId);
                    if (!container) return;
                    
                    // Remove existing validation classes
                    container.classList.remove('card-field-valid', 'card-field-invalid');
                    
                    // Add appropriate class based on validation state
                    if (!fieldState.isEmpty) {
                      if (fieldState.isValid) {
                        container.classList.add('card-field-valid');
                      } else if (!fieldState.isPotentiallyValid) {
                        container.classList.add('card-field-invalid');
                      }
                    }
                  };
                  
                  // Update each field's validation state
                  if (event.fields.number) updateFieldValidation('number', event.fields.number);
                  if (event.fields.cvv) updateFieldValidation('cvv', event.fields.cvv);
                  if (event.fields.expirationDate) updateFieldValidation('expiry', event.fields.expirationDate);
                  if (event.fields.name) updateFieldValidation('name', event.fields.name);
                }
              },
              onFocus: (event) => {
                logDebug('Field focused:', event);
              },
              onBlur: (event) => {
                logDebug('Field blurred:', event);
              },
              onInputSubmitRequest: () => {
                // User pressed enter in a field - try to submit the form if valid
                const cardState = cardFieldsRef.current?.getState();
                if (cardState && cardState.isValid) {
                  handlePaymentSubmit();
                }
              }
            }
          });
          
          // Store card fields instance in ref for later use
          cardFieldsRef.current = cardFields;
          
          // Check if mobile vs desktop and use the right containers
          const isMobileView = window.innerWidth < 768;
          
          // Render card fields with the correct container object
          if (isMobileView) {
            logDebug('Rendering card fields to mobile containers');
            await cardFields.render({
              number: '#card-number-mobile',
              cvv: '#card-cvv-mobile',
              expirationDate: '#card-expiry-mobile',
              name: '#card-name-mobile'
            });
          } else {
            logDebug('Rendering card fields to desktop containers');
            await cardFields.render({
              number: '#card-number',
              cvv: '#card-cvv',
              expirationDate: '#card-expiry',
              name: '#card-name'
            });
          }
          
          logDebug('Card fields rendered successfully');
          setCardFieldsRendered(true);
          setIsLoading(false);
          
          // Auto-focus the name field if autoFocus is true
          if (autoFocus) {
            try {
              const nameField = isMobileView 
                ? document.querySelector('#card-name-mobile iframe')
                : document.querySelector('#card-name iframe');
              
              if (nameField && nameField instanceof HTMLIFrameElement) {
                nameField.contentWindow?.focus();
              }
            } catch (err) {
              // Silently handle focus errors
              logDebug('Could not focus card name field', err);
            }
          }
        } catch (err) {
          logError('Error initializing Card Fields:', err);
          handleError('Failed to initialize payment form. Please try again later.', err);
        }
      };
      
      // Call the async function
      initCardFields();
    }, 500); // Slightly longer delay to ensure DOM is fully rendered
    
    return () => {
      clearTimeout(renderTimeout);
    };
  }, [sdkReady, packageId, onSuccess, onError, onCancel, styleCustomization, paypal, autoFocus]);
  
  // Reset rendered state when package changes
  useEffect(() => {
    setCardFieldsRendered(false);
  }, [packageId]);
  
  // Handle payment submission
  const handlePaymentSubmit = async () => {
    if (!cardFieldsRef.current || isLoading || processingPayment) {
      return;
    }
    
    try {
      setProcessingPayment(true);
      await cardFieldsRef.current.submit();
      // Note: The actual payment processing and success/error handling
      // is done through the onApprove and onError callbacks
    } catch (err) {
      logError('Error submitting payment:', err);
      setError('Payment submission failed. Please try again.');
      setProcessingPayment(false);
    }
  };
  
  // Function to find container elements and validate they exist
  const findContainers = async (): Promise<Record<string, HTMLElement>> => {
    // Check if we're in mobile view
    const isMobileView = window.innerWidth < 768; // Match the md breakpoint in Tailwind
    
    // Use the appropriate IDs based on view
    const nameId = isMobileView ? 'card-name-mobile' : 'card-name';
    const numberId = isMobileView ? 'card-number-mobile' : 'card-number';
    const expiryId = isMobileView ? 'card-expiry-mobile' : 'card-expiry';
    const cvvId = isMobileView ? 'card-cvv-mobile' : 'card-cvv';
    
    // First check selectors, this is for debugging
    logDebug(`Using selectors for ${isMobileView ? 'mobile' : 'desktop'} view`);
    
    const nameEl = document.getElementById(nameId);
    const numberEl = document.getElementById(numberId);
    const expiryEl = document.getElementById(expiryId);
    const cvvEl = document.getElementById(cvvId);
    
    // For debugging
    logDebug('Containers found:', {
      [nameId]: !!nameEl,
      [numberId]: !!numberEl,
      [expiryId]: !!expiryEl,
      [cvvId]: !!cvvEl
    });
    
    if (!nameEl || !numberEl || !expiryEl || !cvvEl) {
      throw new Error(`Card field containers not found: ${nameId}=${!!nameEl}, ${numberId}=${!!numberEl}, ${expiryId}=${!!expiryEl}, ${cvvId}=${!!cvvEl}`);
    }
    
    return {
      name: nameEl,
      number: numberEl,
      cvv: cvvEl,
      expiry: expiryEl
    };
  };
  
  // Render debugging info when there's an error
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-700 mb-4">{error}</p>
        
        <button 
          onClick={retryCardInitialization}
          className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md mb-4"
        >
          Retry
        </button>
        
        {/* Debug information that can be shown/hidden */}
        <details>
          <summary className="cursor-pointer text-sm text-gray-600 mb-2">Show technical details</summary>
          <div className="p-3 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
            <div className="mb-2">
              <strong>Status:</strong> {cardFieldsStatus}
            </div>
            <div className="mb-2">
              <strong>PayPal Environment Info:</strong>
              <pre>{payPalEnvInfo}</pre>
            </div>
            <div className="mb-2">
              <strong>Error:</strong> {error}
            </div>
            <div>
              <strong>Retry attempts:</strong> {retryCount}/{MAX_RETRIES}
            </div>
            <div className="mt-2 text-sm">
              <button 
                onClick={() => window.location.reload()}
                className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                Reload page
              </button>
            </div>
          </div>
        </details>
      </div>
    );
  }
  
  // Render loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-6">
        <Spinner size="md" className="mb-4" />
        <p className="text-gray-600">{cardFieldsStatus || 'Loading payment form...'}</p>
        
        {/* Only show technical details during loading if we've had retry attempts */}
        {retryCount > 0 && (
          <details className="mt-4 w-full">
            <summary className="cursor-pointer text-sm text-gray-600 mb-2">Show technical details</summary>
            <div className="p-3 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
              <div className="mb-2">
                <strong>Status:</strong> {cardFieldsStatus}
              </div>
              <div className="mb-2">
                <strong>PayPal Environment Info:</strong>
                <pre>{payPalEnvInfo}</pre>
              </div>
              <div>
                <strong>Retry attempts:</strong> {retryCount}/{MAX_RETRIES}
              </div>
            </div>
          </details>
        )}
      </div>
    );
  }
  
  // Render submit button
  return (
    <div>
      {/* Submit button */}
      <button
        className={`w-full py-3 rounded text-white font-medium mt-4 
          ${cardFieldsRendered && !processingPayment ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
        disabled={!cardFieldsRendered || isLoading || processingPayment}
        onClick={handlePaymentSubmit}
      >
        {processingPayment ? (
          <div className="flex justify-center items-center">
            <Spinner size="sm" className="mr-2" />
            <span>Processing...</span>
          </div>
        ) : (
          'Pay Now'
        )}
      </button>
    </div>
  );
};

export default PayPalCardFields; 