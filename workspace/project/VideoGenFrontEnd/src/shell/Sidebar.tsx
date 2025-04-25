import * as React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Video, Plus, LogOut, Compass, Settings, CreditCard, History } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePromptSelection } from '@/contexts/PromptSelectionContext';
import { useAuth } from '@/hooks/useAuth';
import TokenBalance from '@/components/tokens/TokenBalance';

interface SidebarProps {
  onLogout: () => Promise<void>;
}

export const Sidebar: React.FC<SidebarProps> = ({ onLogout }) => {
  const { clearSelection } = usePromptSelection();
  const navigate = useNavigate();
  const { user } = useAuth();
  // For now, let's assume all users can access the admin page
  // In a real application, you would check the user's role
  const isAdmin = true;

  // Handle click on New Video link to reset context
  const handleNewVideoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Navigate to the new video page without any project ID
    // The NewVideoPage component will handle the reset on mount
    navigate('/videos/new');
  };

  return (
    <aside className="w-64 bg-[hsl(var(--sidebar-background))]">
      <nav className="h-full flex flex-col">
        <div className="p-6">
          <h1 className="text-2xl font-bold text-primary">Video Gen</h1>
        </div>

        {/* New Video button - highlighted and separated */}
        <div className="px-3 py-2">
          <a
            href="/videos/new"
            onClick={handleNewVideoClick}
            className="flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors bg-zinc-900 text-white hover:bg-zinc-800"
          >
            <Plus size={18} />
            New Video
          </a>
        </div>

        {/* Regular navigation items */}
        <div className="flex-1 px-3 py-2 space-y-1">
          {/* Dashboard button is hidden for now */}
          {/* <NavLink
            to="/dashboard"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--highlight-background))] text-primary'
                  : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary',
              )
            }
          >
            <Home size={18} />
            Dashboard
          </NavLink> */}

          <NavLink
            to="/discovery"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--highlight-background))] text-primary'
                  : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary',
              )
            }
          >
            <Compass size={18} />
            Discovery
          </NavLink>

          <NavLink
            to="/videos"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--highlight-background))] text-primary'
                  : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary',
              )
            }
          >
            <Video size={18} />
            Videos
          </NavLink>

          <NavLink
            to="/credits"
            end
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                isActive
                  ? 'bg-[hsl(var(--highlight-background))] text-primary'
                  : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary',
              )
            }
          >
            <CreditCard size={18} />
            Credits
          </NavLink>

          {/* Manage Discovery button is hidden as requested */}
          {/* {isAdmin && (
            <NavLink
              to="/admin/discovery"
              end
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors',
                  isActive
                    ? 'bg-[hsl(var(--highlight-background))] text-primary'
                    : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary',
                )
              }
            >
              <Settings size={18} />
              Manage Discovery
            </NavLink>
          )} */}
        </div>

        {/* Token Balance - Moved to bottom above logout */}
        <div className="p-3 border-t border-border">
          <div className="border border-white/50 rounded-md p-3 bg-transparent text-white">
            <TokenBalance size="sm" showAddButton={false} className="text-white" />
          </div>
        </div>

        {/* Logout Button */}
        <div className="p-3 border-t border-border">
          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </nav>
    </aside>
  );
};
