import { AppError } from '../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../types/errors';
import { ImageErrorCode } from './types';

/**
 * Base error class for image-related errors
 */
export class ImageError extends AppError {
  constructor(
    code: ImageErrorCode,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(
      HttpStatus.BAD_REQUEST,
      code as unknown as ErrorCode,
      message,
      ErrorSeverity.ERROR,
      details
    );
    Object.setPrototypeOf(this, ImageError.prototype);
  }
}

/**
 * Error thrown when an image is not found
 */
export class ImageNotFoundError extends ImageError {
  constructor(imageUrl: string) {
    super(
      ImageErrorCode.NOT_FOUND,
      `Image not found: ${imageUrl}`,
      { imageUrl }
    );
    Object.setPrototypeOf(this, ImageNotFoundError.prototype);
  }
}

/**
 * Error thrown when image validation fails
 */
export class ImageValidationError extends ImageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ImageErrorCode.VALIDATION_FAILED,
      message,
      details
    );
    Object.setPrototypeOf(this, ImageValidationError.prototype);
  }
}

/**
 * Error thrown when image format is invalid
 */
export class InvalidImageFormatError extends ImageError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      ImageErrorCode.INVALID_FORMAT,
      message,
      details
    );
    Object.setPrototypeOf(this, InvalidImageFormatError.prototype);
  }
}

/**
 * Error thrown when image size exceeds limit
 */
export class ImageSizeTooLargeError extends ImageError {
  constructor(size: number, maxSize: number) {
    super(
      ImageErrorCode.SIZE_TOO_LARGE,
      `Image size (${size} bytes) exceeds maximum allowed size (${maxSize} bytes)`,
      { size, maxSize }
    );
    Object.setPrototypeOf(this, ImageSizeTooLargeError.prototype);
  }
} 