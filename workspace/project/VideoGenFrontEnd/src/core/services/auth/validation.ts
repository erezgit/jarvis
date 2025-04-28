import type { LoginCredentials, SignupCredentials } from './types';

/**
 * Validation result containing validation status and any error messages
 */
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Validates email format
 */
export function validateEmail(email: string): ValidationResult {
  const errors: string[] = [];
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email) {
    errors.push('Email is required');
  } else if (!emailRegex.test(email)) {
    errors.push('Invalid email format');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates password requirements
 */
export function validatePassword(password: string): ValidationResult {
  const errors: string[] = [];

  if (!password) {
    errors.push('Password is required');
  } else {
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('Password must contain at least one number');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates login credentials
 */
export function validateLoginCredentials(credentials: LoginCredentials): ValidationResult {
  const errors: string[] = [];

  const emailValidation = validateEmail(credentials.email);
  const passwordValidation = validatePassword(credentials.password);

  return {
    isValid: emailValidation.isValid && passwordValidation.isValid,
    errors: [...emailValidation.errors, ...passwordValidation.errors],
  };
}

/**
 * Validates signup credentials
 */
export function validateSignupCredentials(credentials: SignupCredentials): ValidationResult {
  const errors: string[] = [];

  const loginValidation = validateLoginCredentials(credentials);
  errors.push(...loginValidation.errors);

  if (credentials.name && credentials.name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
