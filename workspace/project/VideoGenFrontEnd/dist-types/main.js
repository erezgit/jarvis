import { jsx as _jsx } from "react/jsx-runtime";
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import { AuthProvider } from '@/contexts/AuthContext';
import './styles/global.css';
import validateConfig from './utils/config-validator';
// Validate configuration at startup
validateConfig();
const rootElement = document.getElementById('root');
if (!rootElement) {
    throw new Error('Failed to find the root element');
}
const root = createRoot(rootElement);
root.render(_jsx(React.StrictMode, { children: _jsx(AuthProvider, { children: _jsx(App, {}) }) }));
