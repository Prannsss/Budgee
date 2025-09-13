export type Category = {
  id: number;
  name: string;
  color: string;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: 'Income' | 'Housing' | 'Food' | 'Transportation' | 'Entertainment' | 'Utilities' | 'Other';
  status: 'pending' | 'completed' | 'failed';
  accountId: string; // references Account.id
};

export type Account = {
  id: string;
  name: string;
  type: 'Bank' | 'E-Wallet' | 'Crypto';
  balance: number;
  lastFour: string;
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
};
