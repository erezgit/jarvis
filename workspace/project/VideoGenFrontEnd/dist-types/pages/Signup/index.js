import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { SignupForm } from '@/components/auth/SignupForm';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
export const SignupPage = () => {
    const location = useLocation();
    const from = location.state?.from || '/dashboard';
    return (_jsx("div", { className: "min-h-screen flex items-center justify-center bg-background", children: _jsxs(Card, { className: "w-[350px]", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Create Account" }), from !== '/dashboard' && (_jsx("p", { className: "text-sm text-muted-foreground", children: "Sign up to continue to your requested page" }))] }), _jsxs(CardContent, { children: [_jsx(SignupForm, { returnPath: from }), _jsxs("p", { className: "mt-4 text-center text-sm text-gray-600", children: ["Already have an account?", ' ', _jsx(Link, { to: "/login", className: "font-medium text-blue-600 hover:text-blue-500", state: { from }, children: "Login" })] })] })] }) }));
};
export default SignupPage;
