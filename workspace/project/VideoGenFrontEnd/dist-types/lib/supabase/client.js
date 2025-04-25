import { createClient } from '@supabase/supabase-js';
import { config } from '@/config/env';
console.log('=== SUPABASE CLIENT INITIALIZATION ===', {
    hasUrl: !!config.supabaseUrl,
    hasAnonKey: !!config.supabaseAnonKey,
    timestamp: new Date().toISOString(),
});
if (!config.supabaseUrl || !config.supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}
// Verify localStorage is available
const isLocalStorageAvailable = () => {
    try {
        const testKey = 'test-localStorage';
        localStorage.setItem(testKey, testKey);
        localStorage.removeItem(testKey);
        console.log('localStorage is available and working correctly');
        return true;
    }
    catch (e) {
        console.error('localStorage is not available:', e);
        return false;
    }
};
// Run the test
isLocalStorageAvailable();
// Check if we have a stored session in localStorage
const storedSession = localStorage.getItem('video-gen-auth');
console.log('Stored auth session found:', !!storedSession, {
    storageKeys: Object.keys(localStorage),
    sessionLength: storedSession?.length || 0,
});
console.log('Initializing Supabase client with config:', {
    url: config.supabaseUrl,
    hasAnonKey: !!config.supabaseAnonKey,
    hasStoredSession: !!storedSession,
});
export const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        storage: localStorage, // Use localStorage directly without window.
        storageKey: 'video-gen-auth',
        detectSessionInUrl: true,
        debug: true,
    },
    global: {
        headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate',
            Pragma: 'no-cache',
        },
    },
});
// Add explicit session verification after initialization
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth state changed:', event, !!session, {
        timestamp: new Date().toISOString(),
    });
    if (session) {
        // Verify session is stored correctly
        const storedSession = localStorage.getItem('video-gen-auth');
        console.log('Session storage verification:', {
            event,
            sessionExists: !!session,
            storedSessionExists: !!storedSession,
            storageKeys: Object.keys(localStorage),
            sessionLength: storedSession?.length || 0,
        });
    }
});
// Log initial session state
supabase.auth.getSession().then(({ data: { session } }) => {
    console.log('=== INITIAL SUPABASE SESSION ===', {
        exists: !!session,
        token: session?.access_token ? 'exists' : 'missing',
        expiresAt: session?.expires_at ? new Date(session.expires_at * 1000).toISOString() : 'n/a',
        timestamp: new Date().toISOString(),
        storageType: 'localStorage',
    });
});
