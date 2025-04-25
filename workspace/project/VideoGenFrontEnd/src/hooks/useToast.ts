// Built-in modules
import { useState, useCallback, useRef, useEffect } from 'react';

// Internal modules
import { UseToastReturn } from '@/types/hooks';

interface ToastMessage {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

const DEFAULT_DURATION = 3000; // 3 seconds

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const timeoutIds = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const clearToast = useCallback((id: string) => {
    setToasts((current) => {
      const newToasts = current.filter((toast) => toast.id !== id);
      if (newToasts.length === 0) {
        setIsVisible(false);
      }
      return newToasts;
    });
    const timeoutId = timeoutIds.current.get(id);
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutIds.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' = 'info', duration = DEFAULT_DURATION) => {
      const id = Math.random().toString(36).substring(7);
      const newToast: ToastMessage = {
        id,
        message,
        type,
        duration,
      };

      setToasts((current) => [...current, newToast]);
      setIsVisible(true);

      // Auto-dismiss after duration
      const timeoutId = setTimeout(() => {
        clearToast(id);
      }, duration);

      timeoutIds.current.set(id, timeoutId);

      return id;
    },
    [clearToast],
  );

  const dismissToast = useCallback(
    (id?: string) => {
      if (id) {
        clearToast(id);
      } else {
        // Dismiss all toasts
        setToasts((current) => {
          current.forEach((toast) => {
            const timeoutId = timeoutIds.current.get(toast.id);
            if (timeoutId) {
              clearTimeout(timeoutId);
              timeoutIds.current.delete(toast.id);
            }
          });
          setIsVisible(false);
          return [];
        });
      }
    },
    [clearToast],
  );

  // Cleanup timeouts on unmount
  useEffect(() => {
    // Copy the ref value to a local variable
    const currentTimeouts = timeoutIds.current;

    return () => {
      // Use the copied value in cleanup
      currentTimeouts.forEach((timeoutId) => {
        clearTimeout(timeoutId);
      });
      currentTimeouts.clear();
      setToasts([]);
      setIsVisible(false);
    };
  }, []);

  return {
    toasts,
    isVisible,
    showToast,
    dismissToast,
  };
}
