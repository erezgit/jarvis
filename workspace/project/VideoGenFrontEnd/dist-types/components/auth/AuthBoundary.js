import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Suspense, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { RouteService } from '@/core/services/route/RouteService';
const DefaultLoader = () => (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-primary" }) }));
const DefaultError = ({ error }) => (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen", children: [_jsx("div", { className: "text-destructive text-lg font-semibold mb-2", children: "Authentication Error" }), _jsx("div", { className: "text-muted-foreground", children: error.message })] }));
export const AuthBoundary = ({ children, fallback = _jsx(DefaultLoader, {}), errorFallback = _jsx(DefaultError, { error: new Error('Authentication failed') }), }) => {
    const { status, isAuthenticated } = useAuth();
    const location = useLocation();
    // Save current route when mounting
    useEffect(() => {
        if (location.pathname !== '/login') {
            RouteService.saveRoute(location.pathname + location.search);
        }
    }, [location]);
    if (status === 'loading') {
        return _jsx(_Fragment, { children: fallback });
    }
    if (status === 'error') {
        return _jsx(_Fragment, { children: errorFallback });
    }
    if (!isAuthenticated) {
        return _jsx(Navigate, { to: "/login", replace: true });
    }
    return _jsx(Suspense, { fallback: fallback, children: children });
};
