import { AppError } from '../../../errors/base';
import { ErrorCode, ErrorSeverity, HttpStatus } from '../../../types/errors';

/**
 * Base validation error
 */
export class ImageValidationError extends AppError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(
      HttpStatus.BAD_REQUEST,
      ErrorCode.VALIDATION_FAILED,
      message,
      ErrorSeverity.WARNING,
      details
    );
    Object.setPrototypeOf(this, ImageValidationError.prototype);
  }
}

/**
 * Error for invalid image size
 */
export class ImageSizeError extends ImageValidationError {
  constructor(size: number, maxSize: number) {
    super(
      `Image size ${size} bytes exceeds maximum allowed size of ${maxSize} bytes`,
      { size, maxSize }
    );
    Object.setPrototypeOf(this, ImageSizeError.prototype);
  }
}

/**
 * Error for invalid image format
 */
export class ImageFormatError extends ImageValidationError {
  constructor(format: string, allowedFormats: string[]) {
    super(
      `Invalid image format: ${format}. Allowed formats: ${allowedFormats.join(', ')}`,
      { format, allowedFormats }
    );
    Object.setPrototypeOf(this, ImageFormatError.prototype);
  }
}

/**
 * Error for invalid image dimensions
 */
export class ImageDimensionsError extends ImageValidationError {
  constructor(
    width: number,
    height: number,
    minWidth: number,
    minHeight: number,
    maxWidth: number,
    maxHeight: number
  ) {
    super(
      `Invalid image dimensions: ${width}x${height}. Must be between ${minWidth}x${minHeight} and ${maxWidth}x${maxHeight}`,
      {
        width,
        height,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight
      }
    );
    Object.setPrototypeOf(this, ImageDimensionsError.prototype);
  }
}

/**
 * Error for corrupted images
 */
export class ImageCorruptedError extends ImageValidationError {
  constructor(details?: Record<string, unknown>) {
    super(
      'Image file appears to be corrupted or invalid',
      details
    );
    Object.setPrototypeOf(this, ImageCorruptedError.prototype);
  }
} 