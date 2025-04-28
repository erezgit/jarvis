import { useState, useEffect, useCallback } from 'react';
import { UseNotificationReturn, NotificationPermission, NotificationMessage } from '../types/hooks';
import { useAuth } from './useAuth';

const VAPID_PUBLIC_KEY = process.env.REACT_APP_VAPID_PUBLIC_KEY;

export function useNotification(): UseNotificationReturn {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>({
    status: 'default',
    subscription: null,
  });
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Check initial permission status
  useEffect(() => {
    if ('Notification' in window) {
      setPermission((prev) => ({
        ...prev,
        status: Notification.permission,
      }));
    }
  }, []);

  // WebSocket connection for real-time notifications
  useEffect(() => {
    if (!user || permission.status !== 'granted') return;

    const ws = new WebSocket(process.env.REACT_APP_WS_URL || '');

    ws.onmessage = (event) => {
      try {
        const message: NotificationMessage = JSON.parse(event.data);
        setNotifications((prev) => [...prev, message]);

        // Show browser notification if supported
        if ('Notification' in window && permission.status === 'granted') {
          new Notification(message.title, {
            body: message.body,
            icon: message.icon,
            data: message.data,
          });
        }
      } catch (err) {
        console.error('Failed to parse notification:', err);
      }
    };

    return () => {
      ws.close();
    };
  }, [user, permission.status]);

  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported');
    }

    setLoading(true);
    setError(null);

    try {
      const result = await Notification.requestPermission();
      setPermission((prev) => ({
        ...prev,
        status: result,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to request permission'));
    } finally {
      setLoading(false);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !VAPID_PUBLIC_KEY) {
      throw new Error('Push notifications not supported');
    }

    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: VAPID_PUBLIC_KEY,
      });

      // Send subscription to backend
      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          userId: user?.id,
        }),
      });

      setPermission((prev) => ({
        ...prev,
        subscription,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to subscribe'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  const unsubscribe = useCallback(async () => {
    if (!permission.subscription) return;

    setLoading(true);
    setError(null);

    try {
      await permission.subscription.unsubscribe();

      // Notify backend
      await fetch('/api/notifications/unsubscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
        }),
      });

      setPermission((prev) => ({
        ...prev,
        subscription: null,
      }));
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unsubscribe'));
    } finally {
      setLoading(false);
    }
  }, [permission.subscription, user]);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  return {
    permission,
    notifications,
    loading,
    error,
    requestPermission,
    subscribe,
    unsubscribe,
    clearNotifications,
    markAsRead,
  };
}
