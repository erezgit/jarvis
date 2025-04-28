/**
 * Direct PayPal Integration Script
 * 
 * This script provides a direct, inline integration with PayPal SDK.
 * Include this script directly in your checkout page to enable card fields and PayPal buttons.
 */

// Configuration
// Use directly from window object to ensure it can be set from the main app
const PAYPAL_CLIENT_ID = window.PAYPAL_CLIENT_ID || 'AaV4wvSOsPdK2Ypgz5B_njXwjBVJJsK29hwyvrxZh5VbvAnXqJC0Y6rF8tK3ZNkFFbnBG_ecLvYDNMm9';
const PAYPAL_CURRENCY = 'USD';
const DEBUG = true;

// Load the PayPal SDK script directly
function loadPayPalSDK() {
  return new Promise((resolve, reject) => {
    // Skip if already loaded
    if (window.paypal) {
      console.log('[PayPal] SDK already loaded');
      return resolve(window.paypal);
    }
    
    // Create script element
    const script = document.createElement('script');
    
    // Configure the SDK URL with parameters
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${PAYPAL_CURRENCY}&components=buttons,card-fields&debug=${DEBUG}&enable-funding=card`;
    
    // Set attributes
    script.async = true;
    
    // Debug info
    if (DEBUG) {
      console.log('[PayPal] Loading SDK with client ID:', PAYPAL_CLIENT_ID);
      console.log('[PayPal] SDK URL:', script.src);
    }
    
    // Handle load events
    script.onload = () => {
      console.log('[PayPal] SDK loaded successfully');
      if (window.paypal) {
        // Add CSS to hide PayPal button
        const style = document.createElement('style');
        style.textContent = `
          /* Target PayPal button specifically */
          .paypal-button[data-funding-source="paypal"],
          div[data-funding-source="paypal"],
          .paypal-button-layout-vertical .paypal-button-number-0,
          .paypal-button-row.paypal-button-number-0 {
            display: none !important;
          }
        `;
        document.head.appendChild(style);
        console.log('[PayPal] Added CSS to hide PayPal button');
        
        resolve(window.paypal);
      } else {
        reject(new Error('PayPal SDK loaded but window.paypal is not defined'));
      }
    };
    
    script.onerror = (err) => {
      console.error('[PayPal] Failed to load SDK:', err);
      reject(new Error('Failed to load PayPal SDK'));
    };
    
    // Add script to document
    document.head.appendChild(script);
  });
}

// Initialize card fields once SDK is loaded
function initializeCardFields(paypal, packageId) {
  console.log('[PayPal] Initializing card fields');
  
  // Check if containers exist
  const numberContainer = document.getElementById('card-number');
  const cvvContainer = document.getElementById('card-cvv');
  const expiryContainer = document.getElementById('card-expiry');
  const nameContainer = document.getElementById('card-name');
  
  if (!numberContainer || !cvvContainer || !expiryContainer || !nameContainer) {
    console.error('[PayPal] Card field containers not found:', {
      number: !!numberContainer,
      cvv: !!cvvContainer,
      expiry: !!expiryContainer,
      name: !!nameContainer
    });
    return null;
  }
  
  // Create CardFields instance
  const cardFields = paypal.CardFields({
    style: {
      input: {
        'font-size': '16px',
        'font-family': 'system-ui, -apple-system, sans-serif',
        'font-weight': '400',
        color: '#333333'
      },
      '.invalid': {
        color: '#E53935'
      },
      ':focus': {
        color: '#0070BA'
      }
    },
    createOrder: async () => {
      console.log('[PayPal] Creating order for package:', packageId);
      // This would be replaced with an actual API call in production
      return 'MOCK-ORDER-ID';
    },
    onApprove: (data) => {
      console.log('[PayPal] Payment approved:', data);
      // Handle successful payment
      handlePaymentSuccess(data);
    },
    onCancel: () => {
      console.log('[PayPal] Payment cancelled');
      // Handle cancellation
      handlePaymentCancel();
    },
    onError: (err) => {
      console.error('[PayPal] PayPal error:', err);
      // Handle error
      handlePaymentError(err);
    }
  });
  
  // Render card fields to containers
  cardFields.render({
    number: '#card-number',
    cvv: '#card-cvv',
    expirationDate: '#card-expiry',
    name: '#card-name'
  }).then(() => {
    console.log('[PayPal] Card fields rendered successfully');
  }).catch((err) => {
    console.error('[PayPal] Failed to render card fields:', err);
    handlePaymentError(err);
  });
  
  return cardFields;
}

// Initialize PayPal button
function initializePayPalButton(paypal, packageId) {
  console.log('[PayPal] Initializing PayPal button');
  
  // Check if container exists
  const buttonContainer = document.getElementById('paypal-button-container');
  if (!buttonContainer) {
    console.error('[PayPal] Button container not found');
    return null;
  }
  
  // Create Button instance
  const button = paypal.Buttons({
    style: {
      layout: 'vertical',
      color: 'gold',
      shape: 'rect',
      label: 'paypal'
    },
    createOrder: async () => {
      console.log('[PayPal] Creating order for package:', packageId);
      // This would be replaced with an actual API call in production
      return 'MOCK-ORDER-ID';
    },
    onApprove: (data) => {
      console.log('[PayPal] Payment approved:', data);
      // Handle successful payment
      handlePaymentSuccess(data);
    },
    onCancel: () => {
      console.log('[PayPal] Payment cancelled');
      // Handle cancellation
      handlePaymentCancel();
    },
    onError: (err) => {
      console.error('[PayPal] PayPal error:', err);
      // Handle error
      handlePaymentError(err);
    }
  });
  
  // Render button to container
  button.render('#paypal-button-container').then(() => {
    console.log('[PayPal] Button rendered successfully');
  }).catch((err) => {
    console.error('[PayPal] Failed to render button:', err);
    handlePaymentError(err);
  });
  
  return button;
}

// Payment handlers - these would be provided by the application
function handlePaymentSuccess(data) {
  console.log('[PayPal] Payment successful:', data);
  // Show success message or redirect
  if (window.onPaymentSuccess) {
    window.onPaymentSuccess(data);
  }
}

function handlePaymentError(error) {
  console.error('[PayPal] Payment error:', error);
  // Show error message
  if (window.onPaymentError) {
    window.onPaymentError(error);
  }
}

function handlePaymentCancel() {
  console.log('[PayPal] Payment cancelled');
  // Handle cancellation
  if (window.onPaymentCancel) {
    window.onPaymentCancel();
  }
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', () => {
  console.log('[PayPal] Initializing PayPal integration');
  
  // Get package ID from the page - replace with your own logic
  const packageId = document.getElementById('package-id')?.value || 'default-package';
  
  // Load PayPal SDK
  loadPayPalSDK().then(paypal => {
    // Initialize both card fields and PayPal button
    const cardFields = initializeCardFields(paypal, packageId);
    const button = initializePayPalButton(paypal, packageId);
    
    // Store references for potential later use
    window.paypalIntegration = {
      cardFields,
      button,
      rerender: () => {
        // Useful for re-rendering after DOM changes
        if (cardFields) {
          cardFields.render({
            number: '#card-number',
            cvv: '#card-cvv',
            expirationDate: '#card-expiry',
            name: '#card-name'
          });
        }
        
        if (button) {
          button.render('#paypal-button-container');
        }
      }
    };
  }).catch(error => {
    console.error('[PayPal] Failed to initialize PayPal integration:', error);
    handlePaymentError(error);
  });
}); 