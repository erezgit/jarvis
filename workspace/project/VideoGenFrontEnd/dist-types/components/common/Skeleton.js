import { jsx as _jsx } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
export function Skeleton({ className, variant = 'default' }) {
    const baseClasses = 'animate-pulse bg-muted rounded-lg';
    const variantClasses = {
        default: 'h-4',
        card: 'aspect-video w-full',
        video: 'w-[300px] aspect-video',
    };
    return _jsx("div", { className: cn(baseClasses, variantClasses[variant], className) });
}
