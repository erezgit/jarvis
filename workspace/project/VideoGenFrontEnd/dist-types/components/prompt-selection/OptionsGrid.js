import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
export function OptionsGrid({ options, selectedOption, isLoading = false, error = null, onSelect, className, }) {
    // Show loading state
    if (isLoading) {
        return (_jsx("div", { className: "grid grid-cols-3 gap-3", children: Array.from({ length: 6 }).map((_, i) => (_jsx(Skeleton, { className: "w-[104px] h-[104px] rounded-md" }, i))) }));
    }
    // Show error state
    if (error) {
        return (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error.message }) }));
    }
    // Show empty state
    if (options.length === 0) {
        return _jsx("div", { className: "text-center py-8 text-muted-foreground", children: "No options available" });
    }
    return (_jsx("div", { className: "w-full", children: _jsx("div", { className: "grid grid-cols-3 gap-3", children: options.map((option) => (_jsxs(Button, { variant: "outline", className: `
              relative w-[104px] h-[104px] p-0 overflow-hidden group
              border-2 hover:bg-transparent hover:border-primary
              ${selectedOption?.id === option.id ? 'border-primary bg-transparent' : 'bg-transparent'}
            `, onClick: () => onSelect(option), children: [_jsx("img", { src: option.imageUrl, alt: option.text, className: "absolute inset-0 w-full h-full object-cover" }), _jsx("div", { className: "absolute inset-0 bg-black/40 flex items-center justify-center p-2", children: _jsx("span", { className: "text-xs text-white bg-black/40 px-2 py-1 rounded-sm text-center leading-tight", children: option.text.length > 10 ? `${option.text.slice(0, 10)}...` : option.text }) }), selectedOption?.id === option.id && (_jsx("div", { className: "absolute inset-0 bg-primary/20 border-2 border-primary" }))] }, option.id))) }) }));
}
