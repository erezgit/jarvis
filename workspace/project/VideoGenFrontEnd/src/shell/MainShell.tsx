import * as React from 'react';
import { createContext, useContext } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { PromptSelectionProvider } from '@/contexts/PromptSelectionContext';

interface ShellContextType {
  showPromptPanel: boolean;
  setShowPromptPanel: (show: boolean) => void;
  togglePromptPanel: () => void;
}

const ShellContext = createContext<ShellContextType>({
  showPromptPanel: false,
  setShowPromptPanel: () => {},
  togglePromptPanel: () => {},
});

export const useShell = () => {
  const context = useContext(ShellContext);
  if (!context) {
    throw new Error('useShell must be used within MainShell');
  }
  return context;
};

export const MainShell: React.FC = () => {
  const { logout } = useAuth();
  const [showPromptPanel, setShowPromptPanel] = React.useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by auth state change
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const togglePromptPanel = React.useCallback(() => {
    setShowPromptPanel((prev) => !prev);
  }, []);

  return (
    <ShellContext.Provider value={{ showPromptPanel, setShowPromptPanel, togglePromptPanel }}>
      <PromptSelectionProvider>
        <div className="flex h-screen bg-[hsl(var(--page-background))]">
          <Sidebar onLogout={handleLogout} />
          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </PromptSelectionProvider>
    </ShellContext.Provider>
  );
};
