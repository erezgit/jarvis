import { injectable, inject } from 'tsyringe';
import { Logger } from 'winston';
import { TYPES } from '../../lib/types';
import { BaseService } from '../../lib/services/base.service';
import { ProjectValidationError } from './errors';
import { ValidationResult } from '../../types';

@injectable()
export class ProjectValidationService extends BaseService {
  constructor(
    @inject(TYPES.Logger) protected readonly logger: Logger
  ) {
    super(logger, 'ProjectValidationService');
  }

  validateProjectTitle(title: string): ValidationResult {
    const errors: string[] = [];

    if (!title.trim()) {
      errors.push('Project title is required');
    }

    if (title.length > 100) {
      errors.push('Project title must be less than 100 characters');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  validateImageUrl(imageUrl: string): ValidationResult {
    const errors: string[] = [];

    if (!imageUrl.trim()) {
      errors.push('Image URL is required');
    }

    try {
      new URL(imageUrl);
    } catch {
      errors.push('Invalid image URL format');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  validateMetadata(metadata: Record<string, unknown>): ValidationResult {
    const errors: string[] = [];

    if (typeof metadata !== 'object' || metadata === null) {
      errors.push('Metadata must be an object');
    }

    // Check for maximum nesting depth
    const checkNestingDepth = (obj: any, depth: number = 0): boolean => {
      if (depth > 3) return false;
      if (typeof obj !== 'object' || obj === null) return true;
      return Object.values(obj).every(value => checkNestingDepth(value, depth + 1));
    };

    if (!checkNestingDepth(metadata)) {
      errors.push('Metadata nesting depth exceeds maximum of 3 levels');
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : undefined
    };
  }
} 