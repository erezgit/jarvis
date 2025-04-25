/**
 * Standard validation result interface
 * This serves as the base for all validation results across services
 */
export interface ValidationResult<T = unknown> {
  /**
   * Whether the validation passed
   */
  isValid: boolean;
  
  /**
   * Array of validation error messages
   * Should be an empty array when validation passes
   */
  errors: string[];
  
  /**
   * Optional metadata about the validated entity
   * Present when validation passes, undefined when validation fails
   */
  metadata?: T;
}

/**
 * Type guard to check if an object is a valid ValidationResult
 */
export function isValidationResult(obj: unknown): obj is ValidationResult {
  if (!obj || typeof obj !== 'object') return false;
  
  const result = obj as ValidationResult;
  return (
    typeof result.isValid === 'boolean' &&
    Array.isArray(result.errors)
  );
} 