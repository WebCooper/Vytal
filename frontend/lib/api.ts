// API configuration and utilities for Vytal frontend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:9091/api/v1';

export interface User {
  name: string;
  email: string;
  phone_number?: string;
  role?: string;
  categories?: string[];
  timestamp?: [number, number];
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  token?: string;
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

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    // Get token from localStorage if available
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('vytal_token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('vytal_token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('vytal_token');
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ 
    status: string; 
    timestamp: string; 
    service: string; 
    database: string;
    version: string;
  }> {
    return this.request('/health');
  }

  // Database health check
  async dbHealthCheck(): Promise<{ database: string; timestamp: string }> {
    return this.request('/db/health');
  }

  // Authentication
  async signUp(data: SignUpData): Promise<AuthResponse> {
    try {
      const response = await this.request<{
        message: string;
        user: User;
        timestamp: [number, number];
      }>('/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      return {
        success: true,
        message: response.message,
        user: response.user
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Registration failed',
      };
    }
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    try {
      const response = await this.request<AuthResponse>('/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });

      if (response.success && response.token) {
        this.setToken(response.token);
      }

      return response;
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Sign in failed',
      };
    }
  }

  async getProfile(): Promise<User> {
    return this.request('/profile');
  }

  // User management
  async getUsers(): Promise<User[]> {
    return this.request('/users');
  }

  async getUserById(id: number): Promise<User> {
    return this.request(`/users/${id}`);
  }

  async createUser(userData: Partial<User>): Promise<User> {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience functions
export const register = apiClient.signUp.bind(apiClient);
export const login = apiClient.signIn.bind(apiClient);

// Utility functions
export const isApiHealthy = async (): Promise<boolean> => {
  try {
    await apiClient.healthCheck();
    return true;
  } catch {
    return false;
  }
};

export const isDatabaseHealthy = async (): Promise<boolean> => {
  try {
    await apiClient.dbHealthCheck();
    return true;
  } catch {
    return false;
  }
};
