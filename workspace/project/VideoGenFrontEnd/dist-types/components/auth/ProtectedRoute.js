import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
export const ProtectedRoute = ({ children, fallback }) => {
    const { isAuthenticated, status, error } = useAuth();
    const location = useLocation();
    const [shouldRedirect, setShouldRedirect] = useState(false);
    // Add a delay before redirecting to give auth time to initialize
    useEffect(() => {
        let timer;
        // Only start the redirect timer if we're not loading and not authenticated
        if (status !== 'loading' && !isAuthenticated) {
            console.log('Starting redirect timer - not authenticated');
            timer = setTimeout(() => {
                console.log('Redirect timer expired, setting shouldRedirect to true');
                setShouldRedirect(true);
            }, 1000); // Give auth 1 second to initialize
        }
        return () => {
            if (timer)
                clearTimeout(timer);
        };
    }, [status, isAuthenticated]);
    // Show loading state while auth is initializing
    if (status === 'loading' || status === 'idle') {
        console.log('Auth status is loading or idle, showing loading state');
        return (fallback || (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-foreground", children: "Authenticating..." }) })));
    }
    // Show error state
    if (error) {
        console.error('Auth error:', error);
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // Redirect to login if not authenticated and timer has expired
    if (!isAuthenticated && shouldRedirect) {
        console.log('User is not authenticated and timer expired, redirecting to login');
        return _jsx(Navigate, { to: "/login", state: { from: location }, replace: true });
    }
    // If authenticated or still waiting, show content
    if (isAuthenticated) {
        console.log('User is authenticated, rendering protected content');
        return _jsx(_Fragment, { children: children });
    }
    // Still waiting for redirect timer
    console.log('Waiting for redirect timer, showing loading state');
    return (fallback || (_jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-foreground", children: "Verifying authentication..." }) })));
};
ProtectedRoute.propTypes = {
    children: PropTypes.node.isRequired,
    fallback: PropTypes.node,
};
export default ProtectedRoute;
