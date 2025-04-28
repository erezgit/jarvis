import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function ProjectsListSkeleton({ className, count = 6 }) {
    return (_jsx("div", { className: cn('grid gap-4 md:grid-cols-2 lg:grid-cols-3', className), children: Array.from({ length: count }).map((_, index) => (_jsxs("div", { className: "rounded-lg border bg-card text-card-foreground shadow-sm animate-pulse", children: [_jsx("div", { className: "aspect-video bg-muted rounded-t-lg" }), _jsxs("div", { className: "p-4 space-y-3", children: [_jsx("div", { className: "h-4 bg-muted rounded w-3/4" }), _jsx("div", { className: "space-y-2", children: _jsx("div", { className: "h-24 bg-muted rounded" }) })] })] }, index))) }));
}
