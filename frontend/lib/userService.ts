// userService.ts
import { axiosInstance, setAuthorizationToken, clearAuthorizationToken } from './axiosInstance';

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number?: string;
  role?: string;
  categories?: string[];
  timestamp?: [number, number];
}

export interface AuthResponse {
  message: string;
  data?: {
    token: string;
    user: User;
  };
  timestamp: [number, number];
  success?: boolean;
}

export interface SignUpData {
  name: string;
  email: string;
  phone_number: string;
  password: string;
  role?: string;
  categories?: string[];
}

export interface SignInData {
  email: string;
  password: string;
}

const request = async <T = unknown>(
  endpoint: string,
  options: { method?: string; data?: unknown } = {}
): Promise<T> => {
  const { method = 'GET', data } = options;

  const response = await axiosInstance.request<T>({
    url: endpoint,
    method,
    data,
  });

  return response.data;
};

// User Auth
export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  try {
    const response = await request<AuthResponse>('/register', { method: 'POST', data });
    return { ...response, success: true };
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Registration failed';
    return {
      message: errorMessage,
      timestamp: [Math.floor(Date.now() / 1000), 0],
      success: false,
    };
  }
};

export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  try {
    const response = await request<AuthResponse>('/login', { method: 'POST', data });

    if (response.data?.token) {
      setAuthorizationToken(response.data.token);
    }

    return { ...response, success: true };
  } catch (error: Error | unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
    return {
      message: errorMessage,
      timestamp: [Math.floor(Date.now() / 1000), 0],
      success: false,
    };
  }
};

export const logout = () => {
  if (typeof window !== 'undefined') {
    // Clear all vytal-related localStorage items
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('vytal_')) {
        localStorage.removeItem(key)
      }
    })
  }
  clearAuthorizationToken();
};

export const getProfile = async (): Promise<User> => {
  return request('/profile');
};

// User CRUD
export const getUsers = async (): Promise<User[]> => {
  return request('/users');
};

export const getUserById = async (id: number): Promise<User> => {
  return request(`/users/${id}`);
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  return request('/users', {
    method: 'POST',
    data: userData,
  });
};

// Health checks
export const isApiHealthy = async (): Promise<boolean> => {
  try {
    await request('/health');
    return true;
  } catch {
    return false;
  }
};

export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    await request('/db/health');
    return true;
  } catch {
    return false;
  }
};
