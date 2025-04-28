import { injectable } from 'tsyringe';
import { logger } from '../../../lib/server/logger';
import { ValidationError } from './errors';
import { ValidationResult } from '../../image/validation/types';
import { BaseService } from '../../../lib/services/base.service';

type ValidatorFn<T> = (value: T) => ValidationResult;

@injectable()
export class ValidationService extends BaseService {
  constructor() {
    super(logger, 'ValidationService');
  }

  validate<T>(data: T, rules: ValidationRules<T>): ValidationResult {
    try {
      const errors: string[] = [];

      // Check required fields
      if (rules.required) {
        rules.required.forEach(field => {
          if (!data[field as keyof T]) {
            errors.push(`${String(field)} is required`);
          }
        });
      }

      // Check type validations
      if (rules.types) {
        Object.entries(rules.types).forEach(([field, type]) => {
          const value = data[field as keyof T];
          if (value !== undefined && typeof value !== type) {
            errors.push(`${field} must be of type ${type}`);
          }
        });
      }

      // Check custom validations
      if (rules.custom) {
        for (const [field, validator] of Object.entries(rules.custom)) {
          const value = data[field as keyof T];
          if (value !== undefined && validator) {
            const validatorFn = validator as ValidatorFn<typeof value>;
            const result = validatorFn(value);
            if (!result.isValid) {
              errors.push(...(result.errors || []));
            }
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors: errors.length > 0 ? errors : undefined
      };
    } catch (error) {
      this.logger.error('Validation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        data,
        timestamp: new Date().toISOString()
      });
      throw new ValidationError(
        'Validation failed',
        { error: error instanceof Error ? error.message : 'Unknown error' }
      );
    }
  }
}

export interface ValidationRules<T> {
  required?: (keyof T)[];
  types?: { [K in keyof T]?: string };
  custom?: {
    [K in keyof T]?: ValidatorFn<T[K]>;
  };
} 