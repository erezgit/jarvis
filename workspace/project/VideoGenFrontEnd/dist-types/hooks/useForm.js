/// <reference lib="dom" />
import { useState, useCallback } from 'react';
export function useForm({ initialValues, validationRules, onSubmit, }) {
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const validateField = useCallback((name, value) => {
        if (!validationRules)
            return undefined;
        const validateRule = validationRules[name];
        return validateRule ? validateRule(value) : undefined;
    }, [validationRules]);
    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setValues((prev) => ({ ...prev, [name]: value }));
        const error = validateField(name, value);
        setErrors((prev) => ({ ...prev, [name]: error }));
    }, [validateField]);
    const handleBlur = useCallback((e) => {
        const { name } = e.target;
        setTouched((prev) => ({ ...prev, [name]: true }));
    }, []);
    const setFieldValue = useCallback((field, value) => {
        setValues((prev) => ({ ...prev, [field]: value }));
        const error = validateField(field, value);
        setErrors((prev) => ({ ...prev, [field]: error }));
    }, [validateField]);
    const validateForm = useCallback(() => {
        const newErrors = {};
        let isValid = true;
        Object.keys(values).forEach((key) => {
            const error = validateField(key, values[key]);
            if (error) {
                isValid = false;
                newErrors[key] = error;
            }
        });
        setErrors(newErrors);
        return isValid;
    }, [values, validateField]);
    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            // Mark all fields as touched when form is invalid
            const allTouched = {};
            Object.keys(values).forEach((key) => {
                allTouched[key] = true;
            });
            setTouched(allTouched);
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit(values);
        }
        finally {
            setIsSubmitting(false);
        }
    }, [values, validateForm, onSubmit]);
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
