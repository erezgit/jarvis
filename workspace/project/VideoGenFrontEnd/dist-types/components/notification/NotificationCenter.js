import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useCallback, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useToast } from '../../hooks/useToast';
export const NotificationCenter = ({ onNotificationClick, maxNotifications = 5, }) => {
    const { notifications, permission, loading, error, requestPermission, markAsRead, clearNotifications, } = useNotification();
    const { showToast } = useToast();
    // Request notification permission on mount if not already granted
    useEffect(() => {
        if (permission.status === 'default') {
            requestPermission().catch(() => {
                console.error('Failed to get notification permission');
            });
        }
    }, [permission.status, requestPermission, showToast]);
    const handlePermissionRequest = useCallback(async () => {
        try {
            await requestPermission();
            showToast('Notification permission granted!', 'success');
        }
        catch {
            showToast('Failed to enable notifications', 'error');
        }
    }, [requestPermission, showToast]);
    const handleNotificationClick = useCallback((notification) => {
        markAsRead(notification.id);
        onNotificationClick?.(notification);
    }, [markAsRead, onNotificationClick]);
    const handleClearAll = useCallback(() => {
        clearNotifications();
        showToast('All notifications cleared', 'success');
    }, [clearNotifications, showToast]);
    if (loading) {
        return (_jsx("div", { className: "p-4 bg-white rounded-lg shadow-lg", children: _jsxs("div", { className: "animate-pulse space-y-4", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-1/2" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-5/6" })] }) }));
    }
    if (error) {
        return (_jsxs("div", { className: "p-4 bg-red-50 rounded-lg", children: [_jsx("p", { className: "text-red-600", children: error.message }), _jsx("button", { onClick: () => window.location.reload(), className: "mt-2 text-sm text-red-600 hover:text-red-800", children: "Try again" })] }));
    }
    if (permission.status === 'denied') {
        return (_jsx("div", { className: "p-4 bg-yellow-50 rounded-lg", children: _jsx("p", { className: "text-yellow-700", children: "Notifications are disabled. Please enable them in your browser settings." }) }));
    }
    if (permission.status === 'default') {
        return (_jsxs("div", { className: "p-4 bg-blue-50 rounded-lg", children: [_jsx("p", { className: "text-blue-700 mb-2", children: "Enable notifications to stay updated!" }), _jsx("button", { onClick: handlePermissionRequest, className: "px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors", children: "Enable Notifications" })] }));
    }
    const displayNotifications = notifications
        .slice(0, maxNotifications)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    return (_jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "flex justify-between items-center", children: [_jsx("h2", { className: "text-lg font-semibold", children: "Notifications" }), notifications.length > 0 && (_jsx("button", { onClick: handleClearAll, className: "text-sm text-gray-600 hover:text-gray-800", children: "Clear all" }))] }), displayNotifications.length === 0 ? (_jsx("div", { className: "p-4 bg-gray-50 rounded-lg text-center", children: _jsx("p", { className: "text-gray-600", children: "No new notifications" }) })) : (_jsxs("div", { className: "space-y-2", children: [displayNotifications.map((notification) => (_jsx("div", { onClick: () => handleNotificationClick(notification), className: `p-4 rounded-lg cursor-pointer transition-colors ${notification.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'}`, children: _jsxs("div", { className: "flex justify-between items-start", children: [_jsxs("div", { children: [_jsx("h3", { className: "font-medium", children: notification.title }), _jsx("p", { className: "text-sm text-gray-600", children: notification.body })] }), _jsx("span", { className: "text-xs text-gray-500", children: new Date(notification.timestamp).toLocaleTimeString() })] }) }, notification.id))), notifications.length > maxNotifications && (_jsxs("button", { onClick: () => showToast('View all notifications feature coming soon!', 'info'), className: "w-full py-2 text-sm text-gray-600 hover:text-gray-800", children: ["View all (", notifications.length, ")"] }))] }))] }));
};
