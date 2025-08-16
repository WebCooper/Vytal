"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, apiClient, AuthResponse } from '@/lib/api';

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
    
    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('vytal_user');
        localStorage.removeItem('vytal_token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    setIsLoading(true);
    
    try {
      const response = await apiClient.signIn({ email, password });
      
      if (response.success && response.user && response.token) {
        setUser(response.user);
        localStorage.setItem('vytal_user', JSON.stringify(response.user));
        localStorage.setItem('vytal_token', response.token);
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
      const response = await apiClient.signUp(data);
      
      if (response.success && response.user) {
        setUser(response.user);
        localStorage.setItem('vytal_user', JSON.stringify(response.user));
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
