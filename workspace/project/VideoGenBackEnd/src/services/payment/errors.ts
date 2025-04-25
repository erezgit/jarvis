import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../types/errors';

export class PaymentError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.PAYMENT_OPERATION_FAILED,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, PaymentError.prototype);
  }
}

export class PaymentNotFoundError extends PaymentError {
  constructor(paymentId: string) {
    super(`Payment not found: ${paymentId}`);
    Object.setPrototypeOf(this, PaymentNotFoundError.prototype);
  }
}

export class PaymentProcessingError extends PaymentError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
    Object.setPrototypeOf(this, PaymentProcessingError.prototype);
  }
}

export class InsufficientFundsError extends PaymentError {
  constructor(message: string = 'Insufficient funds for this operation') {
    super(message);
    Object.setPrototypeOf(this, InsufficientFundsError.prototype);
  }
}

export class InvalidPackageError extends PaymentError {
  constructor(packageId: string) {
    super(`Invalid package ID: ${packageId}`);
    Object.setPrototypeOf(this, InvalidPackageError.prototype);
  }
} 