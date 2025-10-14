/**
 * API Service Layer
 * Handles all HTTP requests to the backend API
 * Manages JWT token storage and authentication headers
 */

import type { 
  Account, 
  Transaction, 
  Category, 
  SavingsAllocation,
  PlanType 
} from './types';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Token storage keys
const TOKEN_KEY = 'budgee_token';
const REFRESH_TOKEN_KEY = 'budgee_refresh_token';

// ==================== Token Management ====================

export class TokenManager {
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  static setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  static getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  static setRefreshToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }

  static clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// ==================== HTTP Client ====================

interface RequestOptions extends RequestInit {
  body?: any;
  requiresAuth?: boolean;
}

class HttpClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<T> {
    const { body, requiresAuth = true, headers = {}, ...restOptions } = options;

    const config: RequestInit = {
      ...restOptions,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };

    // Add authorization header if required
    if (requiresAuth) {
      const token = TokenManager.getToken();
      if (token) {
        (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
      }
    }

    // Add body if present
    if (body) {
      config.body = JSON.stringify(body);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, config);

      // Handle unauthorized errors
      if (response.status === 401) {
        TokenManager.clearTokens();
        // Redirect to login or dispatch logout event
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('auth:unauthorized'));
        }
        throw new Error('Unauthorized. Please login again.');
      }

      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        // Response is not JSON, try to get text for debugging
        const text = await response.text();
        console.error('Non-JSON response received:', text.substring(0, 200));
        throw new Error('Server returned an invalid response. Please check if the backend is running.');
      }

      // Parse response
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Request failed');
      }

      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error. Please check your connection.');
    }
  }

  async get<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', requiresAuth });
  }

  async post<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body, requiresAuth });
  }

  async put<T>(endpoint: string, body?: any, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body, requiresAuth });
  }

  async delete<T>(endpoint: string, requiresAuth = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE', requiresAuth });
  }
}

const httpClient = new HttpClient(API_BASE_URL);

// ==================== API Response Types ====================

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface AuthResponse {
  token: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    name?: string;
  };
}

interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ==================== Authentication API ====================

export class AuthAPI {
  /**
   * Register a new user
   */
  static async signup(data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<AuthResponse> {
    // Backend expects 'name' field, not firstName/lastName
    const signupData = {
      name: `${data.firstName} ${data.lastName}`,
      email: data.email,
      password: data.password,
    };

    const response = await httpClient.post<ApiResponse<any>>(
      '/api/auth/signup',
      signupData,
      false
    );
    
    // Backend returns: { success: true, data: { user: {...}, requiresVerification: true } }
    // ApiResponse unwraps to { success, data: { user, requiresVerification } }
    const userData = response.data?.user;
    
    if (!userData) {
      console.error('Signup response:', response);
      throw new Error('Invalid response from server during signup');
    }
    
    // Signup doesn't return tokens immediately - user must verify email first
    // Return minimal user data for verification page
    return {
      token: '', // No token until email is verified
      user: {
        id: userData.id?.toString() || '',
        email: userData.email || data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        name: userData.name || `${data.firstName} ${data.lastName}`.trim(),
      },
    };
  }

  /**
   * Login existing user
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const response = await httpClient.post<ApiResponse<{ user: any; token: string; refreshToken?: string }>>(
      '/api/auth/login',
      { email, password },
      false
    );
    
    // Store tokens
    TokenManager.setToken(response.data.token);
    if (response.data.refreshToken) {
      TokenManager.setRefreshToken(response.data.refreshToken);
    }
    
    // Return normalized format for AuthResponse
    return {
      token: response.data.token,
      refreshToken: response.data.refreshToken,
      user: {
        id: response.data.user.id.toString(),
        email: response.data.user.email,
        firstName: '', // Will be populated by fetchUserProfile
        lastName: '', // Will be populated by fetchUserProfile
      }
    };
  }

  /**
   * Get current user profile
   */
  static async getProfile(): Promise<AuthResponse['user']> {
    const response = await httpClient.get<ApiResponse<any>>('/api/auth/me');
    const userData = response.data.user;
    
    // Backend returns 'name' but frontend expects firstName/lastName
    const nameParts = userData.name?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      id: userData.id,
      email: userData.email,
      firstName,
      lastName,
    };
  }

