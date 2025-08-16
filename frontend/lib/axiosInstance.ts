// axiosInstance.ts
import axios, { AxiosInstance } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091/api/v1';

let token: string | null = null;

if (typeof window !== 'undefined') {
  token = localStorage.getItem('vytal_token');
}

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  },
});

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
  axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
  if (typeof window !== 'undefined') {
    localStorage.setItem('vytal_token', newToken);
  }
};

// Utility to clear token
export const clearAuthorizationToken = () => {
  delete axiosInstance.defaults.headers.common['Authorization'];
  if (typeof window !== 'undefined') {
    localStorage.removeItem('vytal_token');
  }
};
