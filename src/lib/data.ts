import type { Account, Transaction } from './types';

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-20', description: 'Salary', amount: 5000, category: 'Income', status: 'completed' },
  { id: '2', date: '2024-07-19', description: 'Grocery Store', amount: -75.50, category: 'Food', status: 'completed' },
  { id: '3', date: '2024-07-18', description: 'Monthly Rent', amount: -1500, category: 'Housing', status: 'completed' },
  { id: '4', date: '2024-07-18', description: 'Gas Station', amount: -45.00, category: 'Transportation', status: 'pending' },
  { id: '5', date: '2024-07-17', description: 'Movie Tickets', amount: -30.00, category: 'Entertainment', status: 'completed' },
  { id: '6', date: '2024-07-16', description: 'Electricity Bill', amount: -120.00, category: 'Utilities', status: 'failed' },
  { id: '7', date: '2024-07-15', description: 'Online Shopping', amount: -250.75, category: 'Other', status: 'completed' },
  { id: '8', date: '2024-07-14', description: 'Restaurant', amount: -60.25, category: 'Food', status: 'completed' },
  { id: '9', date: '2024-07-13', description: 'Public Transport', amount: -25.00, category: 'Transportation', status: 'completed' },
  { id: '10', date: '2024-07-12', description: 'Freelance Project', amount: 750, category: 'Income', status: 'completed' },
];

export const mockAccounts: Account[] = [
  { id: '1', name: 'Main Checking', type: 'Bank', balance: 12540.50, lastFour: '1234' },
  { id: '2', name: 'Savings Account', type: 'Bank', balance: 50250.00, lastFour: '5678' },
  { id: '3', name: 'PayPal', type: 'E-Wallet', balance: 850.20, lastFour: '...ail' },
  { id: '4', name: 'Coinbase', type: 'Crypto', balance: 5300.80, lastFour: '...BTC' },
];
