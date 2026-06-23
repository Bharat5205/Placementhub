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
      console.log('[AuthContext] Verifying OAuth tokens received in URL.');
      authService.getMe()
        .then(res => {
          console.log('[AuthContext] OAuth token verification successful. User profile fetched:', res.data.data.email);
          setUser(res.data.data);
        })
        .catch((err) => {
          console.error('[AuthContext] OAuth token verification failed:', err.response?.data?.message || err.message);
          localStorage.clear();
          setUser(null);
          toast.error('Google login failed. Please try again.');
        })
        .finally(() => setLoading(false));
    } else {
      // 2. Regular app load: check token in localStorage
      const token = localStorage.getItem('accessToken');
      if (token) {
        console.log('[AuthContext] Access token found in localStorage on startup. Fetching user profile...');
        authService.getMe()
          .then(res => {
            console.log('[AuthContext] Initial profile fetch successful. User:', res.data.data.email);
            setUser(res.data.data);
          })
          .catch((err) => {
            console.error('[AuthContext] Initial profile fetch failed:', err.response?.data?.message || err.message);
            // Only clear storage and user if the error is explicitly an authentication error (401)
            // If it is a transient error (e.g. 500, network offline), we do not log them out.
            if (err.response?.status === 401) {
              console.warn('[AuthContext] Authentication error (401). Clearing tokens from storage.');
              localStorage.clear();
              setUser(null);
            } else {
              console.warn('[AuthContext] Non-auth error encountered. Keeping tokens in storage for automatic retry on next action/refresh.');
            }
          })
          .finally(() => setLoading(false));
      } else {
        console.log('[AuthContext] No access token found in localStorage. App loaded in guest state.');
        setLoading(false);
      }
    }
  }, []);

  // Real login
  const login = async (credentials) => {
    console.log('[AuthContext] Triggering login attempt...');
    const res = await authService.login(credentials);
    const { user, accessToken, refreshToken } = res.data.data;
    
    console.log(`[AuthContext] Login success for user: ${user.email}. Storing tokens.`);
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
  const logout = async (reason = 'Manual logout') => {
    console.log(`[AuthContext] Logout trigger. Reason: ${reason}`);
    try { 
      await authService.logout(); 
    } catch (err) {
      console.warn('[AuthContext] Call to /auth/logout failed or user already invalid:', err.message);
    }
    localStorage.clear();
    setUser(null);
    console.log('[AuthContext] Local user state cleared.');
  };

  // Google OAuth Helper
  const loginWithTokens = async (accessToken, refreshToken) => {
    console.log('[AuthContext] Logging in with explicit tokens (OAuth)...');
    setLoading(true);
    try {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      const res = await authService.getMe();
      const user = res.data.data;
      console.log('[AuthContext] Login with tokens successful. User:', user.email);
      setUser(user);
      return user;
    } catch (err) {
      console.error('[AuthContext] Login with tokens failed:', err.response?.data?.message || err.message);
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

