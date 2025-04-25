import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
export function ErrorDisplay({ error, className, message = 'Something went wrong', }) {
    const errorMessage = error?.message || message;
    return (_jsx("div", { className: cn('rounded-lg border border-destructive/50 bg-destructive/10 p-4', className), children: _jsxs("div", { className: "flex items-center gap-2 text-destructive", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx("p", { className: "text-sm font-medium", children: errorMessage })] }) }));
}
