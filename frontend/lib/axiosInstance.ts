// lib/axiosInstance.ts
import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091/api/v1';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to dynamically add token
axiosInstance.interceptors.request.use(
  (config) => {
    // Prefer a real token from localStorage; otherwise fall back to a dev admin token for local development
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('vytal_token');
      const devToken = process.env.NEXT_PUBLIC_DEV_ADMIN_TOKEN;
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      if (token) {
        (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
      } else if (devToken) {
        // Use a development admin token when no user token is available
        (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${devToken}`;
        if (process.env.NODE_ENV !== 'production') {
          console.warn('Using NEXT_PUBLIC_DEV_ADMIN_TOKEN for API request (no user token found).');
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request failed:', error);
    return Promise.reject(error);
  }
);

// Utility to update token
export const setAuthorizationToken = (newToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vytal_token', newToken);
  }
};

// Utility to clear token
export const clearAuthorizationToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vytal_token');
  }
};