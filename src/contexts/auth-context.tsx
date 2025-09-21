"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PIN_REQUIRED_ON_STARTUP_KEY } from '@/lib/constants';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  refreshUser: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// localStorage keys
const AUTH_STORAGE_KEY = 'budgee_auth';
const USER_STORAGE_KEY = 'budgee_user';

// Auth service functions
export class AuthService {
  static isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(AUTH_STORAGE_KEY) === 'true';
  }

  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const userStr = localStorage.getItem(USER_STORAGE_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }

  static setAuth(user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(AUTH_STORAGE_KEY, 'true');
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
    // Also clear PIN-related session data on logout
    sessionStorage.removeItem('budgee_app_locked');
    sessionStorage.removeItem('budgee_visibility_timestamp');
    // Clear PIN requirement flag from localStorage
    localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
  }

  static updateCurrentUser(updatedUser: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(updatedUser));
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Import the storage service here to avoid circular dependencies
    const { TransactionService } = await import('@/lib/storage-service');
    
    // Find user by email
    const storedUser = TransactionService.getUserByEmail(email);
    
    if (storedUser && password.length >= 8) {
      // In a real app, you would hash and compare passwords
      // For now, we just check that password meets basic requirements
      this.setAuth(storedUser);
      
      // Initialize basic account structure for the user if they don't have any data
      TransactionService.seedUserData(storedUser.id);
      
      return { success: true, user: storedUser };
    }
    
    return { success: false };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = () => {
      if (AuthService.isLoggedIn()) {
        const savedUser = AuthService.getUser();
        setUser(savedUser);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        return true;
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    AuthService.clearAuth();
    setUser(null);
  };

  const refreshUser = () => {
    // Re-read user data from localStorage
    const savedUser = AuthService.getUser();
    setUser(savedUser);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    refreshUser,
    logout,
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