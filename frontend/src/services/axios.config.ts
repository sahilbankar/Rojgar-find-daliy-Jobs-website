import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 15 seconds timeout
  withCredentials: true, // Send cookies across origins
});

// Request Interceptor: Attach JWT Access Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken =
      localStorage.getItem('rojgar_access_token') ||
      localStorage.getItem('rojgar_token');

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Queue for holding requests while token is refreshing
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Centralized Error Handling & Automatic Token Refresh
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean, _retryCount?: number };

    if (error.response) {
      const status = error.response.status;
      const requestUrl = originalRequest?.url || '';

      // Check if 401 Unauthorized and not an auth endpoint that shouldn't auto-refresh
      const isAuthEndpoint =
        requestUrl.includes('/auth/login') ||
        requestUrl.includes('/auth/register') ||
        requestUrl.includes('/auth/refresh');

      if (status === 401 && !isAuthEndpoint && originalRequest) {
        if (originalRequest._retry) {
          // Already retried once, refresh failed or invalid
          localStorage.removeItem('rojgar_access_token');
          localStorage.removeItem('rojgar_refresh_token');
          localStorage.removeItem('rojgar_token');
          localStorage.removeItem('rojgar_user');

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // If another request is currently refreshing the token, queue this one
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return api(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        const storedRefreshToken = localStorage.getItem('rojgar_refresh_token');

        try {
          // Perform refresh using a fresh axios instance to avoid interceptor recursion
          const refreshResponse = await axios.post(
            `${API_BASE_URL}/auth/refresh`,
            { refreshToken: storedRefreshToken },
            { withCredentials: true }
          );

          const { accessToken, refreshToken: newRefreshToken, user } = refreshResponse.data;

          if (accessToken) {
            localStorage.setItem('rojgar_access_token', accessToken);
            localStorage.setItem('rojgar_token', accessToken); // backward compatibility
          }
          if (newRefreshToken) {
            localStorage.setItem('rojgar_refresh_token', newRefreshToken);
          }
          if (user) {
            localStorage.setItem('rojgar_user', JSON.stringify(user));
          }

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }

          processQueue(null, accessToken);
          return api(originalRequest);
        } catch (refreshError) {
          processQueue(refreshError, null);
          localStorage.removeItem('rojgar_access_token');
          localStorage.removeItem('rojgar_refresh_token');
          localStorage.removeItem('rojgar_token');
          localStorage.removeItem('rojgar_user');

          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          return Promise.reject(refreshError);
        } finally {
          isRefreshing = false;
        }
      } else if (status === 403) {
        console.error('API Error (403): Access Forbidden');
      } else if (status === 503 || status === 502) {
        console.error(`API Error (${status}): Server is waking up. Retrying...`);
        originalRequest._retryCount = originalRequest._retryCount || 0;
        if (originalRequest._retryCount < 5) { // Retry up to 5 times
          originalRequest._retryCount++;
          // Wait longer for each retry: 3s, 6s, 9s, 12s, 15s
          const delay = originalRequest._retryCount * 3000;
          return new Promise(resolve => setTimeout(resolve, delay))
            .then(() => api(originalRequest));
        } else {
          console.error('API Error: Maximum retries reached. Server is still unavailable.');
        }
      } else if (status >= 500) {
        console.error('API Error (500+): Internal Server Error');
      }
    } else if (error.request) {
      
    } else {
      console.error('API Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default api;

