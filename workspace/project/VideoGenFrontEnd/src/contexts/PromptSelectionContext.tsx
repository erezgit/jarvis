import * as React from 'react';
import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAllPromptData } from '@/core/hooks/prompts';
import type { PromptSelectionState, PromptOption } from '@/core/services/prompts/types';

interface PromptSelectionContextValue {
  state: PromptSelectionState;
  isLoading: boolean;
  error: Error | null;
  selectCategory: (categoryId: string) => void;
  selectOption: (option: PromptOption) => void;
  clearSelection: () => void;
  getSelectedPromptText: () => string;
}

const initialState: PromptSelectionState = {
  selectedCategory: null,
  selectedOptions: {},
};

const PromptSelectionContext = createContext<PromptSelectionContextValue>({
  state: initialState,
  isLoading: false,
  error: null,
  selectCategory: () => {},
  selectOption: () => {},
  clearSelection: () => {},
  getSelectedPromptText: () => '',
});

interface PromptSelectionProviderProps {
  children: React.ReactNode;
}

export const PromptSelectionProvider: React.FC<PromptSelectionProviderProps> = ({ children }) => {
  const [state, setState] = useState<PromptSelectionState>(initialState);

  // Use the new hook that fetches all data at once
  const { categories, isLoading, error } = useAllPromptData();

  // Initialize with the first category when data is loaded
  useEffect(() => {
    if (!isLoading && categories.length > 0 && !state.selectedCategory) {
      console.log('[PromptSelectionProvider] Initializing with first category:', categories[0].id);
      setState(prev => ({
        ...prev,
        selectedCategory: categories[0].id
      }));
    }
  }, [categories, isLoading, state.selectedCategory]);

  const selectCategory = useCallback((categoryId: string) => {
    setState((prev) => ({
      ...prev,
      selectedCategory: categoryId,
    }));
  }, []);

  const selectOption = useCallback((option: PromptOption) => {
    // Add specific debugging for dynamic options
    if (option.category === 'dynamic') {
      console.log('[PromptSelectionContext] DYNAMIC option selected:', JSON.stringify({
        optionId: option.id,
        optionText: option.text,
        optionCategory: option.category,
        currentSelectedOptions: Object.keys(state.selectedOptions)
      }));
    }
    
    setState((prev) => {
      // If this option is already selected, remove it
      if (prev.selectedOptions[option.category]?.id === option.id) {
        const { [option.category]: _, ...rest } = prev.selectedOptions;
        
        // Debug log for deselection
        if (option.category === 'dynamic') {
          console.log('[PromptSelectionContext] DYNAMIC option deselected');
        }
        
        return {
          ...prev,
          selectedOptions: rest,
        };
      }

      // Otherwise, update the option for this category
      const newState = {
        ...prev,
        selectedOptions: {
          ...prev.selectedOptions,
          [option.category]: option,
        },
      };
      
      // Debug log for selection
      if (option.category === 'dynamic') {
        console.log('[PromptSelectionContext] DYNAMIC option added to selectedOptions:', 
          JSON.stringify(newState.selectedOptions));
      }
      
      return newState;
    });
  }, [state.selectedOptions]);

  const clearSelection = useCallback(() => {
    setState(initialState);
  }, []);

  // Generate prompt text from selected options
  const getSelectedPromptText = useCallback(() => {
    const selectedOptions = state.selectedOptions;
    
    // If no options are selected, return empty string
    if (Object.keys(selectedOptions).length === 0) {
      return '';
    }

    // Start with an empty prompt
    let prompt = '';
    
    // Log all selected options for debugging
    console.log('[PromptSelectionContext] All selected options:', JSON.stringify({
      allOptions: selectedOptions,
      keys: Object.keys(selectedOptions),
      hasMotion: 'motion' in selectedOptions,
      motionOption: selectedOptions['motion']
    }));
    
    // Process environment if selected
    if (selectedOptions['environment']) {
      prompt += `in a ${selectedOptions['environment'].text} setting`;
    }
    
    // Process object if selected
    if (selectedOptions['object']) {
      if (prompt) prompt += '. ';
      prompt += `Surrounded by ${selectedOptions['object'].text}`;
    }
    
    // Process motion if selected - add extra logging
    console.log('[PromptSelectionContext] Before motion check:', JSON.stringify({
      hasMotionKey: 'motion' in selectedOptions,
      motionValue: selectedOptions['motion'],
      motionType: selectedOptions['motion'] ? typeof selectedOptions['motion'] : 'undefined'
    }));
    
    if (selectedOptions['motion']) {
      console.log('[PromptSelectionContext] Motion option found:', selectedOptions['motion'].text);
      if (prompt) prompt += '. ';
      prompt += `${selectedOptions['motion'].text} motion effect`;
    }
    
    // Process treatment if selected
    if (selectedOptions['treatment']) {
      if (prompt) prompt += '. ';
      prompt += `The product has a ${selectedOptions['treatment'].text} effect`;
    }

    // Add a period at the end if there's content
    if (prompt) {
      prompt += '.';
    }
    
    console.log('[PromptSelectionContext] Final generated prompt:', prompt);

    return prompt;
  }, [state.selectedOptions]);

  return (
    <PromptSelectionContext.Provider
      value={{
        state,
        isLoading,
        error,
        selectCategory,
        selectOption,
        clearSelection,
        getSelectedPromptText,
      }}
    >
      {children}
    </PromptSelectionContext.Provider>
  );
};

export const usePromptSelection = () => {
  const context = useContext(PromptSelectionContext);
  if (!context) {
    throw new Error('usePromptSelection must be used within a PromptSelectionProvider');
  }
  return context;
};
