import type { ServerAccount, ServerBudget, ServerCategory, ServerTransaction, ServerUser } from './types';

// Simple in-memory store. This will be replaced by Prisma later.
const users: ServerUser[] = [];
const accounts: ServerAccount[] = [];
const transactions: ServerTransaction[] = [];
const categories: ServerCategory[] = [];
const budgets: ServerBudget[] = [];

export const db = {
  users,
  accounts,
  transactions,
  categories,
  budgets,
};

export function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}


