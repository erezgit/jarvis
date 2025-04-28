import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import * as React from 'react';
import { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { PromptSelectionProvider } from '@/contexts/PromptSelectionContext';
const ShellContext = createContext({
    showPromptPanel: false,
    setShowPromptPanel: () => { },
    togglePromptPanel: () => { },
});
export const useShell = () => {
    const context = useContext(ShellContext);
    if (!context) {
        throw new Error('useShell must be used within MainShell');
    }
    return context;
};
export const MainShell = () => {
    const { logout } = useAuth();
    const [showPromptPanel, setShowPromptPanel] = React.useState(false);
    const handleLogout = async () => {
        try {
            await logout();
            // Navigation will be handled by auth state change
        }
        catch (error) {
            console.error('Logout failed:', error);
        }
    };
    const togglePromptPanel = React.useCallback(() => {
        setShowPromptPanel((prev) => !prev);
    }, []);
    return (_jsx(ShellContext.Provider, { value: { showPromptPanel, setShowPromptPanel, togglePromptPanel }, children: _jsx(PromptSelectionProvider, { children: _jsxs("div", { className: "flex h-screen bg-[hsl(var(--page-background))]", children: [_jsx(Sidebar, { onLogout: handleLogout }), _jsx("main", { className: "flex-1 overflow-hidden", children: _jsx(Outlet, {}) })] }) }) }));
};
