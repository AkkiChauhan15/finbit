import { useCallback, useEffect, useMemo, useState } from 'react';

import { api, setAccessToken, setSessionExpiredHandler } from '../api/client.js';
import { AuthContext } from './AuthContext.js';

function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    setSessionExpiredHandler(() => {
      if (isMounted) {
        setUser(null);
      }
    });

    api
      .restoreSession()
      .then((session) => {
        if (isMounted) {
          setUser(session.user);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUser(null);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
      setSessionExpiredHandler(null);
    };
  }, []);

  const applySession = useCallback((session) => {
    setAccessToken(session.accessToken);
    setUser(session.user);
    return session.user;
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      login: async (credentials) => applySession(await api.login(credentials)),
      register: async (values) => applySession(await api.register(values)),
      logout: async () => {
        await api.logout().catch(() => undefined);
        setUser(null);
      },
      updateProfile: async (values) => {
        const result = await api.updateProfile(values);
        setUser(result.user);
        return result.user;
      },
    }),
    [applySession, isLoading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
