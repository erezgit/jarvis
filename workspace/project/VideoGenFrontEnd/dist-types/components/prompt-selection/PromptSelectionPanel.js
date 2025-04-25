import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/lib/utils';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { usePromptCategories, usePromptOptions } from '@/core/hooks/prompts';
import { OptionsGrid } from './OptionsGrid';
import { CategoryButton } from './CategoryButton';
import { Alert, AlertDescription } from '@/components/ui/alert';
export function PromptSelectionPanel({ className }) {
    // Get selection state and actions from context
    const { state, isLoading: contextLoading, error: contextError, selectCategory, selectOption, } = usePromptSelection();
    // Fetch categories and options
    const { data: categories = [], isLoading: categoriesLoading, error: categoriesError, } = usePromptCategories();
    const { data: options = [], isLoading: optionsLoading, error: optionsError, } = usePromptOptions(state.selectedCategory);
    // Show error if any
    const error = contextError || categoriesError || optionsError;
    if (error) {
        return (_jsx(Alert, { variant: "destructive", children: _jsx(AlertDescription, { children: error.message }) }));
    }
    return (_jsxs("div", { className: cn('space-y-4', className), children: [_jsx("div", { className: "space-y-2", children: categories.map((category) => (_jsx(CategoryButton, { category: category, isSelected: state.selectedCategory === category.id, isLoading: categoriesLoading || contextLoading, onSelect: selectCategory }, category.id))) }), state.selectedCategory && (_jsx(OptionsGrid, { options: options, selectedOption: state.selectedOptions[state.selectedCategory], isLoading: optionsLoading || contextLoading, error: error, onSelect: selectOption }))] }));
}
