import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useState, useCallback } from 'react';
import { usePromptCategories, usePromptOptions } from '@/core/hooks/prompts';
const initialState = {
    selectedCategory: null,
    selectedOptions: {},
};
const PromptSelectionContext = createContext({
    state: initialState,
    isLoading: false,
    error: null,
    selectCategory: () => { },
    selectOption: () => { },
    clearSelection: () => { },
});
export const PromptSelectionProvider = ({ children }) => {
    const [state, setState] = useState(initialState);
    // Fetch categories and options using our new hooks
    const { isLoading: categoriesLoading, error: categoriesError } = usePromptCategories();
    const { isLoading: optionsLoading, error: optionsError } = usePromptOptions(state.selectedCategory);
    const selectCategory = useCallback((categoryId) => {
        setState((prev) => ({
            ...prev,
            selectedCategory: categoryId,
        }));
    }, []);
    const selectOption = useCallback((option) => {
        setState((prev) => {
            // If this option is already selected, remove it
            if (prev.selectedOptions[option.category]?.id === option.id) {
                const { [option.category]: _, ...rest } = prev.selectedOptions;
                return {
                    ...prev,
                    selectedOptions: rest,
                };
            }
            // Otherwise, update the option for this category
            return {
                ...prev,
                selectedOptions: {
                    ...prev.selectedOptions,
                    [option.category]: option,
                },
            };
        });
    }, []);
    const clearSelection = useCallback(() => {
        setState(initialState);
    }, []);
    // Combine loading and error states
    const isLoading = categoriesLoading || optionsLoading;
    const error = categoriesError || optionsError || null;
    return (_jsx(PromptSelectionContext.Provider, { value: {
            state,
            isLoading,
            error,
            selectCategory,
            selectOption,
            clearSelection,
        }, children: children }));
};
export const usePromptSelection = () => {
    const context = useContext(PromptSelectionContext);
    if (!context) {
        throw new Error('usePromptSelection must be used within a PromptSelectionProvider');
    }
    return context;
};
