import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useNotification } from '../../hooks/useNotification';
import { useToast } from '../../hooks/useToast';
import type { NotificationMessage } from '../../types/hooks';

interface NotificationCenterProps {
  onNotificationClick: (notification: NotificationMessage) => void;
  maxNotifications?: number;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  onNotificationClick,
  maxNotifications = 5,
}) => {
  const {
    notifications,
    permission,
    loading,
    error,
    requestPermission,
    markAsRead,
    clearNotifications,
  } = useNotification();
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
    } catch {
      showToast('Failed to enable notifications', 'error');
    }
  }, [requestPermission, showToast]);

  const handleNotificationClick = useCallback(
    (notification: NotificationMessage) => {
      markAsRead(notification.id);
      onNotificationClick?.(notification);
    },
    [markAsRead, onNotificationClick],
  );

  const handleClearAll = useCallback(() => {
    clearNotifications();
    showToast('All notifications cleared', 'success');
  }, [clearNotifications, showToast]);

  if (loading) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 rounded-lg">
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 text-sm text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (permission.status === 'denied') {
    return (
      <div className="p-4 bg-yellow-50 rounded-lg">
        <p className="text-yellow-700">
          Notifications are disabled. Please enable them in your browser settings.
        </p>
      </div>
    );
  }

  if (permission.status === 'default') {
    return (
      <div className="p-4 bg-blue-50 rounded-lg">
        <p className="text-blue-700 mb-2">Enable notifications to stay updated!</p>
        <button
          onClick={handlePermissionRequest}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Enable Notifications
        </button>
      </div>
    );
  }

  const displayNotifications = notifications
    .slice(0, maxNotifications)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Notifications</h2>
        {notifications.length > 0 && (
          <button onClick={handleClearAll} className="text-sm text-gray-600 hover:text-gray-800">
            Clear all
          </button>
        )}
      </div>

      {displayNotifications.length === 0 ? (
        <div className="p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-gray-600">No new notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {displayNotifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 rounded-lg cursor-pointer transition-colors ${
                notification.read ? 'bg-gray-50 hover:bg-gray-100' : 'bg-blue-50 hover:bg-blue-100'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{notification.title}</h3>
                  <p className="text-sm text-gray-600">{notification.body}</p>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))}

          {notifications.length > maxNotifications && (
            <button
              onClick={() => showToast('View all notifications feature coming soon!', 'info')}
              className="w-full py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              View all ({notifications.length})
            </button>
          )}
        </div>
      )}
    </div>
  );
};
