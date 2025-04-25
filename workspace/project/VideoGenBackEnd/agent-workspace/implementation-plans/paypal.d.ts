/**
 * PayPal SDK TypeScript declarations
 */

interface PayPalButtonStyle {
  layout?: 'vertical' | 'horizontal';
  color?: 'gold' | 'blue' | 'silver' | 'white' | 'black';
  shape?: 'rect' | 'pill';
  label?: 'paypal' | 'checkout' | 'buynow' | 'pay';
  height?: number;
}

interface PayPalButtonsOptions {
  style?: PayPalButtonStyle;
  createOrder: () => Promise<string>;
  onApprove: (data: { orderID: string }) => Promise<void>;
  onCancel?: () => void;
  onError?: (error: any) => void;
}

interface PayPalButtons {
  render: (selector: string) => void;
}

interface PayPalNamespace {
  Buttons: (options: PayPalButtonsOptions) => PayPalButtons;
}

// Extend the Window interface to include PayPal
declare global {
  interface Window {
    paypal: PayPalNamespace;
  }
}

export {}; 