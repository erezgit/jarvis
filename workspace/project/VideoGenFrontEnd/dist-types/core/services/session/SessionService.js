import { tokenService } from '../token/TokenService';
class SessionService {
    constructor() {
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 'idle'
        });
        Object.defineProperty(this, "lastActivity", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: Date.now()
        });
        Object.defineProperty(this, "activityCheckInterval", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: new Set()
        });
        Object.defineProperty(this, "warningShown", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "handleStorageChange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: (event) => {
                if (event.key === SessionService.STORAGE_KEY && event.newValue) {
                    const newLastActivity = parseInt(event.newValue, 10);
                    if (!isNaN(newLastActivity) && newLastActivity > this.lastActivity) {
                        this.lastActivity = newLastActivity;
                        this.setStatus('active');
                    }
                }
            }
        });
        // Initialize cross-tab sync
        window.addEventListener('storage', this.handleStorageChange);
        // Initialize activity tracking
        this.initializeActivityTracking();
    }
    initializeActivityTracking() {
        // Track user activity
        ['mousedown', 'keydown', 'touchstart', 'scroll'].forEach((eventName) => {
            window.addEventListener(eventName, () => this.updateActivity());
        });
        // Start activity check interval
        this.activityCheckInterval = setInterval(() => {
            this.checkActivity();
        }, SessionService.ACTIVITY_CHECK_INTERVAL);
        // Initial activity timestamp
        this.updateActivity();
    }
    updateActivity() {
        this.lastActivity = Date.now();
        sessionStorage.setItem(SessionService.STORAGE_KEY, this.lastActivity.toString());
        if (this.status !== 'active') {
            this.setStatus('active');
        }
        this.warningShown = false;
    }
    checkActivity() {
        const now = Date.now();
        const timeSinceLastActivity = now - this.lastActivity;
        // Check for session expiry
        if (timeSinceLastActivity >= SessionService.IDLE_TIMEOUT) {
            this.handleSessionExpiry();
            return;
        }
        // Show warning before session expires
        if (!this.warningShown &&
            timeSinceLastActivity >= SessionService.IDLE_TIMEOUT - SessionService.WARNING_TIME) {
            this.warningShown = true;
            this.notifyListeners({
                type: 'timeout_warning',
                timeLeft: SessionService.IDLE_TIMEOUT - timeSinceLastActivity,
            });
        }
        // Update status to idle if inactive
        if (timeSinceLastActivity >= SessionService.WARNING_TIME && this.status === 'active') {
            this.setStatus('idle');
        }
    }
    handleSessionExpiry() {
        this.setStatus('expired');
        tokenService.clearTokens();
        this.notifyListeners({ type: 'expired' });
    }
    setStatus(newStatus) {
        if (this.status !== newStatus) {
            this.status = newStatus;
            this.notifyListeners({
                type: 'status_change',
                status: newStatus,
            });
        }
    }
    notifyListeners(event) {
        this.listeners.forEach((listener) => {
            try {
                listener(event);
            }
            catch (error) {
                console.error('Error in session listener:', error);
            }
        });
    }
    // Public methods
    addListener(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }
    getStatus() {
        return this.status;
    }
    getTimeUntilExpiry() {
        return Math.max(0, SessionService.IDLE_TIMEOUT - (Date.now() - this.lastActivity));
    }
    extendSession() {
        this.updateActivity();
    }
    destroy() {
        if (this.activityCheckInterval) {
            clearInterval(this.activityCheckInterval);
        }
        window.removeEventListener('storage', this.handleStorageChange);
        this.listeners.clear();
    }
}
Object.defineProperty(SessionService, "IDLE_TIMEOUT", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 15 * 60 * 1000
}); // 15 minutes
Object.defineProperty(SessionService, "WARNING_TIME", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 2 * 60 * 1000
}); // 2 minutes before expiry
Object.defineProperty(SessionService, "ACTIVITY_CHECK_INTERVAL", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 1000
}); // 1 second
Object.defineProperty(SessionService, "STORAGE_KEY", {
    enumerable: true,
    configurable: true,
    writable: true,
    value: 'session_last_activity'
});
export const sessionService = new SessionService();
