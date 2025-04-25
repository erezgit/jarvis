import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }
    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }
    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }
            return (_jsxs(Alert, { variant: "destructive", className: "m-4", children: [_jsx(AlertTitle, { children: "Something went wrong" }), _jsx(AlertDescription, { children: this.state.error?.message || 'An unexpected error occurred' }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90", children: "Reload Page" })] }));
        }
        return this.props.children;
    }
}
