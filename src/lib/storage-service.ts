import type { Account, Transaction, Subscription, PlanType, Category, SavingsAllocation, PinData } from './types';
import { PIN_REQUIRED_ON_STARTUP_KEY } from './constants';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// localStorage keys
const TRANSACTIONS_STORAGE_KEY = 'budgee_transactions';
const ACCOUNTS_STORAGE_KEY = 'budgee_accounts';
const USERS_STORAGE_KEY = 'budgee_users';
const SUBSCRIPTIONS_STORAGE_KEY = 'budgee_subscriptions';
const CATEGORIES_STORAGE_KEY = 'budgee_categories';
const SAVINGS_STORAGE_KEY = 'budgee_savings';
const PIN_STORAGE_KEY = 'budgee_pins';

export interface TransactionInput {
  description: string;
  amount: number;
  category: Transaction['category'];
  accountId: string;
  date?: string;
  notes?: string; // Optional notes field
}

export interface AccountInput {
  name: string;
  type: Account['type'];
  balance: number;
  lastFour: string;
}

export interface UserInput {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface SavingsAllocationInput {
  amount: number;
  description: string;
  fromAccountId: string;
  type: 'deposit' | 'withdrawal';
  date?: string;
}

export class TransactionService {
  private static getUserKey(baseKey: string, userId: string): string {
    return `${baseKey}_${userId}`;
  }

  // Transaction methods
  static getTransactions(userId: string): Transaction[] {
    if (typeof window === 'undefined') return [];
    const key = this.getUserKey(TRANSACTIONS_STORAGE_KEY, userId);
    const transactionsStr = localStorage.getItem(key);
    return transactionsStr ? JSON.parse(transactionsStr) : [];
  }

  static addTransaction(userId: string, transaction: TransactionInput): Transaction {
    const newTransaction: Transaction = {
      id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: transaction.date || new Date().toISOString().split('T')[0],
      description: transaction.description,
      amount: transaction.amount,
      category: transaction.category,
      status: 'completed' as const,
      accountId: transaction.accountId,
      notes: transaction.notes,
    };

    const transactions = this.getTransactions(userId);
    transactions.push(newTransaction);
    this.saveTransactions(userId, transactions);
    
    return newTransaction;
  }

  static updateTransaction(userId: string, transactionId: string, updates: Partial<TransactionInput>): Transaction | null {
    const transactions = this.getTransactions(userId);
    const index = transactions.findIndex(t => t.id === transactionId);
    
    if (index === -1) return null;
    
    transactions[index] = {
      ...transactions[index],
      ...updates,
    };
    
    this.saveTransactions(userId, transactions);
    return transactions[index];
  }

  static removeTransaction(userId: string, transactionId: string): boolean {
    const transactions = this.getTransactions(userId);
    const filteredTransactions = transactions.filter(t => t.id !== transactionId);
    
    if (filteredTransactions.length === transactions.length) return false;
    
    this.saveTransactions(userId, filteredTransactions);
    return true;
  }

  private static saveTransactions(userId: string, transactions: Transaction[]): void {
    if (typeof window === 'undefined') return;
    const key = this.getUserKey(TRANSACTIONS_STORAGE_KEY, userId);
    localStorage.setItem(key, JSON.stringify(transactions));
  }

  // Account methods
  static getAccounts(userId: string): Account[] {
    if (typeof window === 'undefined') return [];
    const key = this.getUserKey(ACCOUNTS_STORAGE_KEY, userId);
    const accountsStr = localStorage.getItem(key);
    return accountsStr ? JSON.parse(accountsStr) : [];
  }

