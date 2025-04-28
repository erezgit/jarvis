import * as React from 'react';
import { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { AuthChangeEvent, Session as SupabaseSession } from '@supabase/supabase-js';
import type { AuthState } from '@/types/auth';
import { supabase } from '@/lib/supabase/client';
import { adaptUser } from '@/lib/supabase/auth';

const initialState: AuthState = {
  user: null,
  status: 'idle',
  error: null,
  isAuthenticated: false,
};

const SupabaseAuthContext = createContext<AuthState>(initialState);

interface SupabaseAuthProviderProps {
  children: React.ReactNode;
}

export const SupabaseAuthProvider: React.FC<SupabaseAuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>(initialState);

  const handleAuthStateChange = useCallback(
    async (event: AuthChangeEvent, session: SupabaseSession | null) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const user = adaptUser(session.user);
        setState((prev) => ({
          ...prev,
          user,
          status: 'authenticated',
          isAuthenticated: true,
          error: null,
        }));
      } else if (event === 'SIGNED_OUT') {
        setState(initialState);
      }
    },
    [],
  );

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(handleAuthStateChange);
    return () => {
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  return <SupabaseAuthContext.Provider value={state}>{children}</SupabaseAuthContext.Provider>;
};

export const useSupabaseAuth = () => useContext(SupabaseAuthContext);

export default SupabaseAuthProvider;
