interface FieldStyle {
  color?: string;
  'font-size'?: string;
  'font-family'?: string;
  'font-weight'?: string;
  'font-style'?: string;
  'text-decoration'?: string;
  'background-color'?: string;
  'border-color'?: string;
  'border-radius'?: string;
  transition?: string;
  padding?: string;
  'box-shadow'?: string;
}

export interface PayPalCardFieldsTheme {
  input?: FieldStyle;
  '.invalid'?: FieldStyle;
  ':focus'?: FieldStyle;
  ':hover'?: FieldStyle;
  '::placeholder'?: FieldStyle;
  '.valid'?: FieldStyle;
  '.disabled'?: FieldStyle;
  // Include the variables and rules for compatibility with our mock implementation
  variables?: {
    fontFamily?: string;
    colorText?: string;
    colorTextSecondary?: string;
    colorTextPlaceholder?: string;
    colorBackground?: string;
    colorInfo?: string;
    colorSuccess?: string;
    colorWarning?: string;
    colorError?: string;
    colorDanger?: string;
    colorFocus?: string;
    borderRadiusSm?: string;
    borderRadius?: string;
    borderRadiusLg?: string;
  };
}

/**
 * Light theme style configuration for PayPal Card Fields
 */
export const lightTheme: PayPalCardFieldsTheme = {
  // Base input styling
  input: {
    'font-size': '16px',
    'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'font-weight': '400',
    color: '#333333',
    'background-color': '#ffffff',
    'border-radius': '4px',
    padding: '12px 10px'
  },
  // Invalid state
  '.invalid': {
    color: '#E53935',
    'border-color': '#E53935'
  },
  // Focus state
  ':focus': {
    color: '#0070BA',
    'border-color': '#2684FF',
    'box-shadow': '0 0 0 2px rgba(38, 132, 255, 0.2)'
  },
  // Hover state
  ':hover': {
    'border-color': '#0070BA'
  },
  // Placeholder styling
  '::placeholder': {
    color: '#999999'
  }
};

/**
 * Dark theme style configuration for PayPal Card Fields
 */
export const darkTheme: PayPalCardFieldsTheme = {
  // Base input styling
  input: {
    'font-size': '16px',
    'font-family': 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    'font-weight': '400',
    color: '#E5E7EB',
    'background-color': '#1F2937',
    'border-radius': '4px',
    padding: '12px 10px'
  },
  // Invalid state
  '.invalid': {
    color: '#F87171',
    'border-color': '#F87171'
  },
  // Focus state
  ':focus': {
    color: '#60A5FA',
    'border-color': '#60A5FA',
    'box-shadow': '0 0 0 2px rgba(96, 165, 250, 0.2)'
  },
  // Hover state
  ':hover': {
    'border-color': '#60A5FA'
  },
  // Placeholder styling
  '::placeholder': {
    color: '#6B7280'
  }
};

/**
 * Get Card Fields theme based on dark mode preference
 * @param isDarkMode Whether to use dark mode theme
 * @returns Theme object for PayPal Card Fields
 */
export function getCardFieldsTheme(isDarkMode: boolean): PayPalCardFieldsTheme {
  return isDarkMode ? darkTheme : lightTheme;
}

export default getCardFieldsTheme; 