  static addAccount(userId: string, account: AccountInput): Account {
    const newAccount: Account = {
      id: `acc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: account.name,
      type: account.type,
      balance: account.balance,
      lastFour: account.lastFour,
    };

    const accounts = this.getAccounts(userId);
    accounts.push(newAccount);
    this.saveAccounts(userId, accounts);
    
    return newAccount;
  }

  static updateAccount(userId: string, accountId: string, updates: Partial<AccountInput>): Account | null {
    const accounts = this.getAccounts(userId);
    const index = accounts.findIndex(a => a.id === accountId);
    
    if (index === -1) return null;
    
    accounts[index] = {
      ...accounts[index],
      ...updates,
    };
    
    this.saveAccounts(userId, accounts);
    return accounts[index];
  }

  static removeAccount(userId: string, accountId: string): boolean {
    const accounts = this.getAccounts(userId);
    const filteredAccounts = accounts.filter(a => a.id !== accountId);
    
    if (filteredAccounts.length === accounts.length) return false;
    
    this.saveAccounts(userId, filteredAccounts);
    return true;
  }

  private static saveAccounts(userId: string, accounts: Account[]): void {
    if (typeof window === 'undefined') return;
    const key = this.getUserKey(ACCOUNTS_STORAGE_KEY, userId);
    localStorage.setItem(key, JSON.stringify(accounts));
  }

  // Ensure user has a cash account for manual transactions
  static ensureCashAccount(userId: string): Account {
    const accounts = this.getAccounts(userId);
    let cashAccount = accounts.find(account => account.type === 'Cash');
    
    if (!cashAccount) {
      cashAccount = this.addAccount(userId, {
        name: 'Cash',
        type: 'Cash',
        balance: 0.00,
        lastFour: '----'
      });
    }
    
    return cashAccount;
  }

  // Analytics methods
  static getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Transaction[] {
    const transactions = this.getTransactions(userId);
    return transactions.filter(t => t.date >= startDate && t.date <= endDate);
  }

  static getTransactionsByCategory(userId: string, category: Transaction['category']): Transaction[] {
    const transactions = this.getTransactions(userId);
    return transactions.filter(t => t.category === category);
  }

  static getTransactionsByAccount(userId: string, accountId: string): Transaction[] {
    const transactions = this.getTransactions(userId);
    return transactions.filter(t => t.accountId === accountId);
  }

  // Savings allocation methods
  static getSavingsAllocations(userId: string): SavingsAllocation[] {
    if (typeof window === 'undefined') return [];
    const key = this.getUserKey(SAVINGS_STORAGE_KEY, userId);
    const savingsStr = localStorage.getItem(key);
    return savingsStr ? JSON.parse(savingsStr) : [];
  }

  static addSavingsAllocation(userId: string, allocation: SavingsAllocationInput): SavingsAllocation {
    const newAllocation: SavingsAllocation = {
      id: `sav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      amount: allocation.amount,
      description: allocation.description,
      date: allocation.date || new Date().toISOString().split('T')[0],
      fromAccountId: allocation.fromAccountId,
      type: allocation.type,
    };

    const allocations = this.getSavingsAllocations(userId);
    allocations.push(newAllocation);
    this.saveSavingsAllocations(userId, allocations);
    
    // Update the account balance
    if (allocation.type === 'deposit') {
      // Remove money from account when depositing to savings
      this.updateAccountBalance(userId, allocation.fromAccountId, -allocation.amount);
    } else {
      // Add money to account when withdrawing from savings
      this.updateAccountBalance(userId, allocation.fromAccountId, allocation.amount);
    }
    
    return newAllocation;
  }

  static getTotalSavings(userId: string): number {
    const allocations = this.getSavingsAllocations(userId);
    return allocations.reduce((total, allocation) => {
      return allocation.type === 'deposit' 
        ? total + allocation.amount 
        : total - allocation.amount;
    }, 0);
  }

  private static saveSavingsAllocations(userId: string, allocations: SavingsAllocation[]): void {
    if (typeof window === 'undefined') return;
    const key = this.getUserKey(SAVINGS_STORAGE_KEY, userId);
    localStorage.setItem(key, JSON.stringify(allocations));
    
    // Dispatch event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('budgee:dataUpdate'));
    }
  }

  private static updateAccountBalance(userId: string, accountId: string, amount: number): void {
    const accounts = this.getAccounts(userId);
    const accountIndex = accounts.findIndex(a => a.id === accountId);
    
    if (accountIndex !== -1) {
      accounts[accountIndex].balance += amount;
      this.saveAccounts(userId, accounts);
    }
  }

  static calculateTotals(userId: string): { totalIncome: number; totalExpenses: number; savings: number } {
    const transactions = this.getTransactions(userId);
    
    const totalIncome = transactions
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs(transactions
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    // Calculate savings from savings allocations, not income-expenses
    const savings = this.getTotalSavings(userId);
    
    return { totalIncome, totalExpenses, savings };
  }

  // Seed data for new users
  static seedUserData(userId: string): void {
    // Only seed if user has no existing data
    if (this.getTransactions(userId).length > 0 || this.getAccounts(userId).length > 0) {
      return;
    }

    // Add only a default Cash account for manual transactions
    const defaultAccounts: AccountInput[] = [
      { name: 'Cash', type: 'Cash', balance: 0.00, lastFour: '----' },
    ];

    defaultAccounts.forEach(acc => this.addAccount(userId, acc));

    // No sample transactions added - users start with a clean slate
  }

  // Clear all user data (for logout)
  static clearUserData(userId: string): void {
    if (typeof window === 'undefined') return;
    
    const transactionsKey = this.getUserKey(TRANSACTIONS_STORAGE_KEY, userId);
    const accountsKey = this.getUserKey(ACCOUNTS_STORAGE_KEY, userId);
    
    localStorage.removeItem(transactionsKey);
    localStorage.removeItem(accountsKey);
    
    // Also clear subscription and category data
    this.clearSubscriptionData(userId);
    this.clearCategoryData(userId);
  }

  // User management functions
  static getAllUsers(): User[] {
    if (typeof window === 'undefined') return [];
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  static addUser(userInput: UserInput): User {
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      email: userInput.email,
      firstName: userInput.firstName,
      lastName: userInput.lastName,
    };

    const users = this.getAllUsers();
    users.push(newUser);
    this.saveUsers(users);
    
    return newUser;
  }

  static getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  static getUserById(userId: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  }

  static updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): User | null {
    const users = this.getAllUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) return null;
    
