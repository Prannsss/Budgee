"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { PIN_REQUIRED_ON_STARTUP_KEY, PIN_VERIFIED_SESSION_KEY, APP_LOCK_KEY, VISIBILITY_CHANGE_KEY, FRESH_LOGIN_KEY } from '@/lib/constants';
import { AuthAPI, TokenManager, UserAPI } from '@/lib/api-service';
import { User, Plan } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth service functions
export class AuthService {
  static isLoggedIn(): boolean {
    if (typeof window === 'undefined') return false;
    return TokenManager.isAuthenticated();
  }

  static clearAuth(): void {
    if (typeof window === 'undefined') return;
    TokenManager.clearTokens();
    // Clear all PIN-related session and local storage data on logout
    sessionStorage.removeItem(APP_LOCK_KEY);
    sessionStorage.removeItem(VISIBILITY_CHANGE_KEY);
    sessionStorage.removeItem(PIN_VERIFIED_SESSION_KEY);
    sessionStorage.removeItem(FRESH_LOGIN_KEY);
    // Don't clear PIN_REQUIRED_ON_STARTUP_KEY here - it's user preference that persists
  }

  static async login(email: string, password: string): Promise<{ success: boolean; user?: User }> {
    try {
      const response = await AuthAPI.login(email, password);
      // After login, fetch full user profile with plan details
      const userProfile = await UserAPI.getProfile();
      
      // Parse name into firstName/lastName if needed
      const nameParts = userProfile.name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const user: User = {
        id: userProfile.id.toString(),
        name: userProfile.name,
        email: userProfile.email,
        firstName,
        lastName,
        isEmailVerified: userProfile.email_verified,
        planId: userProfile.plan_id.toString(),
        plan: userProfile.plan ? {
          id: userProfile.plan.id.toString(),
          name: userProfile.plan.name,
          price: userProfile.plan.price,
          maxWallets: userProfile.plan.max_wallets,
          maxAccounts: userProfile.plan.max_accounts,
          aiEnabled: userProfile.plan.ai_enabled,
          adsEnabled: userProfile.plan.ads_enabled,
          description: userProfile.plan.description,
          features: userProfile.plan.features,
        } : undefined,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      };
      
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error; // Throw to allow error handling in components
    }
  }

  static async signup(
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ success: boolean; user?: User }> {
    try {
      await AuthAPI.signup({ email, password, firstName, lastName });
      // Signup successful but no user data returned - user must verify email first
      // Don't set any user data or tokens until email is verified
      return { success: true };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  static async fetchUserProfile(): Promise<User | null> {
    try {
      const userProfile = await UserAPI.getProfile();
      // Parse name into firstName/lastName if needed
      const nameParts = userProfile.name?.split(' ') || ['', ''];
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        id: userProfile.id.toString(),
        name: userProfile.name,
        email: userProfile.email,
        firstName,
        lastName,
        isEmailVerified: userProfile.email_verified,
        planId: userProfile.plan_id.toString(),
        plan: userProfile.plan ? {
          id: userProfile.plan.id.toString(),
          name: userProfile.plan.name,
          price: userProfile.plan.price,
          maxWallets: userProfile.plan.max_wallets,
          maxAccounts: userProfile.plan.max_accounts,
          aiEnabled: userProfile.plan.ai_enabled,
          adsEnabled: userProfile.plan.ads_enabled,
          description: userProfile.plan.description,
          features: userProfile.plan.features,
        } : undefined,
        createdAt: userProfile.created_at,
        updatedAt: userProfile.updated_at,
      };
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  static async logout(): Promise<void> {
    try {
      await AuthAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuth();
    }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status on mount
    const checkAuth = async () => {
      const hasToken = AuthService.isLoggedIn();
      
      if (hasToken) {
        // Fetch user data from database (not localStorage)
        try {
          const freshUser = await AuthService.fetchUserProfile();
          if (freshUser) {
            setUser(freshUser);
          }
        } catch (error) {
          // If token is invalid, clear auth
          console.error('Failed to fetch user profile, clearing auth:', error);
          AuthService.clearAuth();
          setUser(null);
        }
      } else {
        // No token, user not logged in
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();

    // Listen for unauthorized events
    const handleUnauthorized = () => {
      AuthService.clearAuth();
      setUser(null);
      setIsLoading(false);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await AuthService.login(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        
        // Mark this as a fresh login - skip PIN verification for this session
        sessionStorage.setItem(FRESH_LOGIN_KEY, 'true');
        sessionStorage.setItem(PIN_VERIFIED_SESSION_KEY, 'true');
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await AuthService.signup(email, password, firstName, lastName);
      if (result.success) {
        // Don't set user data - user needs to verify email first
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const refreshUser = async () => {
    // Re-fetch user data from API
    try {
      const freshUser = await AuthService.fetchUserProfile();
      if (freshUser) {
        setUser(freshUser);
      }
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
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