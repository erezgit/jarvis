import { useState, useEffect } from 'react';

/**
 * Hook to detect dark mode preference
 * This hook checks both system preferences and application theme settings
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check for dark mode preference
    if (typeof window !== 'undefined') {
      // First check for CSS variables or data attributes
      const htmlElement = document.documentElement;
      const colorMode = htmlElement.getAttribute('data-color-mode');
      if (colorMode === 'dark') return true;
      
      // Then check for media query
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });
  
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setIsDarkMode(e.matches);
    };
    
    // Add event listener for OS theme changes
    if (darkModeMediaQuery.addEventListener) {
      darkModeMediaQuery.addEventListener('change', handleChange);
      return () => darkModeMediaQuery.removeEventListener('change', handleChange);
    }
    
    // Fallback for older browsers
    darkModeMediaQuery.addListener(handleChange);
    return () => darkModeMediaQuery.removeListener(handleChange);
  }, []);
  
  // Also listen for theme changes in the app
  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-color-mode') {
          const htmlElement = document.documentElement;
          const colorMode = htmlElement.getAttribute('data-color-mode');
          setIsDarkMode(colorMode === 'dark');
        }
      });
    });
    
    observer.observe(document.documentElement, { attributes: true });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return { isDarkMode };
}

export default useDarkMode; 