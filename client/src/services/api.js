import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach access token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response interceptor - refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      !original._retry &&
      original.url &&
      !original.url.includes('/auth/login') &&
      !original.url.includes('/auth/register') &&
      !original.url.includes('/auth/refresh')
    ) {
      console.warn(`[API Client] 401 Response intercepted for URL: ${original.url}`);

      if (isRefreshing) {
        console.log(`[API Client] Token refresh already in progress. Queueing request: ${original.url}`);
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            original.headers.Authorization = `Bearer ${token}`;
            return api(original);
          })
          .catch((err) => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        console.log(`[API Client] Token refresh attempts: Triggering refresh. Current refreshToken exists: ${!!refreshToken}`);
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post('/api/auth/refresh', { refreshToken });
        const { accessToken, refreshToken: newRefresh } = res.data.data;
        
        console.log('[API Client] Token refresh successful. Storing new access and refresh tokens.');
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', newRefresh);
        
        original.headers.Authorization = `Bearer ${accessToken}`;
        
        processQueue(null, accessToken);
        return api(original);
      } catch (err) {
        console.error('[API Client] Token refresh attempts failed:', err.response?.data?.message || err.message);
        processQueue(err, null);
        localStorage.clear();
        console.warn(`[API Client] Logout Triggered. Reason: Token refresh failed (${err.response?.data?.message || err.message})`);
        window.location.href = '/login';
        return Promise.reject(error);
      } finally {
        isRefreshing = false;
      }
    }

    if (error.response?.status === 401) {
      console.error(`[API Client] 401 Response on direct auth endpoint: ${original.url}`);
    }

    return Promise.reject(error);
  }
);

export default api;
