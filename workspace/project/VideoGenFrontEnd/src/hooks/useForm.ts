/// <reference lib="dom" />
import { useState, useCallback, FormEvent, ChangeEvent, FocusEvent, ElementRef } from 'react';
import type { UseFormReturn, ValidationValue, FormData } from '@/types/hooks';

type FormInputElement = ElementRef<'input'> | ElementRef<'textarea'>;

// Modified UseFormReturn that doesn't require T to extend FormData
export interface ModifiedUseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleBlur: (e: React.FocusEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  setFieldValue: (field: keyof T, value: ValidationValue) => void;
  resetForm: () => void;
}

export interface UseFormConfig<T> {
  initialValues: T;
  validationRules?: {
    [K in keyof T]?: (value: ValidationValue) => string | undefined;
  };
  onSubmit: (values: T) => void | Promise<void>;
}

export type ValidationRule<T> = (value: T) => string | undefined;

export type ValidationRules<T> = {
  [K in keyof T]?: ValidationRule<T[K]>;
};

export type FormErrors<T> = {
  [K in keyof T]?: string;
};

export type FormValues<T> = {
  [K in keyof T]: T[K];
};

export type FieldChangeHandler = (e: React.ChangeEvent<HTMLInputElement>) => void;
export type FormSubmitHandler<T> = (values: T) => void | Promise<void>;

export function useForm<T>({
  initialValues,
  validationRules,
  onSubmit,
}: UseFormConfig<T>): ModifiedUseFormReturn<T> {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateField = useCallback(
    (name: keyof T, value: ValidationValue): string | undefined => {
      if (!validationRules) return undefined;
      const validateRule = validationRules[name];
      return validateRule ? validateRule(value) : undefined;
    },
    [validationRules],
  );

  const handleChange = useCallback(
    (e: ChangeEvent<FormInputElement>) => {
      const { name, value } = e.target;
      setValues((prev) => ({ ...prev, [name]: value }));
      const error = validateField(name as keyof T, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    },
    [validateField],
  );

  const handleBlur = useCallback((e: FocusEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }, []);

  const setFieldValue = useCallback(
    (field: keyof T, value: ValidationValue) => {
      setValues((prev) => ({ ...prev, [field]: value }));
      const error = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: error }));
    },
    [validateField],
  );

  const validateForm = useCallback(() => {
    const newErrors: Partial<Record<keyof T, string>> = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      const error = validateField(key as keyof T, values[key as keyof T] as ValidationValue);
      if (error) {
        isValid = false;
        newErrors[key as keyof T] = error;
      }
    });

    setErrors(newErrors);
    return isValid;
  }, [values, validateField]);

  const handleSubmit = useCallback(
    async (e: FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      if (!validateForm()) {
        // Mark all fields as touched when form is invalid
        const allTouched: Partial<Record<keyof T, boolean>> = {};
        Object.keys(values).forEach((key) => {
          allTouched[key as keyof T] = true;
        });
        setTouched(allTouched);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validateForm, onSubmit],
  );

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    setFieldValue,
    resetForm,
  };
}
