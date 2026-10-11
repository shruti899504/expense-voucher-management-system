import { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const token = localStorage.getItem('evms_token');
    if (!token) { setLoading(false); return; }
    api.get('/auth/me').then(({ data }) => setUser(data.user)).catch(() => localStorage.removeItem('evms_token')).finally(() => setLoading(false));
  }, []);
  const login = async (credentials) => {
    const { data } = await api.post('/auth/login', credentials);
    localStorage.setItem('evms_token', data.token); setUser(data.user); return data.user;
  };
  const register = async (details) => {
    const { data } = await api.post('/auth/register', details);
    localStorage.setItem('evms_token', data.token); setUser(data.user); return data.user;
  };
  const logout = () => { localStorage.removeItem('evms_token'); setUser(null); };
  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
