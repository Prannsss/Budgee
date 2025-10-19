import type { Account, Transaction, Subscription, PlanType, Category, SavingsAllocation, PinData } from './types';
import { PIN_REQUIRED_ON_STARTUP_KEY } from './constants';
import { TransactionAPI, AccountAPI, CategoryAPI, type TransactionInput as APITransactionInput, type AccountInput as APIAccountInput, type CategoryInput as APICategoryInput } from './api-service';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

// localStorage keys (now only used for local-only features like PIN)
const USERS_STORAGE_KEY = 'budgee_users';
const SUBSCRIPTIONS_STORAGE_KEY = 'budgee_subscriptions';
const SAVINGS_STORAGE_KEY = 'budgee_savings';
const PIN_STORAGE_KEY = 'budgee_pins';

export interface TransactionInput {
  description: string;
  amount: number;
  category: Transaction['category'];
  accountId: string;
  date?: string;
  notes?: string;
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
  // ==================== Transaction methods (now using API) ====================
  
  static async getTransactions(userId: string): Promise<Transaction[]> {
    try {
      return await TransactionAPI.getAll();
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return [];
    }
  }

  /**
   * @deprecated This method has incorrect type mappings. Use TransactionAPI.create() directly instead.
   */
  static async addTransaction(userId: string, transaction: TransactionInput): Promise<Transaction | null> {
    try {
      // This method is deprecated and has incorrect type mappings
      // It expects category name and accountId as strings, but API needs category_id and account_id as numbers
      // Direct API usage is recommended instead
      console.warn('TransactionService.addTransaction() is deprecated. Use TransactionAPI.create() directly.');
      
      // Cast to any to bypass type checking for this deprecated method
      const apiTransaction: any = {
        description: transaction.description,
        amount: transaction.amount,
        category: transaction.category,
        accountId: transaction.accountId,
        date: transaction.date || new Date().toISOString().split('T')[0],
        notes: transaction.notes,
      };
      
      const newTransaction = await TransactionAPI.create(apiTransaction);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  }

  static async updateTransaction(
    userId: string, 
    transactionId: string, 
    updates: Partial<TransactionInput>
  ): Promise<Transaction | null> {
    try {
      const updatedTransaction = await TransactionAPI.update(transactionId, updates);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return updatedTransaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      return null;
    }
  }

  static async removeTransaction(userId: string, transactionId: string): Promise<boolean> {
    try {
      await TransactionAPI.delete(transactionId);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return true;
    } catch (error) {
      console.error('Error removing transaction:', error);
      return false;
    }
  }

  // ==================== Account methods (now using API) ====================
  
  static async getAccounts(userId: string): Promise<Account[]> {
    try {
      return await AccountAPI.getAll();
    } catch (error) {
      console.error('Error fetching accounts:', error);
      return [];
    }
  }

  static async addAccount(userId: string, account: AccountInput): Promise<Account | null> {
    try {
      const apiAccount: APIAccountInput = {
        name: account.name,
        type: account.type,
        balance: account.balance,
        lastFour: account.lastFour,
      };
      
      const newAccount = await AccountAPI.create(apiAccount);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      return null;
    }
  }

  static async updateAccount(
    userId: string, 
    accountId: string, 
    updates: Partial<AccountInput>
  ): Promise<Account | null> {
    try {
      const updatedAccount = await AccountAPI.update(accountId, updates);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return updatedAccount;
    } catch (error) {
      console.error('Error updating account:', error);
      return null;
    }
  }

  static async removeAccount(userId: string, accountId: string): Promise<boolean> {
    try {
      await AccountAPI.delete(accountId);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return true;
    } catch (error) {
      console.error('Error removing account:', error);
      return false;
    }
  }

  // Ensure user has a cash account for manual transactions
  static async ensureCashAccount(userId: string): Promise<Account | null> {
    try {
      const accounts = await this.getAccounts(userId);
      
      // Safety check - ensure accounts is an array
      if (!Array.isArray(accounts)) {
        console.warn('ensureCashAccount: accounts is not an array', accounts);
        return null;
      }
      
      // Look for Cash account by name (backend creates it with type='bank', name='Cash')
      let cashAccount = accounts.find(account => account.name === 'Cash');
      
      if (!cashAccount) {
        const newAccount = await this.addAccount(userId, {
          name: 'Cash',
          type: 'Bank', // Backend expects 'bank' (will be converted to lowercase)
          balance: 0.00,
          lastFour: '----'
        });
        cashAccount = newAccount || undefined;
      }
      
      return cashAccount || null;
    } catch (error) {
      console.error('Error ensuring cash account:', error);
      return null;
    }
  }

  // Analytics methods
  static async getTransactionsByDateRange(userId: string, startDate: string, endDate: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions(userId);
      return transactions.filter(t => t.date >= startDate && t.date <= endDate);
    } catch (error) {
      console.error('Error fetching transactions by date range:', error);
      return [];
    }
  }

