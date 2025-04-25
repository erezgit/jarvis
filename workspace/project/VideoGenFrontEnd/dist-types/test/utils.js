import { jsx as _jsx } from "react/jsx-runtime";
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/core/services/queryClient';
const AllTheProviders = ({ children }) => {
    return (_jsx(QueryClientProvider, { client: queryClient, children: _jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: children }) }) }));
};
const customRender = (ui, options = {}) => render(ui, { wrapper: AllTheProviders, ...options });
// re-export everything
export * from '@testing-library/react';
// override render method
export { customRender as render, screen };
