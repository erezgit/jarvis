import React, { useEffect, useState, useCallback } from 'react';
import { useTokenStore } from '../stores/tokenStore';
import { PaymentService } from '../services/PaymentService';
import { TOKEN_PACKAGES } from '../constants/tokenPackages';
import { Button, Box, Typography, CircularProgress, Alert } from '@mui/material';

interface PayPalButtonProps {
  packageId: string;
  onSuccess: (data: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

/**
 * PayPal Button Component
 * 
 * Renders a PayPal button for purchasing token packages.
 * Handles the complete payment flow:
 * 1. Loading the PayPal SDK
 * 2. Creating an order on the server
 * 3. Handling payment approval
 * 4. Processing successful payments
 */
export const PayPalButton: React.FC<PayPalButtonProps> = ({
  packageId,
  onSuccess,
  onError,
  onCancel
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const { updateBalance } = useTokenStore();
  
  const selectedPackage = TOKEN_PACKAGES[packageId];
  
  // Load PayPal script
  useEffect(() => {
    const loadPayPalScript = () => {
      try {
        // Remove any existing PayPal script
        const existingScript = document.getElementById('paypal-script');
        if (existingScript) {
          document.body.removeChild(existingScript);
        }
        
        // Create new script element
        const script = document.createElement('script');
        script.id = 'paypal-script';
        script.src = `https://www.paypal.com/sdk/js?client-id=${process.env.REACT_APP_PAYPAL_CLIENT_ID}&currency=USD`;
        script.async = true;
        
        // Set up load and error handlers
        script.onload = () => {
          setScriptLoaded(true);
          setLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to load PayPal SDK');
          setLoading(false);
        };
        
        // Add script to document
        document.body.appendChild(script);
      } catch (err) {
        setError('Failed to initialize PayPal');
        setLoading(false);
      }
    };
    
    loadPayPalScript();
    
    // Cleanup function
    return () => {
      const script = document.getElementById('paypal-script');
      if (script) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // Function to create a PayPal order
  const createOrder = useCallback(async () => {
    try {
      setLoading(true);
      // Call our backend to create the order
      const orderId = await PaymentService.createOrder(packageId, 'paypal');
      return orderId;
    } catch (err) {
      setError('Failed to create order');
      onError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [packageId, onError]);

  // Function to handle PayPal approval
  const handleApprove = useCallback(async (data: { orderID: string }) => {
    try {
      setLoading(true);
      // Call our backend to capture the payment
      const result = await PaymentService.capturePayPalPayment(data.orderID);
      
      // Update token balance
      if (result.success) {
        updateBalance(result.newBalance);
        
        // Call success callback with result data
        onSuccess({
          orderId: data.orderID,
          transactionId: result.transactionId,
          tokens: selectedPackage.tokens,
          amount: selectedPackage.price
        });
      } else {
        throw new Error('Payment was not successful');
      }
    } catch (err) {
      setError('Failed to process payment');
      onError(err);
    } finally {
      setLoading(false);
    }
  }, [packageId, selectedPackage, onSuccess, onError, updateBalance]);
  
  // Render PayPal buttons when script is loaded
  useEffect(() => {
    if (scriptLoaded && window.paypal) {
      try {
        // Clear any existing buttons
        const container = document.getElementById('paypal-button-container');
        if (container) {
          container.innerHTML = '';
        }
        
        // Render PayPal buttons
        window.paypal.Buttons({
          style: {
            layout: 'vertical',
            color: 'gold',
            shape: 'rect',
            label: 'pay'
          },
          createOrder,
          onApprove: (data: any) => handleApprove(data),
          onCancel: () => {
            onCancel();
          },
          onError: (err: any) => {
            setError('PayPal encountered an error');
            onError(err);
          }
        }).render('#paypal-button-container');
      } catch (err) {
        setError('Failed to render PayPal buttons');
      }
    }
  }, [scriptLoaded, createOrder, handleApprove, onCancel, onError]);
  
  if (error) {
    return (
      <Box sx={{ mb: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button 
          variant="outlined" 
          color="primary" 
          onClick={() => setError(null)}
          fullWidth
        >
          Try Again
        </Button>
      </Box>
    );
  }
  
  return (
    <Box sx={{ width: '100%', mb: 2 }}>
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
          <CircularProgress size={24} />
        </Box>
      )}
      
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        {selectedPackage ? `Purchase ${selectedPackage.tokens} tokens for $${selectedPackage.price}` : 'Loading package details...'}
      </Typography>
      
      <div id="paypal-button-container" style={{ minHeight: 44 }} />
    </Box>
  );
};

/**
 * PayPal Payment Section Component
 * 
 * Container component that handles the token package selection
 * and renders the PayPal button for the selected package.
 */
export const PayPalPaymentSection: React.FC = () => {
  const [selectedPackage, setSelectedPackage] = useState('standard');
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  
  const handleSuccess = (data: any) => {
    setPaymentStatus('success');
    setStatusMessage(`Successfully purchased ${data.tokens} tokens!`);
  };
  
  const handleError = (error: any) => {
    setPaymentStatus('error');
    setStatusMessage(typeof error === 'string' ? error : 'Payment failed. Please try again.');
  };
  
  const handleCancel = () => {
    setPaymentStatus('idle');
    setStatusMessage('Payment was cancelled.');
  };
  
  const resetStatus = () => {
    setPaymentStatus('idle');
    setStatusMessage('');
  };
  
  return (
    <Box sx={{ maxWidth: 500, mx: 'auto', p: 2 }}>
      <Typography variant="h5" sx={{ mb: 3 }}>
        Purchase Tokens with PayPal
      </Typography>
      
      {paymentStatus === 'success' ? (
        <Box sx={{ mb: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            {statusMessage}
          </Alert>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={resetStatus}
            fullWidth
          >
            Purchase More Tokens
          </Button>
        </Box>
      ) : (
        <>
          {paymentStatus === 'error' && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {statusMessage}
            </Alert>
          )}
          
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Select a Token Package:
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(TOKEN_PACKAGES).map(([id, pkg]) => (
                <Button
                  key={id}
                  variant={selectedPackage === id ? "contained" : "outlined"}
                  color="primary"
                  onClick={() => setSelectedPackage(id)}
                  sx={{ 
                    justifyContent: 'space-between',
                    px: 2,
                    py: 1.5
                  }}
                >
                  <Typography variant="body1">
                    {pkg.name}
                  </Typography>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <Typography variant="body2">
                      ${pkg.price}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {pkg.tokens} tokens
                    </Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Box>
          
          <PayPalButton
            packageId={selectedPackage}
            onSuccess={handleSuccess}
            onError={handleError}
            onCancel={handleCancel}
          />
        </>
      )}
    </Box>
  );
};

export default PayPalPaymentSection; 