  static async getTransactionsByCategory(userId: string, category: Transaction['category']): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions(userId);
      return transactions.filter(t => t.category === category);
    } catch (error) {
      console.error('Error fetching transactions by category:', error);
      return [];
    }
  }

  static async getTransactionsByAccount(userId: string, accountId: string): Promise<Transaction[]> {
    try {
      const transactions = await this.getTransactions(userId);
      return transactions.filter(t => t.accountId === accountId);
    } catch (error) {
      console.error('Error fetching transactions by account:', error);
      return [];
    }
  }

  // Savings allocation methods (kept in localStorage for now - no backend endpoint yet)
  static getSavingsAllocations(userId: string): SavingsAllocation[] {
    if (typeof window === 'undefined') return [];
    const savingsStr = localStorage.getItem(`${SAVINGS_STORAGE_KEY}_${userId}`);
    return savingsStr ? JSON.parse(savingsStr) : [];
  }

  static async addSavingsAllocation(userId: string, allocation: SavingsAllocationInput): Promise<SavingsAllocation> {
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
    
    // Update the account balance via API
    if (allocation.type === 'deposit') {
      await this.updateAccountBalance(userId, allocation.fromAccountId, -allocation.amount);
    } else {
      await this.updateAccountBalance(userId, allocation.fromAccountId, allocation.amount);
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
    localStorage.setItem(`${SAVINGS_STORAGE_KEY}_${userId}`, JSON.stringify(allocations));
    
    // Dispatch event for UI updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('budgee:dataUpdate'));
    }
  }

  private static async updateAccountBalance(userId: string, accountId: string, amount: number): Promise<void> {
    try {
      const account = await AccountAPI.getById(accountId);
      const newBalance = account.balance + amount;
      await AccountAPI.update(accountId, { balance: newBalance });
    } catch (error) {
      console.error('Error updating account balance:', error);
    }
  }

  static async calculateTotals(userId: string): Promise<{ totalIncome: number; totalExpenses: number; savings: number }> {
    try {
      const transactions = await this.getTransactions(userId);
      
      // Safety check - ensure transactions is an array
      if (!Array.isArray(transactions)) {
        console.warn('calculateTotals: transactions is not an array', transactions);
        return { totalIncome: 0, totalExpenses: 0, savings: 0 };
      }
      
      const totalIncome = transactions
        .filter((t: Transaction) => t.type === 'income')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      const totalExpenses = transactions
        .filter((t: Transaction) => t.type === 'expense')
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0);
      
      // Calculate savings from savings allocations, not income-expenses
      const savings = this.getTotalSavings(userId);
      
      return { totalIncome, totalExpenses, savings };
    } catch (error) {
      console.error('Error calculating totals:', error);
      return { totalIncome: 0, totalExpenses: 0, savings: 0 };
    }
  }

  // Seed data for new users
  static async seedUserData(userId: string): Promise<void> {
    try {
      // Only seed if user has no existing data
      const [transactions, accounts] = await Promise.all([
        this.getTransactions(userId),
        this.getAccounts(userId)
      ]);
      
      if (transactions.length > 0 || accounts.length > 0) {
        return;
      }

      // Add only a default Cash account for manual transactions
      await this.addAccount(userId, {
        name: 'Cash',
        type: 'Cash',
        balance: 0.00,
        lastFour: '----'
      });
    } catch (error) {
      console.error('Error seeding user data:', error);
    }
  }

  // Clear all user data (for logout)
  static clearUserData(userId: string): void {
    if (typeof window === 'undefined') return;
    
    // Clear savings data from localStorage
    localStorage.removeItem(`${SAVINGS_STORAGE_KEY}_${userId}`);
    
    // Also clear subscription and category data
    this.clearSubscriptionData(userId);
    this.clearCategoryData(userId);
    
    // Note: Transactions and accounts are now in the database,
    // so they're not cleared here on logout
  }

  // ==================== DEPRECATED USER MANAGEMENT FUNCTIONS ====================
  // User data is now stored in PostgreSQL database, not localStorage
  // These functions are kept for backward compatibility but should not be used
  // Use AuthAPI and backend endpoints instead
  
  /**
   * @deprecated User data is now in the database. Use AuthAPI instead.
   */
  static getAllUsers(): User[] {
    console.warn('TransactionService.getAllUsers() is deprecated. User data is now in the database.');
    if (typeof window === 'undefined') return [];
    const usersStr = localStorage.getItem(USERS_STORAGE_KEY);
    return usersStr ? JSON.parse(usersStr) : [];
  }

  /**
   * @deprecated User data is now in the database. Use AuthAPI.signup() instead.
   */
  static addUser(userInput: UserInput): User {
    console.warn('TransactionService.addUser() is deprecated. Use AuthAPI.signup() instead.');
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

  /**
   * @deprecated User data is now in the database. Query the backend API instead.
   */
  static getUserByEmail(email: string): User | null {
    console.warn('TransactionService.getUserByEmail() is deprecated. User data is now in the database.');
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  /**
   * @deprecated User data is now in the database. Query the backend API instead.
   */
  static getUserById(userId: string): User | null {
    console.warn('TransactionService.getUserById() is deprecated. User data is now in the database.');
    const users = this.getAllUsers();
    return users.find(user => user.id === userId) || null;
  }

  /**
   * @deprecated User data is now in the database. Use AuthAPI.updateProfile() instead.
   */
  static updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): User | null {
    console.warn('TransactionService.updateUser() is deprecated. Use AuthAPI.updateProfile() instead.');
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

  /**
   * @deprecated User data is now in the database. Use backend API to delete users.
   */
  static removeUser(userId: string): boolean {
    console.warn('TransactionService.removeUser() is deprecated. User data is now in the database.');
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

  /**
   * @deprecated User data is now in the database. This always returns false.
   * Email validation happens on the backend during signup.
   */
  static isEmailRegistered(email: string): boolean {
    console.warn('TransactionService.isEmailRegistered() is deprecated. Email validation happens on the backend.');
    // Always return false since we don't check localStorage anymore
    return false;
  }
  
  // ==================== END DEPRECATED FUNCTIONS ====================

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

  // ==================== Category management methods (now using API) ====================
  
  static async getCategories(userId: string, type?: 'Income' | 'Expense'): Promise<Category[]> {
    try {
      return await CategoryAPI.getAll(type);
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  static async addCategory(userId: string, name: string, type: 'Income' | 'Expense'): Promise<Category | null> {
    try {
      const newCategory = await CategoryAPI.create({ name, type });
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return newCategory;
    } catch (error) {
      console.error('Error adding category:', error);
      return null;
    }
  }

  static async deleteCategory(userId: string, categoryId: string): Promise<boolean> {
    try {
      await CategoryAPI.delete(categoryId);
      
      // Dispatch event for UI updates
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('budgee:dataUpdate'));
      }
      
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      return false;
    }
  }

  static async initializeDefaultCategories(userId: string): Promise<void> {
    try {
      // Default categories are now created by the backend during email verification
      // This function just ensures categories are loaded from backend
      const existingCategories = await this.getCategories(userId);
      
      // If no categories exist (shouldn't happen for verified users), log a warning
      if (existingCategories.length === 0) {
        console.warn('No categories found for user. Default categories should be created by backend during email verification.');
      }
      
      // Categories are automatically fetched from backend via getCategories
      // No need to create them here
    } catch (error) {
      console.error('Error checking default categories:', error);
    }
  }

  static clearCategoryData(userId: string): void {
    // Categories are now in the database, so this method no longer needs to do anything
    // Kept for backward compatibility
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