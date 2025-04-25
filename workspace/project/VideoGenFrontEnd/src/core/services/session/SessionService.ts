import { tokenService } from '../token/TokenService';

export type SessionStatus = 'active' | 'idle' | 'expired';
export type SessionEventType = 'status_change' | 'timeout_warning' | 'expired';

export interface SessionEvent {
  type: SessionEventType;
  status?: SessionStatus;
  timeLeft?: number;
}

export interface SessionListener {
  (event: SessionEvent): void;
}

class SessionService {
  private static readonly IDLE_TIMEOUT = 15 * 60 * 1000; // 15 minutes
  private static readonly WARNING_TIME = 2 * 60 * 1000; // 2 minutes before expiry
  private static readonly ACTIVITY_CHECK_INTERVAL = 1000; // 1 second
  private static readonly STORAGE_KEY = 'session_last_activity';

  private status: SessionStatus = 'idle';
  private lastActivity: number = Date.now();
  private activityCheckInterval?: NodeJS.Timeout;
  private listeners: Set<SessionListener> = new Set();
  private warningShown: boolean = false;

  constructor() {
    // Initialize cross-tab sync
    window.addEventListener('storage', this.handleStorageChange);
    // Initialize activity tracking
    this.initializeActivityTracking();
  }

  private initializeActivityTracking(): void {
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

  private updateActivity(): void {
    this.lastActivity = Date.now();
    sessionStorage.setItem(SessionService.STORAGE_KEY, this.lastActivity.toString());

    if (this.status !== 'active') {
      this.setStatus('active');
    }
    this.warningShown = false;
  }

  private checkActivity(): void {
    const now = Date.now();
    const timeSinceLastActivity = now - this.lastActivity;

    // Check for session expiry
    if (timeSinceLastActivity >= SessionService.IDLE_TIMEOUT) {
      this.handleSessionExpiry();
      return;
    }

    // Show warning before session expires
    if (
      !this.warningShown &&
      timeSinceLastActivity >= SessionService.IDLE_TIMEOUT - SessionService.WARNING_TIME
    ) {
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

  private handleSessionExpiry(): void {
    this.setStatus('expired');
    tokenService.clearTokens();
    this.notifyListeners({ type: 'expired' });
  }

  private handleStorageChange = (event: StorageEvent): void => {
    if (event.key === SessionService.STORAGE_KEY && event.newValue) {
      const newLastActivity = parseInt(event.newValue, 10);
      if (!isNaN(newLastActivity) && newLastActivity > this.lastActivity) {
        this.lastActivity = newLastActivity;
        this.setStatus('active');
      }
    }
  };

  private setStatus(newStatus: SessionStatus): void {
    if (this.status !== newStatus) {
      this.status = newStatus;
      this.notifyListeners({
        type: 'status_change',
        status: newStatus,
      });
    }
  }

  private notifyListeners(event: SessionEvent): void {
    this.listeners.forEach((listener) => {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in session listener:', error);
      }
    });
  }

  // Public methods
  addListener(listener: SessionListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getStatus(): SessionStatus {
    return this.status;
  }

  getTimeUntilExpiry(): number {
    return Math.max(0, SessionService.IDLE_TIMEOUT - (Date.now() - this.lastActivity));
  }

  extendSession(): void {
    this.updateActivity();
  }

  destroy(): void {
    if (this.activityCheckInterval) {
      clearInterval(this.activityCheckInterval);
    }
    window.removeEventListener('storage', this.handleStorageChange);
    this.listeners.clear();
  }
}

export const sessionService = new SessionService();
