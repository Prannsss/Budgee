/**
 * Supabase Database Service
 * Common database operations and utilities for Supabase
 */

import { supabase } from '../config/supabase';
import {
  User,
  UserInsert,
  UserUpdate,
  Account,
  AccountInsert,
  Category,
  CategoryInsert,
  Transaction,
  TransactionInsert,
  OTP,
  OTPInsert,
  ActivityLogInsert,
  UserWithPlan,
} from '../types/database.types';

// ================================================
// User Operations
// ================================================

/**
 * Get user by ID with plan
 */
export const getUserById = async (userId: number): Promise<UserWithPlan | null> => {
  const { data, error } = await supabase
    .from('users')
    .select(`
      *,
      plan:plans(*)
    `)
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
};

/**
 * Get user by email
 */
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    console.error('Error fetching user by email:', error);
    return null;
  }

  return data;
};

/**
 * Create a new user
 */
export const createUser = async (userData: UserInsert): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single();

  if (error) {
    console.error('Error creating user:', error);
    return null;
  }

  return data;
};

/**
 * Update user
 */
export const updateUser = async (userId: number, updates: UserUpdate): Promise<User | null> => {
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user:', error);
    return null;
  }

  return data;
};

// ================================================
// Account Operations
// ================================================

/**
 * Get all accounts for a user
 */
export const getUserAccounts = async (userId: number): Promise<Account[]> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching user accounts:', error);
    return [];
  }

  return data || [];
};

/**
 * Create an account
 */
export const createAccount = async (accountData: AccountInsert): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .insert(accountData)
    .select()
    .single();

  if (error) {
    console.error('Error creating account:', error);
    return null;
  }

  return data;
};

/**
 * Get account by ID
 */
export const getAccountById = async (accountId: number): Promise<Account | null> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', accountId)
    .single();

  if (error) {
    console.error('Error fetching account:', error);
    return null;
  }

  return data;
};

/**
 * Check if Cash account exists for user
 */
export const hasCashAccount = async (userId: number): Promise<boolean> => {
  const { data, error } = await supabase
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'Cash')
    .eq('name', 'Cash')
    .single();

  return !error && !!data;
};

// ================================================
// Category Operations
// ================================================

/**
 * Get all categories for a user
 */
export const getUserCategories = async (userId: number): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return data || [];
};

/**
 * Create multiple categories
 */
export const createCategories = async (categories: CategoryInsert[]): Promise<Category[]> => {
  const { data, error } = await supabase
    .from('categories')
    .insert(categories)
    .select();

  if (error) {
    console.error('Error creating categories:', error);
    return [];
  }

  return data || [];
};

// ================================================
// Transaction Operations
// ================================================

/**
 * Get transactions for a user
 */
export const getUserTransactions = async (
  userId: number,
  options?: {
    limit?: number;
    offset?: number;
    startDate?: string;
    endDate?: string;
    type?: 'income' | 'expense' | 'transfer';
  }
): Promise<Transaction[]> => {
  let query = supabase
    .from('transactions')
    .select(`
      *,
      account:accounts(*),
      category:categories(*)
    `)
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (options?.startDate) {
    query = query.gte('date', options.startDate);
  }
  if (options?.endDate) {
    query = query.lte('date', options.endDate);
  }
  if (options?.type) {
    query = query.eq('type', options.type);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }
  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching transactions:', error);
    return [];
  }

  return data || [];
};

/**
 * Create a transaction
 */
export const createTransaction = async (transactionData: TransactionInsert): Promise<Transaction | null> => {
  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single();

  if (error) {
    console.error('Error creating transaction:', error);
    return null;
  }

  return data;
};

// ================================================
// OTP Operations
// ================================================

/**
 * Create OTP
 */
export const createOTP = async (otpData: OTPInsert): Promise<OTP | null> => {
  const { data, error } = await supabase
    .from('otps')
    .insert(otpData)
    .select()
    .single();

  if (error) {
    console.error('Error creating OTP:', error);
    return null;
  }

  return data;
};

