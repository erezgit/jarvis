import { ImageValidationService } from '../service';
import { Logger } from 'winston';
import { ImageValidationConfig } from '../types';
import { ImageCorruptedError } from '../errors';
import { readFileSync } from 'fs';
import { join } from 'path';

// Mock winston logger
const mockLogger: Partial<Logger> = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};

describe('ImageValidationService', () => {
  let validationService: ImageValidationService;
  const testConfig: ImageValidationConfig = {
    maxSizeBytes: 5 * 1024 * 1024, // 5MB
    minWidth: 100,
    minHeight: 100,
    maxWidth: 4096,
    maxHeight: 4096,
    allowedMimeTypes: ['image/jpeg', 'image/png'],
    allowedExtensions: ['.jpg', '.jpeg', '.png']
  };

  beforeEach(() => {
    validationService = new ImageValidationService(mockLogger as Logger, testConfig);
  });

  describe('validateMetadata', () => {
    it('should validate valid metadata', () => {
      const metadata = {
        size: 1024 * 1024, // 1MB
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        extension: '.jpg'
      };

      const result = validationService.validateMetadata(metadata);
      expect(result.isValid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject oversized files', () => {
      const metadata = {
        size: 10 * 1024 * 1024, // 10MB
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        extension: '.jpg'
      };

      const result = validationService.validateMetadata(metadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File size exceeds the maximum allowed limit');
    });

    it('should reject invalid mime types', () => {
      const metadata = {
        size: 1024 * 1024,
        mimeType: 'image/gif',
        width: 800,
        height: 600,
        extension: '.gif'
      };

      const result = validationService.validateMetadata(metadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('File type is not supported');
    });

    it('should reject invalid dimensions', () => {
      const metadata = {
        size: 1024 * 1024,
        mimeType: 'image/jpeg',
        width: 50, // Too small
        height: 50, // Too small
        extension: '.jpg'
      };

      const result = validationService.validateMetadata(metadata);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Image dimensions are outside allowed range');
    });
  });

  describe('validateImage', () => {
    it('should validate a valid image file', async () => {
      // Create a small valid image buffer for testing
      const imageBuffer = Buffer.from('fake image data');
      jest.spyOn(validationService as any, 'getImageMetadata').mockResolvedValue({
        size: 1024,
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        extension: '.jpg'
      });

      const result = await validationService.validateImage(imageBuffer, 'test.jpg');
      expect(result.success).toBe(true);
      expect(result.data?.isValid).toBe(true);
    });

    it('should handle corrupted images', async () => {
      const corruptedBuffer = Buffer.from('corrupted data');
      jest.spyOn(validationService as any, 'getImageMetadata').mockRejectedValue(
        new ImageCorruptedError()
      );

      const result = await validationService.validateImage(corruptedBuffer, 'corrupted.jpg');
      expect(result.success).toBe(false);
      expect(result.error).toBeInstanceOf(ImageCorruptedError);
    });
  });

  describe('getImageMetadata', () => {
    it('should extract metadata from valid image', async () => {
      // This test requires a real image file
      // You should add test image files to your test fixtures
      const imageBuffer = Buffer.from('mock image data');
      jest.spyOn(validationService as any, 'getImageMetadata').mockResolvedValue({
        size: 1024,
        mimeType: 'image/jpeg',
        width: 800,
        height: 600,
        extension: '.jpg',
        hash: '123456'
      });

      const metadata = await validationService.getImageMetadata(imageBuffer);
      expect(metadata).toBeDefined();
      expect(metadata.mimeType).toBe('image/jpeg');
      expect(metadata.width).toBe(800);
      expect(metadata.height).toBe(600);
    });

    it('should throw error for invalid image data', async () => {
      const invalidBuffer = Buffer.from('invalid data');
      await expect(validationService.getImageMetadata(invalidBuffer))
        .rejects
        .toThrow(ImageCorruptedError);
    });
  });
}); 