import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
export function CategoryButton({ category, isSelected, isLoading = false, onSelect, className, }) {
    if (isLoading) {
        return _jsx(Skeleton, { className: "h-10 w-full" });
    }
    return (_jsxs(Button, { variant: isSelected ? 'default' : 'outline', className: cn('w-full justify-start text-left font-normal', isSelected && 'bg-accent text-accent-foreground', className), onClick: () => onSelect(category.id), children: [_jsx("span", { className: "truncate", children: category.name }), isSelected && (_jsx("span", { className: "ml-auto flex h-4 w-4 items-center justify-center", children: _jsx("div", { className: "h-2 w-2 rounded-full bg-current" }) }))] }));
}
