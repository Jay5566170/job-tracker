import { useCallback, useEffect, useRef, useState } from 'react';
import api, { AUTH_INVALIDATED_EVENT } from '../services/api';
import AuthContext from './authContext';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('token')));
  const [authError, setAuthError] = useState('');
  const authVersion = useRef(0);

  useEffect(() => {
    let active = true;
    const clearSession = () => {
      authVersion.current += 1;
      localStorage.removeItem('token');
      setUser(null);
      setAuthError('');
      setLoading(false);
    };
    const onStorageChange = (event) => {
      if (event.key !== 'token') return;
      const version = ++authVersion.current;
      setUser(null);
      setAuthError('');
      if (!event.newValue) {
        setLoading(false);
        return;
      }
      setLoading(true);
      void api.get('/auth/me')
        .then((response) => {
          if (active && authVersion.current === version) setUser(response.data);
        })
        .catch((error) => {
          if (!active || authVersion.current !== version) return;
          if (error.response?.status === 401) localStorage.removeItem('token');
          else {
            setAuthError(error.response?.data?.detail || error.message || 'Unable to validate your session.');
          }
        })
        .finally(() => {
          if (active && authVersion.current === version) setLoading(false);
        });
    };
    const token = localStorage.getItem('token');
    const version = authVersion.current;

    window.addEventListener(AUTH_INVALIDATED_EVENT, clearSession);
    window.addEventListener('storage', onStorageChange);
    if (token) {
      void api.get('/auth/me')
        .then((response) => {
          if (active && authVersion.current === version) {
            setUser(response.data);
            setAuthError('');
          }
        })
        .catch((error) => {
          if (!active || authVersion.current !== version) return;
          if (error.response?.status === 401) {
            localStorage.removeItem('token');
            setUser(null);
          } else {
            setUser(null);
            setAuthError(
              error.response?.data?.detail ||
                error.message ||
                'Unable to validate your session. Check your connection and sign in again.',
            );
          }
        })
        .finally(() => {
          if (active && authVersion.current === version) {
            setLoading(false);
          }
        });
    }

    return () => {
      active = false;
      window.removeEventListener(AUTH_INVALIDATED_EVENT, clearSession);
      window.removeEventListener('storage', onStorageChange);
    };
  }, []);

  const login = async (email, password) => {
    const attempt = ++authVersion.current;
    localStorage.removeItem('token');
    setUser(null);
    setAuthError('');
    setLoading(true);

    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await api.post('/auth/login', formData);
      if (authVersion.current !== attempt) {
        throw new Error('Login was cancelled.');
      }
      localStorage.setItem('token', response.data.access_token);
      const currentUser = await api.get('/auth/me');
      if (authVersion.current !== attempt) {
        throw new Error('Login was cancelled.');
      }
      setUser(currentUser.data);
      return response.data;
    } catch (error) {
      if (authVersion.current === attempt) {
        localStorage.removeItem('token');
        setUser(null);
      }
      throw error;
    } finally {
      if (authVersion.current === attempt) {
        setLoading(false);
      }
    }
  };

  const register = async (email, password) => {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  };

  const logout = useCallback(() => {
    authVersion.current += 1;
    localStorage.removeItem('token');
    setUser(null);
    setAuthError('');
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, authError, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}