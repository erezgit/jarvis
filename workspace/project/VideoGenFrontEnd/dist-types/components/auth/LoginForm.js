import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';
import { authValidation } from '@/utils/validation/auth';
const initialValues = {
    email: '',
    password: '',
};
const validationRules = {
    email: authValidation.email,
    password: authValidation.password,
};
export const LoginForm = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const { showToast } = useToast();
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
        initialValues,
        validationRules,
        onSubmit: async (formData) => {
            try {
                await login(formData);
                showToast('Login successful!', 'success');
                navigate('/dashboard');
            }
            catch (error) {
                showToast(error instanceof Error ? error.message : 'Login failed', 'error');
            }
        },
    });
    const handleDemoLogin = useCallback(() => {
        handleChange({
            target: { name: 'email', value: 'demo@example.com' },
        });
        handleChange({
            target: { name: 'password', value: 'demo123' },
        });
        handleSubmit(new Event('submit'));
    }, [handleChange, handleSubmit]);
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx("label", { htmlFor: "email", className: "block text-sm font-medium text-gray-700", children: "Email" }), _jsx("input", { id: "email", type: "email", name: "email", value: values.email, onChange: handleChange, onBlur: handleBlur, disabled: isSubmitting, className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${touched.email && errors.email ? 'border-red-500' : ''}` }), touched.email && errors.email && (_jsx("p", { className: "mt-1 text-sm text-red-500", children: errors.email }))] }), _jsxs("div", { children: [_jsx("label", { htmlFor: "password", className: "block text-sm font-medium text-gray-700", children: "Password" }), _jsx("input", { id: "password", type: "password", name: "password", value: values.password, onChange: handleChange, onBlur: handleBlur, disabled: isSubmitting, className: `mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${touched.password && errors.password ? 'border-red-500' : ''}` }), touched.password && errors.password && (_jsx("p", { className: "mt-1 text-sm text-red-500", children: errors.password }))] }), _jsxs("div", { className: "flex space-x-4", children: [_jsx("button", { type: "submit", disabled: isSubmitting, className: "flex w-full justify-center rounded-md bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50", children: isSubmitting ? 'Logging in...' : 'Login' }), _jsx("button", { type: "button", onClick: handleDemoLogin, disabled: isSubmitting, className: "flex w-full justify-center rounded-md bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50", children: "Demo Login" })] })] }));
};
