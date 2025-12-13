/**
 * Demo Bank Service
 * 
 * Provides simulated bank connection functionality for demonstration purposes.
 * No real bank data is ever accessed, connected, or stored.
 * 
 * This service is designed to:
 * 1. Generate realistic-looking sample transactions
 * 2. Create demo accounts with proper flags
 * 3. Manage local persistence of demo data
 * 4. Be future-ready for real bank API integrations
 */

import type { Account, Transaction, Institution, AccountProvider, ConnectionStatus } from './types';

// ==================== Types ====================

export interface DemoAccountConfig {
  institution: Institution;
  accountType: 'Bank' | 'E-Wallet';
  nickname?: string;
  initialBalance?: number;
}

export interface DemoAccountResult {
  account: Account;
  transactions: Transaction[];
}

// ==================== Constants ====================

// Sample transaction descriptions by category
const TRANSACTION_TEMPLATES = {
  Food: [
    { desc: 'Jollibee', range: [80, 350] },
    { desc: 'SM Supermarket', range: [500, 3000] },
    { desc: 'Grab Food', range: [150, 600] },
    { desc: 'McDonald\'s', range: [100, 400] },
    { desc: 'Puregold', range: [300, 2500] },
    { desc: '7-Eleven', range: [50, 200] },
  ],
  Transportation: [
    { desc: 'Grab Ride', range: [80, 400] },
    { desc: 'LRT/MRT Fare', range: [15, 60] },
    { desc: 'Shell Gas Station', range: [500, 2500] },
    { desc: 'Angkas', range: [50, 200] },
    { desc: 'Parking Fee', range: [30, 150] },
  ],
  Utilities: [
    { desc: 'Meralco Electric Bill', range: [1500, 5000] },
    { desc: 'Manila Water', range: [300, 800] },
    { desc: 'PLDT Home Fiber', range: [1299, 2499] },
    { desc: 'Globe Postpaid', range: [999, 2499] },
  ],
  Entertainment: [
    { desc: 'Netflix Subscription', range: [149, 549] },
    { desc: 'Spotify Premium', range: [129, 194] },
    { desc: 'SM Cinema', range: [250, 500] },
    { desc: 'Steam Games', range: [500, 2000] },
  ],
  Shopping: [
    { desc: 'Shopee', range: [200, 3000] },
    { desc: 'Lazada', range: [300, 5000] },
    { desc: 'Uniqlo', range: [500, 2500] },
    { desc: 'SM Department Store', range: [400, 3000] },
  ],
  Income: [
    { desc: 'Salary Deposit', range: [15000, 80000] },
    { desc: 'Freelance Payment', range: [5000, 25000] },
    { desc: 'Fund Transfer Received', range: [1000, 10000] },
    { desc: 'Cash Deposit', range: [500, 5000] },
  ],
  Other: [
    { desc: 'ATM Withdrawal', range: [500, 10000] },
    { desc: 'Fund Transfer', range: [500, 5000] },
    { desc: 'Bills Payment', range: [500, 3000] },
  ],
};

// Expense categories (weighted for realistic distribution)
const EXPENSE_CATEGORIES = [
  { name: 'Food', weight: 30 },
  { name: 'Transportation', weight: 20 },
  { name: 'Utilities', weight: 10 },
  { name: 'Entertainment', weight: 15 },
  { name: 'Shopping', weight: 15 },
  { name: 'Other', weight: 10 },
];

// ==================== Utility Functions ====================

/**
 * Generate a random number within a range
 */
function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate a random date within the last N days
 */
function randomDateInLastDays(days: number): Date {
  const now = new Date();
  const pastDate = new Date(now.getTime() - randomInRange(0, days) * 24 * 60 * 60 * 1000);
  // Add random hours for more realistic timestamps
  pastDate.setHours(randomInRange(6, 22), randomInRange(0, 59), 0, 0);
  return pastDate;
}

/**
 * Select a weighted random category
 */
function selectWeightedCategory(): string {
  const totalWeight = EXPENSE_CATEGORIES.reduce((sum, cat) => sum + cat.weight, 0);
  let random = Math.random() * totalWeight;
  
  for (const category of EXPENSE_CATEGORIES) {
    random -= category.weight;
    if (random <= 0) {
      return category.name;
    }
  }
  return 'Other';
}

/**
 * Generate a random transaction for a category
 */
