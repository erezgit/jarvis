import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
/// <reference lib="dom" />
/// <reference lib="dom.iterable" />
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
export function VideoPrompt({ className, prompt, isGenerating, canGenerate, onPromptChange, onSubmit, }) {
    return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsx("div", { className: "space-y-2", children: _jsx(Textarea, { id: "prompt", placeholder: "Enter video description", value: prompt, onChange: (e) => onPromptChange(e.target.value), disabled: isGenerating, className: "min-h-[100px] bg-muted resize-y" }) }), _jsx(Button, { onClick: onSubmit, disabled: !canGenerate || isGenerating, className: "w-full", children: isGenerating ? (_jsxs(_Fragment, { children: [_jsx(Loader2, { className: "mr-2 h-4 w-4 animate-spin" }), "Generating..."] })) : ('Generate Video') })] }));
}
