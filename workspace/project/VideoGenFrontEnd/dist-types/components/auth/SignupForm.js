import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from '@/hooks/useForm';
import { useToast } from '@/hooks/useToast';
import { authValidation } from '@/utils/validation/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
const initialValues = {
    email: '',
    password: '',
    username: '',
};
const validationRules = {
    email: authValidation.email,
    password: authValidation.password,
    username: authValidation.username,
};
export const SignupForm = ({ returnPath = '/dashboard' }) => {
    const navigate = useNavigate();
    const { signup } = useAuth();
    const { showToast } = useToast();
    const { values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting } = useForm({
        initialValues,
        validationRules,
        onSubmit: async (formData) => {
            try {
                await signup(formData);
                showToast('Account created successfully!', 'success');
                navigate(returnPath, { replace: true });
            }
            catch (error) {
                showToast(error instanceof Error ? error.message : 'Failed to create account', 'error');
            }
        },
    });
    return (_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "username", children: "Username" }), _jsx(Input, { id: "username", type: "text", name: "username", value: values.username, onChange: handleChange, onBlur: handleBlur, disabled: isSubmitting, autoFocus: true, placeholder: "Choose a username", "aria-invalid": touched.username && !!errors.username, "aria-describedby": errors.username ? 'username-error' : undefined }), touched.username && errors.username && (_jsx("p", { id: "username-error", className: "text-sm text-destructive", children: errors.username }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", name: "email", value: values.email, onChange: handleChange, onBlur: handleBlur, disabled: isSubmitting, placeholder: "Enter your email", "aria-invalid": touched.email && !!errors.email, "aria-describedby": errors.email ? 'email-error' : undefined }), touched.email && errors.email && (_jsx("p", { id: "email-error", className: "text-sm text-destructive", children: errors.email }))] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", name: "password", value: values.password, onChange: handleChange, onBlur: handleBlur, disabled: isSubmitting, placeholder: "Choose a password", "aria-invalid": touched.password && !!errors.password, "aria-describedby": errors.password ? 'password-error' : undefined }), touched.password && errors.password && (_jsx("p", { id: "password-error", className: "text-sm text-destructive", children: errors.password }))] }), _jsx(Button, { type: "submit", className: "w-full", disabled: isSubmitting, "aria-busy": isSubmitting, children: isSubmitting ? 'Creating Account...' : 'Sign Up' })] }));
};
