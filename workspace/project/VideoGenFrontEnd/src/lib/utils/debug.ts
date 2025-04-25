/**
 * Debug utilities for tracking application state and troubleshooting issues
 */

// Global state tracking
interface DebugState {
  videoPlayers: Record<string, VideoPlayerState>;
  spinners: Record<string, SpinnerState>;
  lastError: Error | null;
  logs: DebugLog[];
}

interface VideoPlayerState {
  id: string;
  videoUrl: string | null;
  status: string;
  isLoading: boolean;
  isPlaying: boolean;
  readyState?: number;
  error?: any;
  lastUpdated: number;
}

interface SpinnerState {
  id: string;
  createdAt: number;
  location: string;
  isActive: boolean;
}

interface DebugLog {
  timestamp: number;
  component: string;
  message: string;
  data?: any;
}

// Initialize global debug state
const debugState: DebugState = {
  videoPlayers: {},
  spinners: {},
  lastError: null,
  logs: []
};

// Maximum number of logs to keep
const MAX_LOGS = 1000;

/**
 * Log a debug message and store it in the global state
 */
export function debugLog(component: string, message: string, data?: any): void {
  const log = {
    timestamp: Date.now(),
    component,
    message,
    data
  };
  
  // Add to logs array
  debugState.logs.unshift(log);
  
  // Trim logs if needed
  if (debugState.logs.length > MAX_LOGS) {
    debugState.logs = debugState.logs.slice(0, MAX_LOGS);
  }
  
  // Log to console
  console.log(`[${component}] ${message}`, data || '');
}

/**
 * Update video player state in the global debug state
 */
export function updateVideoPlayerState(
  id: string, 
  updates: Partial<Omit<VideoPlayerState, 'id' | 'lastUpdated'>>
): void {
  const existing = debugState.videoPlayers[id] || {
    id,
    videoUrl: null,
    status: 'unknown',
    isLoading: false,
    isPlaying: false,
    lastUpdated: Date.now()
  };
  
  debugState.videoPlayers[id] = {
    ...existing,
    ...updates,
    lastUpdated: Date.now()
  };
  
  debugLog('VideoPlayerTracker', `Updated state for player ${id}`, { 
    previous: existing,
    current: debugState.videoPlayers[id]
  });
}

/**
 * Track spinner creation
 */
export function trackSpinner(id: string, location: string): void {
  debugState.spinners[id] = {
    id,
    createdAt: Date.now(),
    location,
    isActive: true
  };
  
  debugLog('SpinnerTracker', `Spinner ${id} created at ${location}`);
}

/**
 * Track spinner destruction
 */
export function untrackSpinner(id: string): void {
  if (debugState.spinners[id]) {
    const duration = Date.now() - debugState.spinners[id].createdAt;
    debugState.spinners[id].isActive = false;
    
    debugLog('SpinnerTracker', `Spinner ${id} destroyed after ${duration}ms`, {
      location: debugState.spinners[id].location
    });
  }
}

/**
 * Get all active spinners
 */
export function getActiveSpinners(): SpinnerState[] {
  return Object.values(debugState.spinners).filter(s => s.isActive);
}

/**
 * Get all video players
 */
export function getVideoPlayers(): VideoPlayerState[] {
  return Object.values(debugState.videoPlayers);
}

/**
 * Get recent logs
 */
export function getRecentLogs(count: number = 100): DebugLog[] {
  return debugState.logs.slice(0, count);
}

/**
 * Get the entire debug state
 */
export function getDebugState(): DebugState {
  return { ...debugState };
}

/**
 * Record an error in the debug state
 */
export function recordError(error: Error): void {
  debugState.lastError = error;
  debugLog('ErrorTracker', `Error recorded: ${error.message}`, {
    error,
    stack: error.stack
  });
}

// Expose debug state to window for console debugging
if (typeof window !== 'undefined') {
  (window as any).__DEBUG_STATE__ = debugState;
  (window as any).__DEBUG_UTILS__ = {
    getVideoPlayers,
    getActiveSpinners,
    getRecentLogs,
    getDebugState
  };
} 