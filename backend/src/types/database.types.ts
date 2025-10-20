/**
 * Supabase Database Type Definitions
 * Generated type-safe interfaces for all database tables
 */

export interface Database {
  public: {
    Tables: {
      plans: {
        Row: Plan;
        Insert: PlanInsert;
        Update: PlanUpdate;
      };
      users: {
        Row: User;
        Insert: UserInsert;
        Update: UserUpdate;
      };
      accounts: {
        Row: Account;
        Insert: AccountInsert;
        Update: AccountUpdate;
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
      };
      transactions: {
        Row: Transaction;
        Insert: TransactionInsert;
        Update: TransactionUpdate;
      };
      otps: {
        Row: OTP;
        Insert: OTPInsert;
        Update: OTPUpdate;
      };
      activity_logs: {
        Row: ActivityLog;
        Insert: ActivityLogInsert;
        Update: ActivityLogUpdate;
      };
      savings_allocations: {
        Row: SavingsAllocation;
        Insert: SavingsAllocationInsert;
        Update: SavingsAllocationUpdate;
      };
      user_pins: {
        Row: UserPin;
        Insert: UserPinInsert;
        Update: UserPinUpdate;
      };
      spending_limits: {
        Row: SpendingLimit;
        Insert: SpendingLimitInsert;
        Update: SpendingLimitUpdate;
      };
      institutions: {
        Row: Institution;
        Insert: InstitutionInsert;
        Update: InstitutionUpdate;
      };
    };
  };
}

// ================================================
// Plan Types
// ================================================
export interface Plan {
  id: number;
  name: string;
  price: number;
  max_wallets: number;
  max_accounts: number;
  ai_enabled: boolean;
  ads_enabled: boolean;
  description: string | null;
  features: string[] | null;
  created_at: string;
  updated_at: string;
}

export type PlanInsert = Omit<Plan, 'id' | 'created_at' | 'updated_at'>;
export type PlanUpdate = Partial<PlanInsert>;

// ================================================
// User Types
// ================================================
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  password_hash: string;
  plan_id: number;
  avatar_url: string | null;
  email_verified: boolean;
  phone_verified: boolean;
  is_active: boolean;
  oauth_provider: string | null;
  oauth_id: string | null;
  last_login: string | null;
  created_at: string;
  updated_at: string;
}

export type UserInsert = Omit<User, 'id' | 'created_at' | 'updated_at'> & {
  plan_id?: number;
  email_verified?: boolean;
  phone_verified?: boolean;
  is_active?: boolean;
};
export type UserUpdate = Partial<UserInsert>;

// ================================================
// Account Types
// ================================================
export interface Account {
  id: number;
  user_id: number;
  institution_id: number | null;
  name: string;
  type: 'Cash' | 'Bank' | 'E-Wallet';
  account_number: string | null;
  balance: number;
  verified: boolean;
  logo_url: string | null;
  is_manual: boolean;
  is_active: boolean;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type AccountInsert = Omit<Account, 'id' | 'created_at' | 'updated_at'> & {
  balance?: number;
  verified?: boolean;
  is_manual?: boolean;
  is_active?: boolean;
};
export type AccountUpdate = Partial<AccountInsert>;

// ================================================
// Category Types
// ================================================
export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  is_default: boolean;
  parent_id: number | null;
  created_at: string;
  updated_at: string;
}

export type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'> & {
  is_default?: boolean;
};
export type CategoryUpdate = Partial<CategoryInsert>;

// ================================================
// Transaction Types
// ================================================
export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id: number | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  notes: string | null;
  receipt_url: string | null;
  status: 'pending' | 'completed' | 'failed';
  recurring_frequency: string | null;
  recurring_parent_id: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export type TransactionInsert = Omit<Transaction, 'id' | 'created_at' | 'updated_at'> & {
  status?: 'pending' | 'completed' | 'failed';
};
export type TransactionUpdate = Partial<TransactionInsert>;

// ================================================
// OTP Types
// ================================================
export interface OTP {
  id: number;
  user_id: number;
  code: string;
  purpose: string;
  expires_at: string;
  is_verified: boolean;
  attempts: number;
  max_attempts: number;
  created_at: string;
}

export type OTPInsert = Omit<OTP, 'id' | 'created_at'> & {
  is_verified?: boolean;
  attempts?: number;
  max_attempts?: number;
};
export type OTPUpdate = Partial<Omit<OTPInsert, 'user_id' | 'code'>>;

// ================================================
// Activity Log Types
// ================================================
export interface ActivityLog {
  id: number;
  user_id: number;
  action: string;
  description: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

export type ActivityLogInsert = Omit<ActivityLog, 'id' | 'created_at'>;
export type ActivityLogUpdate = never; // Activity logs are typically not updated

// ================================================
// Savings Allocation Types
// ================================================
export interface SavingsAllocation {
  id: number;
  user_id: number;
  account_id: number;
  amount: number;
  type: 'deposit' | 'withdrawal';
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
}

export type SavingsAllocationInsert = Omit<SavingsAllocation, 'id' | 'created_at' | 'updated_at'>;
export type SavingsAllocationUpdate = Partial<SavingsAllocationInsert>;

// ================================================
// User Pin Types
// ================================================
export interface UserPin {
  id: number;
  user_id: number;
  pin_hash: string;
  is_enabled: boolean;
  failed_attempts: number;
  locked_until: string | null;
  last_used: string | null;
  created_at: string;
  updated_at: string;
}

export type UserPinInsert = Omit<UserPin, 'id' | 'created_at' | 'updated_at'> & {
  is_enabled?: boolean;
  failed_attempts?: number;
};
export type UserPinUpdate = Partial<UserPinInsert>;

// ================================================
// Spending Limit Types
// ================================================
export interface SpendingLimit {
  id: number;
  user_id: number;
  type: 'Daily' | 'Weekly' | 'Monthly';
  amount: number;
  current_spending: number;
  last_reset: string;
  created_at: string;
  updated_at: string;
}

export type SpendingLimitInsert = {
  user_id: number;
  type: 'Daily' | 'Weekly' | 'Monthly';
  amount: number;
  current_spending?: number;
  last_reset?: string;
};
export type SpendingLimitUpdate = Partial<SpendingLimitInsert>;

// ================================================
// Institution Types
// ================================================
export interface Institution {
  id: number;
  name: string;
  type: 'bank' | 'e-wallet' | 'credit' | 'others';
  country: string;
  logo_url: string | null;
  is_supported: boolean;
  created_at: string;
}

export type InstitutionInsert = Omit<Institution, 'id' | 'created_at'> & {
  country?: string;
  is_supported?: boolean;
};
export type InstitutionUpdate = Partial<InstitutionInsert>;

// ================================================
// Helper Types for Joins
// ================================================
export interface UserWithPlan extends User {
  plan?: Plan;
}

export interface TransactionWithRelations extends Transaction {
  account?: Account;
  category?: Category;
  user?: User;
}

export interface AccountWithInstitution extends Account {
  institution?: Institution;
}