function generateTransactionForCategory(
  category: string,
  accountId: string,
  date: Date,
  isIncome: boolean = false
): Omit<Transaction, 'id'> {
  const templates = TRANSACTION_TEMPLATES[category as keyof typeof TRANSACTION_TEMPLATES] || TRANSACTION_TEMPLATES.Other;
  const template = templates[randomInRange(0, templates.length - 1)];
  const amount = randomInRange(template.range[0], template.range[1]);
  
  return {
    date: date.toISOString().split('T')[0],
    description: template.desc,
    amount: amount,
    type: isIncome ? 'income' : 'expense',
    category: category,
    status: 'completed',
    accountId,
    isDemo: true,
    notes: 'Demo transaction - for demonstration purposes only',
  };
}

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Generate a realistic last 4 digits
 */
function generateLastFour(): string {
  return String(randomInRange(1000, 9999));
}

// ==================== Main Service Functions ====================

/**
 * Generate a demo account with realistic sample transactions
 */
export function generateDemoAccount(config: DemoAccountConfig): DemoAccountResult {
  const accountId = generateId();
  const now = new Date();
  
  // Determine base balance based on account type
  const baseBalance = config.initialBalance ?? (
    config.accountType === 'Bank' 
      ? randomInRange(15000, 150000) 
      : randomInRange(1000, 20000)
  );
  
  // Create the account
  const account: Account = {
    id: accountId,
    name: config.nickname || `${config.institution.short_name} Account`,
    type: config.accountType,
    balance: baseBalance,
    lastFour: generateLastFour(),
    institutionId: config.institution.id,
    institutionName: config.institution.short_name,
    institutionLogo: config.institution.logo,
    // Demo flags - clearly mark this as simulated
    isDemo: true,
    isManual: true,
    provider: 'demo' as AccountProvider,
    connectionStatus: 'simulated' as ConnectionStatus,
    nickname: config.nickname,
    createdAt: now.toISOString(),
  };
  
  // Generate sample transactions
  const transactions = generateSampleTransactions(accountId, 15, 30);
  
  return { account, transactions };
}

/**
 * Generate realistic sample transactions for a demo account
 */
export function generateSampleTransactions(
  accountId: string,
  count: number = 15,
  daysBack: number = 30
): Transaction[] {
  const transactions: Transaction[] = [];
  
  // Generate a mix of income and expenses
  // Typically 1-2 income transactions and the rest expenses
  const incomeCount = randomInRange(1, 3);
  const expenseCount = count - incomeCount;
  
  // Generate income transactions (salary, transfers, etc.)
  for (let i = 0; i < incomeCount; i++) {
    const date = randomDateInLastDays(daysBack);
    // Space out income - typically monthly salary or occasional transfers
    const transaction = generateTransactionForCategory('Income', accountId, date, true);
    transactions.push({
      ...transaction,
      id: generateId(),
    });
  }
  
  // Generate expense transactions with realistic category distribution
  for (let i = 0; i < expenseCount; i++) {
    const date = randomDateInLastDays(daysBack);
    const category = selectWeightedCategory();
    const transaction = generateTransactionForCategory(category, accountId, date, false);
    transactions.push({
      ...transaction,
      id: generateId(),
    });
  }
  
  // Sort by date (newest first)
  transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return transactions;
}

/**
 * Calculate a realistic balance based on transaction history
 */
export function calculateBalanceFromTransactions(
  initialBalance: number,
  transactions: Transaction[]
): number {
  return transactions.reduce((balance, txn) => {
    return txn.type === 'income' 
      ? balance + txn.amount 
      : balance - txn.amount;
  }, initialBalance);
}

// ==================== Local Storage Management ====================

const DEMO_ACCOUNTS_KEY = 'budgee_demo_accounts';
const DEMO_TRANSACTIONS_KEY = 'budgee_demo_transactions';

/**
 * Save demo account to local storage
 */
export function saveDemoAccount(account: Account): void {
  if (typeof window === 'undefined') return;
  
  const accounts = getDemoAccounts();
  const existingIndex = accounts.findIndex(a => a.id === account.id);
  
  if (existingIndex >= 0) {
    accounts[existingIndex] = account;
  } else {
    accounts.push(account);
  }
  
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
}

/**
 * Get all demo accounts from local storage
 */
