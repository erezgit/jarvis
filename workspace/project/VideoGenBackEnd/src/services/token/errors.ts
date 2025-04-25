import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../types/errors';

export class TokenError extends AppError {
  constructor(
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.INTERNAL_SERVER_ERROR,
      ErrorCode.TOKEN_OPERATION_FAILED,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, TokenError.prototype);
  }
}

export class TokenBalanceNotFoundError extends TokenError {
  constructor(userId: string) {
    super(`Token balance not found for user: ${userId}`);
    Object.setPrototypeOf(this, TokenBalanceNotFoundError.prototype);
  }
}

export class InsufficientTokensError extends TokenError {
  constructor(available: number, required: number) {
    super(`Insufficient tokens: ${available} available, ${required} required`);
    Object.setPrototypeOf(this, InsufficientTokensError.prototype);
  }
}

export class TokenTransactionError extends TokenError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(message, details);
    Object.setPrototypeOf(this, TokenTransactionError.prototype);
  }
} 