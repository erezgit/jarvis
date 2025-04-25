/**
 * Debug utilities for tracking application state and troubleshooting issues
 */
// Initialize global debug state
const debugState = {
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
export function debugLog(component, message, data) {
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
export function updateVideoPlayerState(id, updates) {
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
export function trackSpinner(id, location) {
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
export function untrackSpinner(id) {
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
export function getActiveSpinners() {
    return Object.values(debugState.spinners).filter(s => s.isActive);
}
/**
 * Get all video players
 */
export function getVideoPlayers() {
    return Object.values(debugState.videoPlayers);
}
/**
 * Get recent logs
 */
export function getRecentLogs(count = 100) {
    return debugState.logs.slice(0, count);
}
/**
 * Get the entire debug state
 */
export function getDebugState() {
    return { ...debugState };
}
/**
 * Record an error in the debug state
 */
export function recordError(error) {
    debugState.lastError = error;
    debugLog('ErrorTracker', `Error recorded: ${error.message}`, {
        error,
        stack: error.stack
    });
}
// Expose debug state to window for console debugging
if (typeof window !== 'undefined') {
    window.__DEBUG_STATE__ = debugState;
    window.__DEBUG_UTILS__ = {
        getVideoPlayers,
        getActiveSpinners,
        getRecentLogs,
        getDebugState
    };
}
