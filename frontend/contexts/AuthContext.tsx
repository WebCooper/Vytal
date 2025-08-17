"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, signIn as apiSignIn, signUp as apiSignUp, logout, AuthResponse } from '@/lib/userService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    role?: string;
    categories?: string[];
  }) => Promise<AuthResponse>;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const savedUser = localStorage.getItem('vytal_user');
    const savedToken = localStorage.getItem('vytal_token');
    
    // Also check for legacy admin storage
    const legacyUser = localStorage.getItem('user');
    const legacyAuth = localStorage.getItem('isAuthenticated');
    
    if (savedUser && savedToken) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        // Set the authorization token in axios instance
        import('@/lib/axiosInstance').then(({ setAuthorizationToken }) => {
          setAuthorizationToken(savedToken);
        });
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('vytal_user');
        localStorage.removeItem('vytal_token');
      }
    } else if (legacyUser && legacyAuth === 'true') {
      // Handle legacy admin login
      try {
        const parsedUser = JSON.parse(legacyUser);
        if (parsedUser.role === 'admin') {
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Error parsing legacy user:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('isAuthenticated');
      }
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      // Development hardcoded admin access
      if (email === "admin@vytal.com" && password === "admin123") {
        const mockAdminUser: User = {
          id: 1,
          name: "System Administrator",
          email: "admin@vytal.com",
          role: "admin"
        };
        
        const mockToken = "dev-admin-token-123";
        
        setUser(mockAdminUser);
        localStorage.setItem('vytal_user', JSON.stringify(mockAdminUser));
        localStorage.setItem('vytal_token', mockToken);
        
        return {
          success: true,
          data: { user: mockAdminUser, token: mockToken },
          message: "Admin login successful",
          timestamp: [Date.now(), 0] as [number, number]
        };
      }

      const response = await apiSignIn({ email, password });
      
      if (response.data?.user && response.data?.token) {
        setUser(response.data.user);
        localStorage.setItem('vytal_user', JSON.stringify(response.data.user));
        localStorage.setItem('vytal_token', response.data.token);
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: {
    name: string;
    email: string;
    phone_number: string;
    password: string;
    role?: string;
    categories?: string[];
  }): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      const response = await apiSignUp(data);
      
      if (response.success && response.data?.user) {
        setUser(response.data.user);
        localStorage.setItem('vytal_user', JSON.stringify(response.data.user));
        if (response.data.token) {
          localStorage.setItem('vytal_token', response.data.token);
        }
      }
      
      return response;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    setUser(null);
    localStorage.removeItem('vytal_user');
    localStorage.removeItem('vytal_token');
    logout();
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
