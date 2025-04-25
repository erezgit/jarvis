import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { adaptUser } from '@/lib/supabase/auth';
const initialState = {
    user: null,
    status: 'idle',
    error: null,
    isAuthenticated: false,
};
const SupabaseAuthContext = createContext(initialState);
export const SupabaseAuthProvider = ({ children }) => {
    const [state, setState] = useState(initialState);
    const handleAuthStateChange = useCallback(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
            const user = adaptUser(session.user);
            setState((prev) => ({
                ...prev,
                user,
                status: 'authenticated',
                isAuthenticated: true,
                error: null,
            }));
        }
        else if (event === 'SIGNED_OUT') {
            setState(initialState);
        }
    }, []);
    useEffect(() => {
        const { data: { subscription }, } = supabase.auth.onAuthStateChange(handleAuthStateChange);
        return () => {
            subscription.unsubscribe();
        };
    }, [handleAuthStateChange]);
    return _jsx(SupabaseAuthContext.Provider, { value: state, children: children });
};
export const useSupabaseAuth = () => useContext(SupabaseAuthContext);
export default SupabaseAuthProvider;
