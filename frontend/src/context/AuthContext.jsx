import { useCallback, useEffect, useState } from 'react';
import api from '../services/api';
import AuthContext from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));

  const fetchCurrentUser = useCallback(async ({ throwOnError = false } = {}) => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      return response.data;
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      if (throwOnError) {
        throw error;
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      void Promise.resolve().then(fetchCurrentUser);
    }
  }, [fetchCurrentUser]);

  const login = async (email, password) => {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData);

    localStorage.setItem('token', response.data.access_token);
    await fetchCurrentUser({ throwOnError: true });
    return response.data;
  };

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}