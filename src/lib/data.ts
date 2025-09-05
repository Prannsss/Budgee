import type { Account, Transaction } from './types';

export const mockTransactions: Transaction[] = [
  { id: '1', date: '2024-07-20', description: 'Salary', amount: 5000, category: 'Income', status: 'completed', accountId: '1' },
  { id: '2', date: '2024-07-19', description: 'Grocery Store', amount: -75.50, category: 'Food', status: 'completed', accountId: '1' },
  { id: '3', date: '2024-07-18', description: 'Monthly Rent', amount: -1500, category: 'Housing', status: 'completed', accountId: '2' },
  { id: '4', date: '2024-07-18', description: 'Gas Station', amount: -45.00, category: 'Transportation', status: 'pending', accountId: '1' },
  { id: '5', date: '2024-07-17', description: 'Movie Tickets', amount: -30.00, category: 'Entertainment', status: 'completed', accountId: '1' },
  { id: '6', date: '2024-07-16', description: 'Electricity Bill', amount: -120.00, category: 'Utilities', status: 'failed', accountId: '2' },
  { id: '7', date: '2024-07-15', description: 'Online Shopping', amount: -250.75, category: 'Other', status: 'completed', accountId: '3' },
  { id: '8', date: '2024-07-14', description: 'Restaurant', amount: -60.25, category: 'Food', status: 'completed', accountId: '3' },
  { id: '9', date: '2024-07-13', description: 'Public Transport', amount: -25.00, category: 'Transportation', status: 'completed', accountId: '1' },
  { id: '10', date: '2024-07-12', description: 'Freelance Project', amount: 750, category: 'Income', status: 'completed', accountId: '1' },
];

export const mockAccounts: Account[] = [
  { id: '1', name: 'LandBank', type: 'Bank', balance: 12540.50, lastFour: '1234' },
  { id: '2', name: 'BDO', type: 'Bank', balance: 50250.00, lastFour: '5678' },
  { id: '3', name: 'PayPal', type: 'E-Wallet', balance: 850.20, lastFour: '...ail' },
  { id: '4', name: 'Coinbase', type: 'Crypto', balance: 5300.80, lastFour: '...BTC' },
];

// Generate mock data for a provider connection
export function getMockProviderData(type: Account['type'], provider: string): { account: Account; transactions: Transaction[] } {
  const id = `${Date.now()}`;
  const balanceBase = type === 'Bank' ? 20000 : type === 'E-Wallet' ? 2000 : 8000;
  const balance = parseFloat((balanceBase + Math.random() * balanceBase).toFixed(2));
  const lastFour = type === 'Crypto' ? '...C' + Math.floor(Math.random() * 10) : ('' + Math.floor(1000 + Math.random() * 9000));

  const account: Account = {
    id,
    name: provider,
    type,
    balance,
    lastFour,
  };

  const sampleCats: Transaction['category'][] = ['Food','Transportation','Utilities','Entertainment','Other','Income'];
  const transactions: Transaction[] = Array.from({ length: 5 }).map((_, i) => {
    const amount = (i % 4 === 0) ? parseFloat((500 + Math.random() * 2500).toFixed(2)) : -parseFloat((50 + Math.random() * 800).toFixed(2));
    const category = amount > 0 ? 'Income' : sampleCats[(i + 1) % (sampleCats.length - 1)];
    return {
      id: `${id}-${i+1}`,
      date: new Date(Date.now() - i * 86400000).toISOString().slice(0,10),
      description: `${provider} ${amount > 0 ? 'Deposit' : 'Payment'}`,
      amount,
      category,
      status: 'completed',
      accountId: id,
    };
  });

  return { account, transactions };
}
