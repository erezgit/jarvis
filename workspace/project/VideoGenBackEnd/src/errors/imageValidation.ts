import { AppError } from './base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../types/errors';

/**
 * Error thrown when image validation fails
 */
export class ImageValidationError extends AppError {
  constructor(message: string) {
    super(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
      message,
      ErrorSeverity.ERROR
    );
    Object.setPrototypeOf(this, ImageValidationError.prototype);
  }
}

/**
 * Error thrown when image file is not found in storage
 */
export class ImageNotFoundError extends ImageValidationError {
  constructor(imageUrl: string) {
    super(`Image not found in storage: ${imageUrl}`);
    Object.setPrototypeOf(this, ImageNotFoundError.prototype);
  }
}

/**
 * Error thrown when image format is invalid
 */
export class InvalidImageFormatError extends ImageValidationError {
  constructor(contentType: string) {
    super(`Invalid image format: ${contentType}`);
    Object.setPrototypeOf(this, InvalidImageFormatError.prototype);
  }
}

/**
 * Error thrown when image size exceeds limit
 */
export class ImageSizeTooLargeError extends ImageValidationError {
  constructor(size: number, maxSize: number) {
    super(`Image size ${size} bytes exceeds maximum limit of ${maxSize} bytes`);
    Object.setPrototypeOf(this, ImageSizeTooLargeError.prototype);
  }
} 