export type Category = {
  id: string;
  name: string;
  color: string;
  type: 'Income' | 'Expense';
  userId: string;
  isDefault: boolean;
};

export type Transaction = {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string; // Now stores category name dynamically
  status: 'pending' | 'completed' | 'failed';
  accountId: string; // references Account.id
  notes?: string; // Optional notes field
};

export type Account = {
  id: string;
  name: string;
  type: 'Bank' | 'E-Wallet' | 'Crypto' | 'Cash';
  balance: number;
  lastFour: string;
};

export type PlanType = 'Free' | 'Basic' | 'Premium';

export type Subscription = {
  id: string;
  userId: string;
  planType: PlanType;
  startDate: string;
  nextBillingDate?: string;
  status: 'active' | 'cancelled' | 'expired';
  features: string[];
};

export type NavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
  disabled?: boolean;
};
