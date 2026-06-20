import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check if tokens are in URL query parameters (Google OAuth callback)
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const refreshTokenParam = urlParams.get('refreshToken');

    if (tokenParam && refreshTokenParam) {
      // Store tokens immediately
      localStorage.setItem('accessToken', tokenParam);
      localStorage.setItem('refreshToken', refreshTokenParam);

      // Clean URL params immediately so they don't linger on page reload
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);

      // Fetch user profile using the new tokens
      authService.getMe()
        .then(res => {
          setUser(res.data.data);
        })
        .catch((err) => {
          console.error('OAuth token verification failed:', err);
          localStorage.clear();
          setUser(null);
          toast.error('Google login failed. Please try again.');
        })
        .finally(() => setLoading(false));
    } else {
      // 2. Regular app load: check token in localStorage
      const token = localStorage.getItem('accessToken');
      if (token) {
        authService.getMe()
          .then(res => setUser(res.data.data))
          .catch(() => { localStorage.clear(); })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    }
  }, []);

  // Real login
  const login = async (credentials) => {
    const res = await authService.login(credentials);
    const { user, accessToken, refreshToken } = res.data.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser(user);
    return user;
  };

  const register = async (data) => {
    const res = await authService.register(data);
    return res.data;
  };

  // Logout
  const logout = async () => {
    try { await authService.logout(); } catch {}
    localStorage.clear();
    setUser(null);
  };

  // Google OAuth Helper
  const loginWithTokens = async (accessToken, refreshToken) => {
    setLoading(true);
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const res = await authService.getMe();
      const user = res.data.data;
      setUser(user);
      return user;
    } catch (err) {
      localStorage.clear();
      setUser(null);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, loginWithTokens }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