export function getDemoAccounts(): Account[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(DEMO_ACCOUNTS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Delete a demo account from local storage
 */
export function deleteDemoAccount(accountId: string): void {
  if (typeof window === 'undefined') return;
  
  const accounts = getDemoAccounts().filter(a => a.id !== accountId);
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
  
  // Also delete associated transactions
  const transactions = getDemoTransactions().filter(t => t.accountId !== accountId);
  localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(transactions));
}

/**
 * Save demo transactions to local storage
 */
export function saveDemoTransactions(transactions: Transaction[]): void {
  if (typeof window === 'undefined') return;
  
  const existingTransactions = getDemoTransactions();
  const newTransactionIds = new Set(transactions.map(t => t.id));
  
  // Remove existing transactions with same IDs and add new ones
  const updatedTransactions = [
    ...existingTransactions.filter(t => !newTransactionIds.has(t.id)),
    ...transactions,
  ];
  
  localStorage.setItem(DEMO_TRANSACTIONS_KEY, JSON.stringify(updatedTransactions));
}

/**
 * Get all demo transactions from local storage
 */
export function getDemoTransactions(): Transaction[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(DEMO_TRANSACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

/**
 * Get demo transactions for a specific account
 */
export function getDemoTransactionsForAccount(accountId: string): Transaction[] {
  return getDemoTransactions().filter(t => t.accountId === accountId);
}

/**
 * Clear all demo data (useful for logout)
 */
export function clearAllDemoData(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(DEMO_ACCOUNTS_KEY);
  localStorage.removeItem(DEMO_TRANSACTIONS_KEY);
}

/**
 * Update demo account balance
 */
export function updateDemoAccountBalance(accountId: string, newBalance: number): void {
  const accounts = getDemoAccounts();
  const accountIndex = accounts.findIndex(a => a.id === accountId);
  
  if (accountIndex >= 0) {
    accounts[accountIndex].balance = newBalance;
    localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
  }
}

/**
 * Transfer between demo accounts (updates balances locally)
 */
export function transferBetweenDemoAccounts(
  fromAccountId: string,
  toAccountId: string,
  amount: number,
  description: string = 'Fund Transfer'
): { fromTransaction: Transaction; toTransaction: Transaction } | null {
  const accounts = getDemoAccounts();
  const fromAccount = accounts.find(a => a.id === fromAccountId);
  const toAccount = accounts.find(a => a.id === toAccountId);
  
  if (!fromAccount || !toAccount || fromAccount.balance < amount) {
    return null;
  }
  
  // Update balances
  fromAccount.balance -= amount;
  toAccount.balance += amount;
  
  // Save updated accounts
  localStorage.setItem(DEMO_ACCOUNTS_KEY, JSON.stringify(accounts));
  
  // Create transfer transactions
  const now = new Date().toISOString().split('T')[0];
  const transferId = generateId();
  
  const fromTransaction: Transaction = {
    id: `${transferId}_out`,
    date: now,
    description: `${description} to ${toAccount.name}`,
    amount: amount,
    type: 'expense',
    category: 'Other',
    status: 'completed',
    accountId: fromAccountId,
    isDemo: true,
    notes: 'Demo transfer - for demonstration purposes only',
  };
  
  const toTransaction: Transaction = {
    id: `${transferId}_in`,
    date: now,
    description: `${description} from ${fromAccount.name}`,
    amount: amount,
    type: 'income',
    category: 'Income',
    status: 'completed',
    accountId: toAccountId,
    isDemo: true,
    notes: 'Demo transfer - for demonstration purposes only',
  };
  
  // Save transactions
  saveDemoTransactions([fromTransaction, toTransaction]);
  
  return { fromTransaction, toTransaction };
}

// ==================== UX Copy ====================

export const DEMO_UX_COPY = {
  disclaimer: {
    title: 'Demo Mode',
    message: 'This bank connection is simulated for demonstration purposes only. No real bank data is accessed, connected, or stored.',
    continueButton: 'Continue',
    cancelButton: 'Cancel',
  },
  connecting: {
    title: 'Connecting to {bankName}...',
    subtitle: 'Establishing secure demo connection',
    steps: [
      'Initializing connection...',
      'Verifying demo credentials...',
      'Loading sample data...',
      'Almost there...',
    ],
  },
  success: {
    title: 'Demo Account Created',
    message: 'Your simulated {bankName} account is ready to explore.',
  },
  badges: {
    demo: 'Demo',
    simulated: 'Simulated',
  },
  tooltips: {
    demoBadge: 'This is a simulated account for demonstration purposes. No real bank data is involved.',
  },
  accountCard: {
    status: 'Simulated Account',
    noSync: 'Demo accounts do not sync with real banks',
  },
};
