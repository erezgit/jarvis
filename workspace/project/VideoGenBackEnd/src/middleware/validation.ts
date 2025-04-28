import { Request, Response, NextFunction, RequestHandler } from 'express';
import { ErrorCode, HttpStatus, ErrorSeverity } from '../types/errors';
import { AppError } from '../errors/base';

/**
 * Validate email format
 */
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 */
const isValidPassword = (password: string): boolean => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Sanitize input string
 */
const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

type ValidationHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<void> | void;

/**
 * Middleware to validate registration request
 */
export const validateRegistration: ValidationHandler = (req, res, next) => {
  const { email, password, confirmPassword } = req.body;

  // Sanitize inputs
  req.body.email = sanitizeInput(email);
  req.body.password = password;
  req.body.confirmPassword = confirmPassword;

  // Validate email
  if (!email || !isValidEmail(email)) {
    const error = AppError.validation('Invalid email format');
    res.status(error.status).json({ error: error.toResponse() });
    return;
  }

  // Validate password
  if (!password || !isValidPassword(password)) {
    const error = AppError.validation(
      'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number'
    );
    res.status(error.status).json({ error: error.toResponse() });
    return;
  }

  // Validate password confirmation
  if (password !== confirmPassword) {
    const error = new AppError(
      HttpStatus.BAD_REQUEST,
      ErrorCode.PASSWORDS_DO_NOT_MATCH,
      'Passwords do not match',
      ErrorSeverity.WARNING
    );
    res.status(error.status).json({ error: error.toResponse() });
    return;
  }

  next();
};

/**
 * Middleware to validate login request
 */
export const validateLogin: ValidationHandler = (req, res, next) => {
  const { email, password } = req.body;

  // Sanitize inputs
  req.body.email = sanitizeInput(email);
  req.body.password = password;

  // Validate email
  if (!email || !isValidEmail(email)) {
    const error = AppError.validation('Invalid email format');
    res.status(error.status).json({ error: error.toResponse() });
    return;
  }

  // Validate password presence
  if (!password) {
    const error = AppError.validation('Password is required');
    res.status(error.status).json({ error: error.toResponse() });
    return;
  }

  next();
};

/**
 * Middleware to validate password reset request
 */
export const validatePasswordReset: ValidationHandler = (req, res, next) => {
  const { email } = req.body;

  // Sanitize input
  req.body.email = sanitizeInput(email);

  // Validate email
  if (!email || !isValidEmail(email)) {
    const error = AppError.validation('Invalid email format');
    res.status(error.status).json({ error: error.toResponse() });
    return;
  }

  next();
};

export function validateRequest<T>(requiredFields: (keyof T)[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const missingFields = requiredFields.filter(field => !req.body[field as string]);

    if (missingFields.length > 0) {
      const error = AppError.validation(
        `Missing required fields: ${missingFields.join(', ')}`
      );
      return res.status(error.status).json({ error: error.toResponse() });
    }

    next();
  };
} 