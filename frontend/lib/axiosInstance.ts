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
    // Prefer correct token based on route: use admin token on /admin pages
    if (typeof window !== 'undefined') {
      const path = window.location?.pathname || '';
      const adminToken = localStorage.getItem('vytal_admin_token');
      const userToken = localStorage.getItem('vytal_token');
      const token = path.startsWith('/admin') ? (adminToken || userToken) : (userToken || adminToken);
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      if (token) {
        (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
      }
      // Allow cookies
      config.withCredentials = true;
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

// Admin-specific helpers
export const setAdminAuthorizationToken = (newToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vytal_admin_token', newToken);
  }
};

export const clearAdminAuthorizationToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vytal_admin_token');
  }
};