    users[index] = {
      ...users[index],
      ...updates,
    };
    
    this.saveUsers(users);
    return users[index];
  }

  static removeUser(userId: string): boolean {
    const users = this.getAllUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    
    if (filteredUsers.length === users.length) return false;
    
    // Also clear all user data
    this.clearUserData(userId);
    
    this.saveUsers(filteredUsers);
    return true;
  }

  private static saveUsers(users: User[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  // Check if email is already registered
  static isEmailRegistered(email: string): boolean {
    return this.getUserByEmail(email) !== null;
  }

  // Subscription management methods
  static getUserSubscription(userId: string): Subscription | null {
    if (typeof window === 'undefined') return null;
    const subscriptionsStr = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    if (!subscriptionsStr) return null;
    
    const subscriptions: Subscription[] = JSON.parse(subscriptionsStr);
    return subscriptions.find(sub => sub.userId === userId) || null;
  }

  static createOrUpdateSubscription(userId: string, planType: PlanType): Subscription {
    const now = new Date();
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);

    const planFeatures: Record<PlanType, string[]> = {
      'Free': [
        'Connect 1 bank account',
        'Connect 1 e-wallet', 
        'Basic transaction categorization',
        'Net worth tracking',
        'Monthly spending summary'
      ],
      'Basic': [
        'Everything in Free',
        'Connect up to 5 accounts',
        'Advanced categorization rules',
        'AI-powered financial insights',
        'Export transactions to CSV/Excel',
        'Budget goals and alerts'
      ],
      'Premium': [
        'Everything in Basic',
        'Unlimited account connections',
        'Full AI financial assistant access',
        'Investment and savings tracking',
        'Custom financial reports',
        'Priority customer support'
      ]
    };

    const subscription: Subscription = {
      id: `sub_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      planType,
      startDate: now.toISOString(),
      nextBillingDate: planType !== 'Free' ? nextMonth.toISOString() : undefined,
      status: 'active',
      features: planFeatures[planType]
    };

    this.saveUserSubscription(subscription);
    return subscription;
  }

  private static saveUserSubscription(subscription: Subscription): void {
    if (typeof window === 'undefined') return;
    
    const subscriptionsStr = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    let subscriptions: Subscription[] = subscriptionsStr ? JSON.parse(subscriptionsStr) : [];
    
    // Remove existing subscription for this user
    subscriptions = subscriptions.filter(sub => sub.userId !== subscription.userId);
    
    // Add new subscription
    subscriptions.push(subscription);
    
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions));
  }

  static cancelSubscription(userId: string): boolean {
    const subscription = this.getUserSubscription(userId);
    if (!subscription) return false;

    subscription.status = 'cancelled';
    this.saveUserSubscription(subscription);
    return true;
  }

  static clearSubscriptionData(userId: string): void {
    if (typeof window === 'undefined') return;
    
    const subscriptionsStr = localStorage.getItem(SUBSCRIPTIONS_STORAGE_KEY);
    if (!subscriptionsStr) return;
    
    let subscriptions: Subscription[] = JSON.parse(subscriptionsStr);
    subscriptions = subscriptions.filter(sub => sub.userId !== userId);
    
    localStorage.setItem(SUBSCRIPTIONS_STORAGE_KEY, JSON.stringify(subscriptions));
  }

  // Category management methods
  static getCategories(userId: string, type?: 'Income' | 'Expense'): Category[] {
    if (typeof window === 'undefined') return [];
    const categoriesStr = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!categoriesStr) return [];
    
    const allCategories: Category[] = JSON.parse(categoriesStr);
    let userCategories = allCategories.filter(cat => cat.userId === userId);
    
    if (type) {
      userCategories = userCategories.filter(cat => cat.type === type);
    }
    
    return userCategories;
  }

  static addCategory(userId: string, name: string, type: 'Income' | 'Expense', color: string): Category {
    const newCategory: Category = {
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      color,
      type,
      userId,
      isDefault: false
    };

    const categoriesStr = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const categories: Category[] = categoriesStr ? JSON.parse(categoriesStr) : [];
    categories.push(newCategory);
    
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    return newCategory;
  }

  static deleteCategory(userId: string, categoryId: string): boolean {
    const categoriesStr = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!categoriesStr) return false;
    
    let categories: Category[] = JSON.parse(categoriesStr);
    const categoryToDelete = categories.find(cat => cat.id === categoryId && cat.userId === userId);
    
    // Check if category exists for this user
    if (!categoryToDelete) return false;
    
    categories = categories.filter(cat => !(cat.id === categoryId && cat.userId === userId));
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
    
    return true;
  }

  static initializeDefaultCategories(userId: string): void {
    // Check if user already has categories
    if (this.getCategories(userId).length > 0) return;

    const defaultCategories = [
      // Income categories
      { name: 'Salary', type: 'Income' as const, color: '#00B894' },
      { name: 'Miscellaneous', type: 'Income' as const, color: '#6C5CE7' },
      
      // Expense categories  
      { name: 'Food', type: 'Expense' as const, color: '#FF6B6B' },
      { name: 'Transportation', type: 'Expense' as const, color: '#4ECDC4' },
      { name: 'Rent', type: 'Expense' as const, color: '#45B7D1' },
      { name: 'Utilities', type: 'Expense' as const, color: '#FFEAA7' },
      { name: 'Entertainment', type: 'Expense' as const, color: '#96CEB4' },
      { name: 'Miscellaneous', type: 'Expense' as const, color: '#DDA0DD' },
    ];

    const categoriesStr = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    const existingCategories: Category[] = categoriesStr ? JSON.parse(categoriesStr) : [];

    defaultCategories.forEach(cat => {
      const category: Category = {
        id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: cat.name,
        color: cat.color,
        type: cat.type,
        userId,
        isDefault: true
      };
      existingCategories.push(category);
    });

    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(existingCategories));
  }

  static clearCategoryData(userId: string): void {
    if (typeof window === 'undefined') return;
    
    const categoriesStr = localStorage.getItem(CATEGORIES_STORAGE_KEY);
    if (!categoriesStr) return;
    
    let categories: Category[] = JSON.parse(categoriesStr);
    categories = categories.filter(cat => cat.userId !== userId);
    
    localStorage.setItem(CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
  }

  // PIN Management Methods
  static setPinData(userId: string, hashedPin: string): void {
    if (typeof window === 'undefined') return;
    
    const pinsStr = localStorage.getItem(PIN_STORAGE_KEY);
    let pins: PinData[] = pinsStr ? JSON.parse(pinsStr) : [];
    
    // Remove existing PIN for this user
    pins = pins.filter(pin => pin.userId !== userId);
    
    // Add new PIN data (always 6 digits now)
    const newPinData: PinData = {
      userId,
      hashedPin,
      isEnabled: true,
      createdAt: new Date().toISOString(),
      pinLength: 6,
    };
    
    pins.push(newPinData);
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
  }

  static getPinData(userId: string): PinData | null {
    if (typeof window === 'undefined') return null;
    
    const pinsStr = localStorage.getItem(PIN_STORAGE_KEY);
    if (!pinsStr) return null;
    
    const pins: PinData[] = JSON.parse(pinsStr);
    return pins.find(pin => pin.userId === userId) || null;
  }

  static updatePinLastUsed(userId: string): void {
    if (typeof window === 'undefined') return;
    
    const pinsStr = localStorage.getItem(PIN_STORAGE_KEY);
    if (!pinsStr) return;
    
    const pins: PinData[] = JSON.parse(pinsStr);
    const pinIndex = pins.findIndex(pin => pin.userId === userId);
    
    if (pinIndex !== -1) {
      pins[pinIndex].lastUsed = new Date().toISOString();
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
    }
  }

  static disablePin(userId: string): void {
    if (typeof window === 'undefined') return;
    
    const pinsStr = localStorage.getItem(PIN_STORAGE_KEY);
    if (!pinsStr) return;
    
    const pins: PinData[] = JSON.parse(pinsStr);
    const pinIndex = pins.findIndex(pin => pin.userId === userId);
    
    if (pinIndex !== -1) {
      pins[pinIndex].isEnabled = false;
      localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
      // Clear the PIN requirement flag when PIN is disabled
      localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
    }
  }

  static removePinData(userId: string): void {
    if (typeof window === 'undefined') return;
    
    const pinsStr = localStorage.getItem(PIN_STORAGE_KEY);
    if (!pinsStr) return;
    
    let pins: PinData[] = JSON.parse(pinsStr);
    pins = pins.filter(pin => pin.userId !== userId);
    localStorage.setItem(PIN_STORAGE_KEY, JSON.stringify(pins));
    // Clear the PIN requirement flag when PIN data is removed
    localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
  }

  static hasPinEnabled(userId: string): boolean {
    const pinData = this.getPinData(userId);
    return pinData !== null && pinData.isEnabled;
  }
}