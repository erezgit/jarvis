import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Suspense, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './core/services/queryClient';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import Login from './pages/Login';
import { MainShell } from './shell/MainShell';
import Dashboard from './pages/Dashboard';
import { VideosPage } from './pages/Videos';
import NewVideo from './pages/NewVideo';
import { SignupPage } from './pages/Signup';
import { config } from './config/env';
import { DebugPanel } from './components/debug/DebugPanel';
const App = () => {
    useEffect(() => {
        console.log('App mounted');
    }, []);
    console.log('App rendering');
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx("div", { className: "dark", children: _jsx("div", { className: "min-h-screen bg-background font-sans antialiased", children: _jsx(HashRouter, { children: _jsx(AuthProvider, { children: _jsx(ErrorBoundary, { children: _jsxs(Suspense, { fallback: _jsx("div", { className: "flex items-center justify-center min-h-screen", children: _jsx("div", { className: "text-foreground", children: "Loading..." }) }), children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/signup", element: _jsx(SignupPage, {}) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/dashboard", replace: true }) }), _jsxs(Route, { path: "/", element: _jsx(ProtectedRoute, { children: _jsx(MainShell, {}) }), children: [_jsx(Route, { path: "dashboard", element: _jsx(Dashboard, {}) }), _jsx(Route, { path: "videos", element: _jsx(VideosPage, {}) }), _jsxs(Route, { path: "videos", children: [_jsx(Route, { path: "new", element: _jsx(NewVideo, {}) }), _jsx(Route, { path: "new/:projectId", element: _jsx(NewVideo, {}) })] })] })] }), _jsx(DebugPanel, {}), config.environment === 'production' ? (_jsx("div", { style: {
                                            position: 'fixed',
                                            bottom: 10,
                                            right: 10,
                                            background: '#dc2626',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            zIndex: 9999,
                                        }, children: "PRODUCTION" })) : (_jsx("div", { style: {
                                            position: 'fixed',
                                            bottom: 10,
                                            right: 10,
                                            background: '#2563eb',
                                            color: 'white',
                                            padding: '4px 8px',
                                            borderRadius: '4px',
                                            fontSize: '12px',
                                            fontWeight: 'bold',
                                            zIndex: 9999,
                                        }, children: "DEVELOPMENT" }))] }) }) }) }) }) }) }));
};
export default App;
