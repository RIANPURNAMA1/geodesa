import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('auth_user')); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authApi.me()
        .then((res) => setUser(res.data.data))
        .catch(() => { localStorage.removeItem('auth_token'); localStorage.removeItem('auth_user'); setUser(null); })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await authApi.login({ email, password });
    const { user, token } = res.data.data;
    localStorage.setItem('auth_token', token);
    localStorage.setItem('auth_user', JSON.stringify(user));
    setUser(user);
    return user;
  }, []);

  const logout = useCallback(async () => {
    try { await authApi.logout(); } catch {}
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    setUser(null);
  }, []);

  const isAdmin        = user?.role === 'admin';
  const isOperatorDesa = user?.role === 'operator_desa';
  const isUser         = user?.role === 'user';

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const res = await authApi.me();
        setUser(res.data.data);
        localStorage.setItem('auth_user', JSON.stringify(res.data.data));
      } catch {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        setUser(null);
      }
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isAdmin, isOperatorDesa, isUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
