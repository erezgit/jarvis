import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function PageHeader({ title, description, className }) {
    return (_jsxs("div", { className: cn('space-y-2', className), children: [_jsx("h1", { className: cn('text-3xl font-bold tracking-tight', className), children: title }), description && _jsx("p", { className: "text-muted-foreground", children: description })] }));
}
