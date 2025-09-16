export type ServerUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  password: string;
};

export type ServerAccount = {
  id: string;
  userId: string;
  name: string;
  type: 'Bank' | 'E-Wallet' | 'Crypto' | 'Cash';
  balance: number;
  lastFour: string;
};

export type ServerTransaction = {
  id: string;
  userId: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  status: 'pending' | 'completed' | 'failed';
  accountId: string;
  notes?: string;
};

export type ServerCategory = {
  id: string;
  userId: string;
  name: string;
  color: string;
  type: 'Income' | 'Expense';
  isDefault: boolean;
};

export type ServerBudget = {
  id: string;
  userId: string;
  category: string;
  monthlyLimit: number;
};

export type JwtPayload = {
  sub: string;
  email: string;
  iat: number;
  exp: number;
};


