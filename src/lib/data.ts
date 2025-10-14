import type { Account, Transaction } from './types';

export const mockTransactions: Transaction[] = [];

export const mockAccounts: Account[] = [];

// Generate mock data for a provider connection
export function getMockProviderData(type: Account['type'], provider: string): { account: Account; transactions: Transaction[] } {
  const id = `${Date.now()}`;
  const balanceBase = type === 'Bank' ? 20000 : type === 'E-Wallet' ? 2000 : 1000;
  const balance = parseFloat((balanceBase + Math.random() * balanceBase).toFixed(2));
  const lastFour = ('' + Math.floor(1000 + Math.random() * 9000));

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