/**
 * Get valid OTP for user
 */
export const getValidOTP = async (
  userId: number,
  code: string,
  purpose: string
): Promise<OTP | null> => {
  const { data, error } = await supabase
    .from('otps')
    .select('*')
    .eq('user_id', userId)
    .eq('code', code)
    .eq('purpose', purpose)
    .eq('is_verified', false)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error) {
    return null;
  }

  // Check if expired
  const now = new Date();
  const expiresAt = new Date(data.expires_at);
  if (now.getTime() > expiresAt.getTime()) {
    return null;
  }

  return data;
};

/**
 * Mark OTP as verified
 */
export const markOTPVerified = async (otpId: number): Promise<boolean> => {
  const { error } = await supabase
    .from('otps')
    .update({ is_verified: true })
    .eq('id', otpId);

  if (error) {
    console.error('Error marking OTP as verified:', error);
    return false;
  }

  return true;
};

// ================================================
// Activity Log Operations
// ================================================

/**
 * Log user activity
 */
export const logActivity = async (activityData: ActivityLogInsert): Promise<boolean> => {
  const { error } = await supabase
    .from('activity_logs')
    .insert(activityData);

  if (error) {
    console.error('Error logging activity:', error);
    return false;
  }

  return true;
};

// ================================================
// Balance Update Operations
// ================================================

/**
 * Update account balance
 */
export const updateAccountBalance = async (
  accountId: number,
  newBalance: number
): Promise<boolean> => {
  const { error } = await supabase
    .from('accounts')
    .update({ balance: newBalance })
    .eq('id', accountId);

  if (error) {
    console.error('Error updating account balance:', error);
    return false;
  }

  return true;
};

/**
 * Increment account balance
 */
export const incrementAccountBalance = async (
  accountId: number,
  amount: number
): Promise<boolean> => {
  const account = await getAccountById(accountId);
  if (!account) return false;

  const newBalance = Number(account.balance) + amount;
  return updateAccountBalance(accountId, newBalance);
};

/**
 * Decrement account balance
 */
export const decrementAccountBalance = async (
  accountId: number,
  amount: number
): Promise<boolean> => {
  const account = await getAccountById(accountId);
  if (!account) return false;

  const newBalance = Number(account.balance) - amount;
  return updateAccountBalance(accountId, newBalance);
};

// ================================================
// Dashboard Statistics
// ================================================

/**
 * Get dashboard statistics for a user
 */
export const getDashboardStats = async (userId: number, month?: string, year?: string) => {
  // Get current month/year if not provided
  const now = new Date();
  const currentMonth = month || String(now.getMonth() + 1).padStart(2, '0');
  const currentYear = year || String(now.getFullYear());
  const startDate = `${currentYear}-${currentMonth}-01`;
  
  // Calculate end date (last day of month)
  const lastDay = new Date(Number(currentYear), Number(currentMonth), 0).getDate();
  const endDate = `${currentYear}-${currentMonth}-${lastDay}`;

  // Get total income
  const { data: incomeData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'income')
    .gte('date', startDate)
    .lte('date', endDate);

  const totalIncome = incomeData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  // Get total expenses
  const { data: expenseData } = await supabase
    .from('transactions')
    .select('amount')
    .eq('user_id', userId)
    .eq('type', 'expense')
    .gte('date', startDate)
    .lte('date', endDate);

  const totalExpenses = expenseData?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

  // Get total balance (sum of all accounts)
  const { data: accountsData } = await supabase
    .from('accounts')
    .select('balance')
    .eq('user_id', userId)
    .eq('is_active', true);

  const totalBalance = accountsData?.reduce((sum, a) => sum + Number(a.balance), 0) || 0;

  return {
    totalIncome,
    totalExpenses,
    totalBalance,
    netCashFlow: totalIncome - totalExpenses,
  };
};
