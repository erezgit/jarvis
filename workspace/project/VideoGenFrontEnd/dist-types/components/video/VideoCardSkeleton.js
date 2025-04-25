import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';
export function VideoCardSkeleton({ className, size = 'default' }) {
    return (_jsx(Card, { className: cn('w-fit border-0 bg-transparent', className), children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { children: [_jsx("div", { className: "relative", children: _jsx(Skeleton, { variant: "video", className: cn(size === 'large' ? 'w-[500px] h-[281px]' : 'w-[300px] h-[169px]') }) }), _jsx(Skeleton, { className: "w-3/4 h-3 mt-2" })] }) }) }));
}
