import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const API = axios.create({ baseURL: 'https://krishiseva-backend-mvlv.onrender.com/api' });
API.interceptors.request.use(cfg => {
  const t = localStorage.getItem('ks_token');
  if (t) cfg.headers.Authorization = `Bearer ${t}`;
  return cfg;
});

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [language,setLang]    = useState(() => localStorage.getItem('ks_lang') || 'or');

  useEffect(() => {
    const token = localStorage.getItem('ks_token');
    if (token) {
      API.get('/auth/me')
        .then(r => setUser(r.data))
        .catch(() => localStorage.removeItem('ks_token'))
        .finally(() => setLoading(false));
    } else setLoading(false);
  }, []);

  const setLanguage = l => { setLang(l); localStorage.setItem('ks_lang', l); };

  const login = async (username, password) => {
    const r = await API.post('/auth/login', { username, password });
    localStorage.setItem('ks_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const register = async (formData) => {
    const r = await API.post('/auth/register', formData);
    localStorage.setItem('ks_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };

  const logout = () => { localStorage.removeItem('ks_token'); setUser(null); };

  const refreshUser = async () => {
    try { const r = await API.get('/auth/me'); setUser(r.data); } catch {}
  };

  const isSubscribed = () => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    const s = user.subscription;
    if (!s?.active) return false;
    if (s.expiresAt && new Date(s.expiresAt) < new Date()) return false;
    return true;
  };

  const daysLeft = () => {
    if (!user?.subscription?.expiresAt) return 0;
    return Math.max(0, Math.ceil((new Date(user.subscription.expiresAt) - Date.now()) / 86400000));
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, language, setLanguage, refreshUser, isSubscribed, daysLeft }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
