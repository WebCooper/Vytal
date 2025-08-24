import axios, { AxiosInstance, AxiosRequestHeaders } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091/api/v1';

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const path = window.location?.pathname || '';
      const adminToken = localStorage.getItem('vytal_admin_token');
      const userToken = localStorage.getItem('vytal_token');
      const token = path.startsWith('/admin') ? (adminToken || userToken) : (userToken || adminToken);
      if (!config.headers) config.headers = {} as AxiosRequestHeaders;
      if (token) {
        (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
      }
      config.withCredentials = true;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API request failed:', error);
    return Promise.reject(error);
  }
);

export const setAuthorizationToken = (newToken: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('vytal_token', newToken);
  }
};

export const clearAuthorizationToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vytal_token');
  }
};

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