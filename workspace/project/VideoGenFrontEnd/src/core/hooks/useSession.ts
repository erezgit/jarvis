import { useState, useEffect, useCallback } from 'react';
import {
  sessionService,
  type SessionStatus,
  type SessionEvent,
} from '../services/session/SessionService';

interface UseSessionReturn {
  status: SessionStatus;
  timeUntilExpiry: number;
  extendSession: () => void;
}

export function useSession(): UseSessionReturn {
  const [status, setStatus] = useState<SessionStatus>(sessionService.getStatus());
  const [timeUntilExpiry, setTimeUntilExpiry] = useState<number>(
    sessionService.getTimeUntilExpiry(),
  );

  useEffect(() => {
    // Handle session events
    const cleanup = sessionService.addListener((event: SessionEvent) => {
      switch (event.type) {
        case 'status_change':
          if (event.status) {
            setStatus(event.status);
          }
          break;
        case 'timeout_warning':
          if (event.timeLeft) {
            setTimeUntilExpiry(event.timeLeft);
          }
          break;
        case 'expired':
          setTimeUntilExpiry(0);
          break;
      }
    });

    // Update time until expiry periodically
    const interval = setInterval(() => {
      setTimeUntilExpiry(sessionService.getTimeUntilExpiry());
    }, 1000);

    return () => {
      cleanup();
      clearInterval(interval);
    };
  }, []);

  const extendSession = useCallback(() => {
    sessionService.extendSession();
  }, []);

  return {
    status,
    timeUntilExpiry,
    extendSession,
  };
}
