import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '../../supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(({ data, error }) => {
        if (!mounted) return;
        if (error) {
          setSession(null);
          supabase.auth.signOut({ scope: 'local' });
          return;
        }
        setSession(data.session);
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        supabase.auth.signOut({ scope: 'local' });
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'TOKEN_REFRESH_FAILED') {
        setSession(null);
        supabase.auth.signOut({ scope: 'local' });
        return;
      }
      setSession(nextSession);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user || null,
      loading,
      signOut: () => supabase.auth.signOut(),
    }),
    [loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
