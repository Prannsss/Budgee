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

export type SavingsAllocation = {
  id: string;
  userId: string;
  amount: number;
  description: string;
  date: string;
  fromAccountId: string; // Account money is moved from
  type: 'deposit' | 'withdrawal'; // deposit to savings or withdrawal from savings
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

export type PinData = {
  userId: string;
  hashedPin: string;
  isEnabled: boolean;
  createdAt: string;
  lastUsed?: string;
};

export type PinStatus = 'not-set' | 'set' | 'required' | 'verified';

export type AppLockState = {
  isLocked: boolean;
  lockTriggeredAt?: string;
  shouldRequirePin: boolean;
};
