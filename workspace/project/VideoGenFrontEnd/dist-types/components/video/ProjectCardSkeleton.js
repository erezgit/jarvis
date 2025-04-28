import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/common/Skeleton';
import { cn } from '@/lib/utils';
export function ProjectCardSkeleton({ className }) {
    return (_jsx(Card, { className: cn('overflow-hidden border-0 bg-transparent', className), children: _jsx(CardContent, { className: "p-0", children: _jsxs("div", { className: "flex gap-5", children: [_jsxs("div", { className: "w-[300px] shrink-0", children: [_jsx(Skeleton, { variant: "card" }), _jsx(Skeleton, { className: "w-24 h-3 mt-2" })] }), _jsx("div", { className: "flex-1", children: _jsx("div", { className: "grid grid-cols-3 gap-4", children: [1, 2, 3].map((i) => (_jsx(Skeleton, { variant: "video" }, i))) }) })] }) }) }));
}
