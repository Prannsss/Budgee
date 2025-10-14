export type Category = {
  id: string;
  name: string;
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
  type: 'Bank' | 'E-Wallet' | 'Cash';
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
  pinLength?: number; // Store the length of the PIN for better UX
};

export type PinStatus = 'not-set' | 'set' | 'required' | 'verified';

export type AppLockState = {
  isLocked: boolean;
  lockTriggeredAt?: string;
  shouldRequirePin: boolean;
};

// Additional types for backend integration
export type User = {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  lastName?: string;
  isEmailVerified: boolean;
  planId: string;
  plan?: Plan;
  createdAt: string;
  updatedAt: string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  maxWallets: number;
  maxAccounts: number;
  aiEnabled: boolean;
  adsEnabled: boolean;
  description?: string;
  features: string[];
};

export type SavingsGoal = {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ActivityLog = {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
};

export type OTP = {
  id: string;
  userId: string;
  code: string;
  purpose: 'email-verification' | 'password-reset' | 'login';
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
};
