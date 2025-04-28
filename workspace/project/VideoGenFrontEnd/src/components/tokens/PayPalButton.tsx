import React, { useState, useEffect, useRef } from 'react';
import { PaymentProvider } from '@/core/services/payment/types';
import { PaymentService } from '@/core/services/payment/service';
import { Spinner } from '@/components/ui/spinner';
import { usePayPalSDK } from './PayPalButtonSDK';

// Get a reference to the payment service
const paymentService = PaymentService.getInstance();

// Debug helpers
const logDebug = (message: string, ...args: any[]) => {
  console.log(`[PayPalButton] ${message}`, ...args);
};

const logError = (message: string, error?: any) => {
  console.error(`[PayPalButton] ${message}`, error || '');
};

interface PayPalButtonProps {
  packageId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
  onCancel?: () => void;
  size?: 'small' | 'medium' | 'large';
  shape?: 'rect' | 'pill';
  color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
  containerId?: string; // Optional container ID
}

/**
 * PayPal button component that opens a popup for credit card entry
 */
const PayPalButton: React.FC<PayPalButtonProps> = ({
  packageId,
  onSuccess,
  onError,
  onCancel,
  size = 'medium',
  shape = 'rect',
  color = 'gold',
  containerId,
}) => {
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Use the PayPal SDK from context instead of loading it directly
  const { isLoaded, isLoading, error: sdkError, paypal } = usePayPalSDK();
  const sdkReady = isLoaded && !isLoading && !sdkError && !!paypal;
  
  // Generate a unique ID for this instance if none is provided
  const uniqueId = useRef(`paypal-button-${Math.random().toString(36).substring(2, 9)}`);
  const buttonContainerId = useRef(containerId || uniqueId.current);
  
  // After SDK is ready and DOM is mounted, render the button
  useEffect(() => {
    if (!sdkReady || isRendered) {
      return;
    }
    
    // Add a short delay to ensure DOM is fully rendered
    const renderTimeout = setTimeout(() => {
      const renderButton = async () => {
        try {
          logDebug('Rendering PayPal button for package:', packageId);
          logDebug('Using container ID:', buttonContainerId.current);
          
          // Get the container by ID or by querySelector
          const container = document.getElementById(buttonContainerId.current) || 
                           document.querySelector(`.${buttonContainerId.current}`);
                           
          if (!container) {
            logError('Container element not found', {
              buttonContainerId: buttonContainerId.current,
              packageId,
              existingElements: Array.from(document.querySelectorAll('[id]')).map(el => el.id)
            });
            setError('Payment system initialization error. Please contact support.');
            if (onError) {
              onError(new Error(`Container element not found: ${buttonContainerId.current}`));
            }
            return;
          }
          
          // Clear the container
          container.innerHTML = '';
          
          // Create button
          if (!window.paypal?.Buttons) {
            throw new Error('PayPal Buttons component not available');
          }
          
          const button = window.paypal.Buttons({
            // Basic styling
            style: {
              layout: 'vertical',
              color: color,
              shape: shape,
              height: 40 // Set a specific height
            },
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
                const result = await paymentService.capturePayPalPayment(data.orderID);
                
                if (result.error) {
                  logError('Error capturing payment:', result.error);
                  if (onError) {
                    onError(result.error);
                  }
                  return;
                }
                
                logDebug('Payment captured successfully:', result.data);
                if (onSuccess) {
                  onSuccess(result.data);
                }
              } catch (err) {
                logError('Error in payment approval:', err);
                if (onError) {
                  onError(err instanceof Error ? err : new Error(String(err)));
                }
              }
            },
            onCancel: () => {
              logDebug('Payment cancelled by user');
              if (onCancel) {
                onCancel();
              }
            },
            onError: (err) => {
              logError('PayPal error:', err);
              // Also log a separate version for mobile debugging
              logError('Error rendering PayPal button: ', err);
              setError('There was a problem with the payment. Please try again.');
              if (onError) {
                onError(err instanceof Error ? err : new Error(String(err)));
              }
            }
          });
          
          if (!button.render) {
            throw new Error('PayPal button render method not available');
          }
          
          // Render button to container
          await button.render(`#${buttonContainerId.current}`);
          logDebug('Button rendered successfully');
          setIsRendered(true);
        } catch (err) {
          logError('Failed to render PayPal button:', err);
          setError('Failed to load payment options. Please try again later.');
          if (onError) {
            onError(err instanceof Error ? err : new Error(String(err)));
          }
        }
      };
      
      renderButton();
    }, 300); // Add a small delay to ensure DOM is stable
    
    return () => {
      clearTimeout(renderTimeout);
    };
  }, [sdkReady, isRendered, packageId, onSuccess, onError, onCancel, color, shape]);
  
  // Reset rendered state when package changes
  useEffect(() => {
    setIsRendered(false);
  }, [packageId]);
  
  return (
    <div className="w-full">
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {isLoading && !isRendered && (
        <div className="flex justify-center items-center h-12 mb-4">
          <Spinner />
          <span className="ml-2">Loading payment options...</span>
        </div>
      )}
      
      {/* The div below will be the target for PayPal button rendering */}
      <div 
        id={buttonContainerId.current}
        className={`paypal-button-container ${buttonContainerId.current}`}
        style={{ minHeight: 150 }}
      ></div>
    </div>
  );
};

export default PayPalButton; 