import { useState, useEffect, useCallback } from 'react';
import { sessionService, } from '../services/session/SessionService';
export function useSession() {
    const [status, setStatus] = useState(sessionService.getStatus());
    const [timeUntilExpiry, setTimeUntilExpiry] = useState(sessionService.getTimeUntilExpiry());
    useEffect(() => {
        // Handle session events
        const cleanup = sessionService.addListener((event) => {
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
