import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
export function PromptPresets({ onSelect, className }) {
    return (_jsxs("div", { className: cn('flex gap-2', className), children: [_jsx(Button, { variant: "outline", className: "flex-1", onClick: () => onSelect('static short'), children: "Static" }), _jsx(Button, { variant: "outline", className: "flex-1", onClick: () => onSelect('motion short'), children: "Motion" })] }));
}
