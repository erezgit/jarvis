import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/useToast';
import { Spinner } from '@/components/common/Spinner';
const LoadingSpinner = () => (_jsx("div", { className: "flex h-screen items-center justify-center", children: _jsx(Spinner, { size: "sm" }) }));
const ErrorFallback = ({ error }) => (_jsxs("div", { className: "flex flex-col items-center justify-center min-h-screen p-4", children: [_jsx("div", { className: "text-destructive text-lg font-semibold mb-2", children: "Authentication Error" }), _jsx("div", { className: "text-muted-foreground text-center", children: error.message }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2", children: "Try Again" })] }));
export const AuthGuard = ({ requireAuth = true, redirectTo = '/login', }) => {
    const { isAuthenticated, status, error } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    useEffect(() => {
        // Only process redirects when we have a definitive auth state
        if (status === 'loading')
            return;
        const shouldRedirect = requireAuth ? !isAuthenticated : isAuthenticated;
        if (shouldRedirect) {
            const message = requireAuth
                ? 'Please log in to access this page'
                : 'You are already logged in';
            showToast(message, 'info');
            if (requireAuth && location.pathname !== '/login') {
                // Store the attempted URL for redirecting after login
                const returnUrl = encodeURIComponent(location.pathname + location.search);
                navigate(`${redirectTo}?returnUrl=${returnUrl}`);
            }
            else {
                navigate(redirectTo);
            }
        }
    }, [isAuthenticated, status, navigate, location, requireAuth, redirectTo, showToast]);
    // Show loading state
    if (status === 'loading') {
        return _jsx(LoadingSpinner, {});
    }
    // Show error state
    if (status === 'error' && error) {
        return _jsx(ErrorFallback, { error: error });
    }
    // If we're not loading and the authentication state matches our requirements,
    // render the protected content
    const isAuthorized = requireAuth ? isAuthenticated : !isAuthenticated;
    return isAuthorized ? _jsx(Outlet, {}) : null;
};
// Higher-order component for protecting individual routes
export const withAuthGuard = (WrappedComponent, guardProps = {}) => {
    const WithAuthGuardComponent = (props) => {
        const { isAuthenticated, status, error } = useAuth();
        if (status === 'loading') {
            return _jsx(LoadingSpinner, {});
        }
        if (status === 'error' && error) {
            return _jsx(ErrorFallback, { error: error });
        }
        const isAuthorized = guardProps.requireAuth ? isAuthenticated : !isAuthenticated;
        return isAuthorized ? _jsx(WrappedComponent, { ...props }) : null;
    };
    WithAuthGuardComponent.displayName = `WithAuthGuard(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;
    return WithAuthGuardComponent;
};
