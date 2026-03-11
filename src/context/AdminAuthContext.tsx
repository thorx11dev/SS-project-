import React, { createContext, useContext, useEffect, useRef, useState } from 'react';

const STORAGE_KEY = 'ks_admin_token';

interface AdminAuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  token: null,
  login: () => {},
  logout: () => {},
});

export const useAdminAuth = () => useContext(AdminAuthContext);

export const AdminAuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  tokenRef.current = token;

  // Patch window.fetch to inject admin token for all /api/admin/ requests
  useEffect(() => {
    const originalFetch = window.fetch.bind(window);
    window.fetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof Request
          ? input.url
          : String(input);
      if (url.includes('/api/admin/') && tokenRef.current) {
        const headers = new Headers((init.headers as HeadersInit) || {});
        headers.set('X-Admin-Token', tokenRef.current);
        init = { ...init, headers };
      }
      return originalFetch(input, init);
    };
    return () => {
      window.fetch = originalFetch;
    };
  }, []);

  // On mount: restore token from localStorage and validate it
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setIsLoading(false);
      return;
    }
    fetch('/api/admin/validate-token', {
      headers: { 'X-Admin-Token': stored },
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setToken(stored);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      })
      .catch(() => localStorage.removeItem(STORAGE_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  const login = (newToken: string) => {
    localStorage.setItem(STORAGE_KEY, newToken);
    setToken(newToken);
  };

  const logout = () => {
    const t = tokenRef.current;
    if (t) {
      fetch('/api/admin/logout', {
        method: 'POST',
        headers: { 'X-Admin-Token': t },
      }).catch(() => {});
    }
    localStorage.removeItem(STORAGE_KEY);
    setToken(null);
  };

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated: !!token, isLoading, token, login, logout }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
};