  /**
   * Update user profile
   */
  static async updateProfile(data: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }): Promise<AuthResponse['user']> {
    const response = await httpClient.put<ApiResponse<any>>(
      '/api/auth/profile',
      data
    );
    
    // Backend returns updated user with 'name' field
    const userData = response.data.user;
    const nameParts = userData.name?.split(' ') || ['', ''];
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    return {
      id: userData.id,
      email: userData.email,
      firstName,
      lastName,
    };
  }

  /**
   * Change password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Verify email with OTP code
   */
  static async verifyEmail(email: string, code: string): Promise<void> {
    await httpClient.post('/api/auth/verify-email', {
      email,
      code,
    }, false);
  }

  /**
   * Resend verification email
   */
  static async resendVerification(email: string): Promise<void> {
    await httpClient.post('/api/auth/resend-verification', {
      email,
    }, false);
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await httpClient.post('/api/auth/logout', {});
    } finally {
      TokenManager.clearTokens();
    }
  }
}

// ==================== Transaction API ====================

export interface TransactionInput {
  description: string;
  amount: number;
  category: string;
  accountId: string;
  date?: string;
  notes?: string;
}

export class TransactionAPI {
  /**
   * Get all transactions with optional filters
   */
  static async getAll(params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    accountId?: string;
  }): Promise<Transaction[]> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/api/transactions${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await httpClient.get<ApiResponse<Transaction[]>>(endpoint);
    return response.data;
  }

  /**
   * Get a single transaction by ID
   */
  static async getById(id: string): Promise<Transaction> {
    const response = await httpClient.get<ApiResponse<Transaction>>(`/api/transactions/${id}`);
    return response.data;
  }

  /**
   * Create a new transaction
   */
  static async create(transaction: TransactionInput): Promise<Transaction> {
    const response = await httpClient.post<ApiResponse<Transaction>>(
      '/api/transactions',
      transaction
    );
    return response.data;
  }

  /**
   * Update an existing transaction
   */
  static async update(id: string, updates: Partial<TransactionInput>): Promise<Transaction> {
    const response = await httpClient.put<ApiResponse<Transaction>>(
      `/api/transactions/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete a transaction
   */
  static async delete(id: string): Promise<void> {
    await httpClient.delete(`/api/transactions/${id}`);
  }
}

// ==================== Account API ====================

export interface AccountInput {
  name: string;
  type: Account['type'];
  balance: number;
  lastFour?: string;
}

export class AccountAPI {
  /**
   * Get all accounts for the current user
   */
  static async getAll(): Promise<Account[]> {
    const response = await httpClient.get<ApiResponse<Account[]>>('/api/accounts');
    return response.data;
  }

  /**
   * Get a single account by ID
   */
  static async getById(id: string): Promise<Account> {
    const response = await httpClient.get<ApiResponse<Account>>(`/api/accounts/${id}`);
    return response.data;
  }

  /**
   * Create a new account
   */
  static async create(account: AccountInput): Promise<Account> {
    const response = await httpClient.post<ApiResponse<Account>>(
      '/api/accounts',
      account
    );
    return response.data;
  }

  /**
   * Update an existing account
   */
  static async update(id: string, updates: Partial<AccountInput>): Promise<Account> {
    const response = await httpClient.put<ApiResponse<Account>>(
      `/api/accounts/${id}`,
      updates
    );
    return response.data;
  }

  /**
   * Delete an account
   */
  static async delete(id: string): Promise<void> {
    await httpClient.delete(`/api/accounts/${id}`);
  }

  /**
   * Verify an account
   */
  static async verify(id: string): Promise<Account> {
    const response = await httpClient.post<ApiResponse<Account>>(
      `/api/accounts/${id}/verify`
    );
    return response.data;
  }
}

// ==================== Category API ====================

export interface CategoryInput {
  name: string;
  type: 'Income' | 'Expense';
}

export class CategoryAPI {
  /**
   * Get all categories for the current user
   */
  static async getAll(type?: 'Income' | 'Expense'): Promise<Category[]> {
    // Convert type to lowercase for backend compatibility
    const apiType = type ? type.toLowerCase() : undefined;
    const endpoint = apiType ? `/api/categories?type=${apiType}` : '/api/categories';
    const response = await httpClient.get<ApiResponse<any[]>>(endpoint);
    
    // Transform backend categories to frontend format
    return response.data.map((cat: any) => ({
      id: String(cat.id),
      name: cat.name,
      type: cat.type === 'income' ? 'Income' as const : 'Expense' as const,
      userId: String(cat.user_id),
      isDefault: Boolean(cat.is_default),
    }));
  }

  /**
   * Get a single category by ID
   */
  static async getById(id: string): Promise<Category> {
    const response = await httpClient.get<ApiResponse<any>>(`/api/categories/${id}`);
    const cat = response.data;
    
    return {
      id: String(cat.id),
      name: cat.name,
      type: cat.type === 'income' ? 'Income' : 'Expense',
      userId: String(cat.user_id),
      isDefault: Boolean(cat.is_default),
    };
  }

  /**
   * Create a new category
   */
  static async create(category: CategoryInput): Promise<Category> {
    // Convert type to lowercase for backend compatibility
    const apiCategory = {
      ...category,
      type: category.type.toLowerCase() as 'income' | 'expense'
    };
    
    const response = await httpClient.post<ApiResponse<any>>(
      '/api/categories',
      apiCategory
    );
    
    const cat = response.data;
    return {
      id: String(cat.id),
      name: cat.name,
      type: cat.type === 'income' ? 'Income' : 'Expense',
      userId: String(cat.user_id),
      isDefault: Boolean(cat.is_default),
    };
  }

  /**
   * Update an existing category
   */
  static async update(id: string, updates: Partial<CategoryInput>): Promise<Category> {
    // Convert type to lowercase for backend compatibility if type is being updated
    const apiUpdates = updates.type 
      ? { ...updates, type: updates.type.toLowerCase() as 'income' | 'expense' }
      : updates;
      
    const response = await httpClient.put<ApiResponse<any>>(
      `/api/categories/${id}`,
      apiUpdates
    );
    
    const cat = response.data;
    return {
      id: String(cat.id),
      name: cat.name,
      type: cat.type === 'income' ? 'Income' : 'Expense',
      userId: String(cat.user_id),
      isDefault: Boolean(cat.is_default),
    };
  }

  /**
   * Delete a category
   */
  static async delete(id: string): Promise<void> {
    await httpClient.delete(`/api/categories/${id}`);
  }
}

// ==================== Plan/Subscription API ====================

export interface Plan {
  id: string;
  name: string;
  type: PlanType;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export class PlanAPI {
  /**
   * Get all available plans
   */
  static async getAll(): Promise<Plan[]> {
    const response = await httpClient.get<ApiResponse<Plan[]>>('/api/plans', false);
    return response.data;
  }

  /**
   * Get a specific plan by ID
   */
  static async getById(id: string): Promise<Plan> {
    const response = await httpClient.get<ApiResponse<Plan>>(`/api/plans/${id}`, false);
    return response.data;
  }

  /**
   * Upgrade to a new plan
   */
  static async upgrade(planId: string): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.post<ApiResponse<{ success: boolean; message: string }>>(
      '/api/plans/upgrade',
      { planId }
    );
    return response.data;
  }
}

// ==================== Dashboard API ====================

export interface DashboardStats {
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  accountsCount: number;
  transactionsCount: number;
  recentTransactions: Transaction[];
}

export interface SpendingByCategory {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface IncomeBySource {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export class DashboardAPI {
  /**
   * Get dashboard summary statistics
   */
  static async getSummary(): Promise<DashboardStats> {
    const response = await httpClient.get<ApiResponse<DashboardStats>>('/api/dashboard');
    // Ensure safe numeric values
    return {
      totalIncome: Number(response.data?.totalIncome) || 0,
      totalExpenses: Number(response.data?.totalExpenses) || 0,
      savings: Number(response.data?.savings) || 0,
      accountsCount: Number(response.data?.accountsCount) || 0,
      transactionsCount: Number(response.data?.transactionsCount) || 0,
      recentTransactions: Array.isArray(response.data?.recentTransactions) ? response.data.recentTransactions : [],
    };
  }

  /**
   * Get spending breakdown by category
   */
  static async getSpendingByCategory(period?: string): Promise<SpendingByCategory[]> {
    const endpoint = period ? `/api/dashboard/spending-by-category?period=${period}` : '/api/dashboard/spending-by-category';
    const response = await httpClient.get<ApiResponse<SpendingByCategory[]>>(endpoint);
    return response.data;
  }

  /**
   * Get income breakdown by source
   */
  static async getIncomeBySource(period?: string): Promise<IncomeBySource[]> {
    const endpoint = period ? `/api/dashboard/income-by-source?period=${period}` : '/api/dashboard/income-by-source';
    const response = await httpClient.get<ApiResponse<IncomeBySource[]>>(endpoint);
    return response.data;
  }
}

// ==================== Savings Goals API ====================

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoalInput {
  name: string;
  targetAmount: number;
  targetDate: string;
  description?: string;
}

export class SavingsGoalAPI {
  /**
   * Get all savings goals for the current user
   */
  static async getAll(): Promise<SavingsGoal[]> {
    const response = await httpClient.get<ApiResponse<SavingsGoal[]>>('/api/savings-goals');
    return response.data;
  }

  /**
   * Get a single savings goal by ID
   */
  static async getById(id: string): Promise<SavingsGoal> {
    const response = await httpClient.get<ApiResponse<SavingsGoal>>(`/api/savings-goals/${id}`);
    return response.data;
  }

  /**
   * Create a new savings goal
   */
  static async create(goal: SavingsGoalInput): Promise<SavingsGoal> {
    const response = await httpClient.post<ApiResponse<SavingsGoal>>('/api/savings-goals', goal);
    return response.data;
  }

  /**
   * Update an existing savings goal
   */
  static async update(id: string, updates: Partial<SavingsGoalInput>): Promise<SavingsGoal> {
    const response = await httpClient.put<ApiResponse<SavingsGoal>>(`/api/savings-goals/${id}`, updates);
    return response.data;
  }

  /**
   * Delete a savings goal
   */
  static async delete(id: string): Promise<void> {
    await httpClient.delete(`/api/savings-goals/${id}`);
  }

  /**
   * Allocate funds to a savings goal
   */
  static async allocate(goalId: string, amount: number, accountId: string): Promise<SavingsAllocation> {
    const response = await httpClient.post<ApiResponse<SavingsAllocation>>(
      `/api/savings-goals/${goalId}/allocate`,
      { amount, accountId }
    );
    return response.data;
  }

  /**
   * Withdraw funds from a savings goal
   */
  static async withdraw(goalId: string, amount: number, accountId: string): Promise<SavingsAllocation> {
    const response = await httpClient.post<ApiResponse<SavingsAllocation>>(
      `/api/savings-goals/${goalId}/withdraw`,
      { amount, accountId }
    );
    return response.data;
  }
}

// ==================== User/Profile API ====================

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  plan_id: number;
  avatar_url?: string;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  oauth_provider?: string;
  oauth_id?: string;
  last_login?: string;
  created_at: string;
  updated_at: string;
  plan?: {
    id: number;
    name: string;
    price: number;
    max_wallets: number;
    max_accounts: number;
    ai_enabled: boolean;
    ads_enabled: boolean;
    description?: string;
    features: string[];
  };
}

export interface UpdateProfileInput {
  name?: string;
  email?: string;
}

export class UserAPI {
  /**
   * Get current user profile with plan details
   */
  static async getProfile(): Promise<UserProfile> {
    const response = await httpClient.get<ApiResponse<{ user: UserProfile }>>('/api/auth/me');
    return response.data.user;
  }

  /**
   * Update user profile
   */
  static async updateProfile(updates: UpdateProfileInput): Promise<UserProfile> {
    const response = await httpClient.put<ApiResponse<UserProfile>>('/api/auth/profile', updates);
    return response.data;
  }

  /**
   * Change password
   */
  static async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await httpClient.post('/api/auth/change-password', {
      currentPassword,
      newPassword,
    });
  }

  /**
   * Delete user account
   */
  static async deleteAccount(): Promise<void> {
    await httpClient.delete('/api/auth/account');
  }
}

// ==================== PIN Management API ====================

export interface PinSetupInput {
  pin: string;
}

export interface PinVerifyInput {
  pin: string;
}

export class PinAPI {
  /**
   * Set up a new PIN for the user
   */
  static async setupPin(pin: string): Promise<void> {
    await httpClient.post('/api/auth/pin/setup', { pin });
  }

  /**
   * Verify a PIN
   */
  static async verifyPin(pin: string): Promise<{ valid: boolean }> {
    const response = await httpClient.post<ApiResponse<{ valid: boolean }>>('/api/auth/pin/verify', { pin });
    return response.data;
  }

  /**
   * Change existing PIN
   */
  static async changePin(currentPin: string, newPin: string): Promise<void> {
    await httpClient.post('/api/auth/pin/change', {
      currentPin,
      newPin,
    });
  }

  /**
   * Remove PIN (disable PIN protection)
   */
  static async removePin(pin: string): Promise<void> {
    await httpClient.post('/api/auth/pin/remove', { pin });
  }

  /**
   * Check if user has PIN enabled
   */
  static async hasPinEnabled(): Promise<{ enabled: boolean }> {
    const response = await httpClient.get<ApiResponse<{ enabled: boolean }>>('/api/auth/pin/status');
    return response.data;
  }
}

// ==================== Health Check API ====================

export class HealthAPI {
  /**
   * Check API health status
   */
  static async checkHealth(): Promise<{ success: boolean; message: string; timestamp: string }> {
    const response = await httpClient.get<{ success: boolean; message: string; timestamp: string }>(
      '/api/health',
      false
    );
    return response;
  }

  /**
   * Get API base information
   */
  static async getApiInfo(): Promise<{ success: boolean; message: string }> {
    const response = await httpClient.get<{ success: boolean; message: string }>('/api', false);
    return response;
  }
}

// ==================== Export All APIs ====================

export const API = {
  auth: AuthAPI,
  user: UserAPI,
  transactions: TransactionAPI,
  accounts: AccountAPI,
  categories: CategoryAPI,
  plans: PlanAPI,
  dashboard: DashboardAPI,
  savingsGoals: SavingsGoalAPI,
  pin: PinAPI,
  health: HealthAPI,
  tokens: TokenManager,
};

export default API;
