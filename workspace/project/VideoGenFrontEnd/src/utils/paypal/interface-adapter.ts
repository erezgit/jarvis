/**
 * Interface adapter utilities for PayPal SDK
 */
import { PayPalCardFieldsStyle } from './sdk-loader';
import { PayPalCardFieldsTheme } from './card-fields-theme';

// Define the FieldStyle interface here since it's not exported from card-fields-theme
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
  [key: string]: string | undefined;
}

/**
 * Converts a FieldStyle object to a format compatible with PayPalCardFieldsStyle
 */
function convertFieldStyle(fieldStyle?: FieldStyle): Record<string, string | undefined> {
  if (!fieldStyle) return {};
  
  // Convert the FieldStyle object to the format expected by PayPalCardFieldsStyle
  const result: Record<string, string | undefined> = {};
  
  // Copy all properties from the FieldStyle object
  Object.entries(fieldStyle).forEach(([key, value]) => {
    if (typeof value === 'string') {
      result[key] = value;
    }
  });
  
  return result;
}

/**
 * Adapts our theme format to PayPal CardFields style format
 */
export function adaptThemeToCardFieldsStyle(theme: PayPalCardFieldsTheme): PayPalCardFieldsStyle {
  const style: PayPalCardFieldsStyle = {};
  
  // Convert each field style property
  if (theme.input) {
    style.input = convertFieldStyle(theme.input as any);
  }
  
  if (theme['.invalid']) {
    style['.invalid'] = convertFieldStyle(theme['.invalid'] as any);
  }
  
  if (theme[':focus']) {
    style[':focus'] = convertFieldStyle(theme[':focus'] as any);
  }
  
  if (theme[':hover']) {
    style[':hover'] = convertFieldStyle(theme[':hover'] as any);
  }
  
  if (theme['::placeholder']) {
    style['::placeholder'] = convertFieldStyle(theme['::placeholder'] as any);
  }
  
  if (theme['.valid']) {
    style['.valid'] = convertFieldStyle(theme['.valid'] as any);
  }
  
  if (theme['.disabled']) {
    style['.disabled'] = convertFieldStyle(theme['.disabled'] as any);
  }
  
  return style;
}

export default adaptThemeToCardFieldsStyle; 