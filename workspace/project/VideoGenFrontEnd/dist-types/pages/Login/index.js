import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
export default function Login() {
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const { login, status, error } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isLoading = status === 'loading';
    // Get the return path from location state
    const from = location.state?.from || '/dashboard';
    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('=== LOGIN FORM SUBMISSION START ===', {
            returnPath: from,
            timestamp: new Date().toISOString(),
        });
        try {
            await login({ email, password });
            console.log('Login successful, navigating to:', from);
            navigate(from, { replace: true });
        }
        catch (error) {
            console.error('Login failed:', error);
        }
    };
    const handleEmailChange = (e) => {
        setEmail(e.target.value);
    };
    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
    };
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs(Card, { className: "w-[350px]", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Login" }), from !== '/dashboard' && (_jsx("p", { className: "text-sm text-muted-foreground", children: "Please log in to continue to your requested page" }))] }), _jsxs(CardContent, { children: [_jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", type: "email", value: email, onChange: handleEmailChange, required: true, disabled: isLoading, autoFocus: true, placeholder: "Enter your email" })] }), _jsxs("div", { className: "space-y-2", children: [_jsx(Label, { htmlFor: "password", children: "Password" }), _jsx(Input, { id: "password", type: "password", value: password, onChange: handlePasswordChange, required: true, disabled: isLoading, placeholder: "Enter your password" })] }), error && (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error instanceof Error ? error.message : 'Login failed' }) })), _jsx(Button, { type: "submit", className: "w-full", disabled: isLoading, "aria-busy": isLoading, children: isLoading ? 'Logging in...' : 'Login' })] }), _jsxs("p", { className: "mt-4 text-center text-sm text-gray-600", children: ["Don't have an account?", ' ', _jsx(Link, { to: "/signup", className: "font-medium text-blue-600 hover:text-blue-500", state: { from }, children: "Sign up" })] })] })] }) }));
}
