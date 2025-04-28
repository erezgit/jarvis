import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink } from 'react-router-dom';
import { Home, Video, Plus, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
export const Sidebar = ({ onLogout }) => {
    return (_jsx("aside", { className: "w-64 bg-[hsl(var(--sidebar-background))]", children: _jsxs("nav", { className: "h-full flex flex-col", children: [_jsx("div", { className: "p-6", children: _jsx("h1", { className: "text-2xl font-bold text-primary", children: "Video Gen" }) }), _jsxs("div", { className: "flex-1 px-3 py-2 space-y-1", children: [_jsxs(NavLink, { to: "/dashboard", end: true, className: ({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive
                                ? 'bg-[hsl(var(--highlight-background))] text-primary'
                                : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary'), children: [_jsx(Home, { size: 18 }), "Dashboard"] }), _jsxs(NavLink, { to: "/videos", end: true, className: ({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive
                                ? 'bg-[hsl(var(--highlight-background))] text-primary'
                                : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary'), children: [_jsx(Video, { size: 18 }), "Videos"] }), _jsxs(NavLink, { to: "/videos/new", end: true, className: ({ isActive }) => cn('flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors', isActive
                                ? 'bg-[hsl(var(--highlight-background))] text-primary'
                                : 'text-muted-foreground hover:bg-[hsl(var(--highlight-background))] hover:text-primary'), children: [_jsx(Plus, { size: 18 }), "New Video"] })] }), _jsx("div", { className: "p-3 mt-auto border-t border-border", children: _jsxs("button", { onClick: onLogout, className: "flex w-full items-center gap-3 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors", children: [_jsx(LogOut, { size: 18 }), "Logout"] }) })] }) }));
};
