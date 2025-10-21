"use client";

import { useState, useEffect } from 'react';
import { API } from '@/lib/api-service';
import { useAuth } from '@/contexts/auth-context';
import type { Transaction, Account } from '@/lib/types';

export function useUserData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpenses: 0, savings: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = async () => {
    if (!user?.id) {
      setTransactions([]);
      setAccounts([]);
      setTotals({ totalIncome: 0, totalExpenses: 0, savings: 0 });
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const [userTransactions, userAccounts, dashboardStats] = await Promise.all([
        API.transactions.getAll(),
        API.accounts.getAll(),
        API.dashboard.getSummary(),
      ]);

      setTransactions(Array.isArray(userTransactions) ? userTransactions : []);
      setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
      setTotals({
        totalIncome: Number(dashboardStats?.totalIncome) || 0,
        totalExpenses: Number(dashboardStats?.totalExpenses) || 0,
        savings: Number(dashboardStats?.savings) || 0,
      });
    } catch (error) {
      console.error('Error fetching user data:', error);
      setTransactions([]);
      setAccounts([]);
      setTotals({ totalIncome: 0, totalExpenses: 0, savings: 0 });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshData();

    // Listen for data updates
    const handleDataUpdate = () => refreshData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  const addTransaction = async (transactionData: {
    description: string;
    amount: number;
    category: Transaction['category'];
    accountId: string;
    date?: string;
    notes?: string;
  }) => {
    if (!user?.id) return null;
    
    try {
      // First, we need to find the category ID from the category name
      // For now, we'll use a placeholder - in a real implementation, you'd fetch categories first
      const categories = await API.categories.getAll();
      const category = categories.find(cat => cat.name === transactionData.category);
      
      if (!category) {
        console.error('Category not found:', transactionData.category);
        return null;
      }

      const newTransaction = await API.transactions.create({
        description: transactionData.description,
        amount: transactionData.amount,
        category_id: Number(category.id),
        account_id: Number(transactionData.accountId),
        type: category.type === 'Income' ? 'income' : 'expense',
        date: transactionData.date || new Date().toISOString(),
        notes: transactionData.notes,
      });
      
      // Trigger refresh to get updated data
      await refreshData();
      
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  };

  const removeTransaction = async (transactionId: string) => {
    if (!user?.id) return false;
    
    try {
      await API.transactions.delete(transactionId);
      
      // Trigger refresh
      await refreshData();
      
      return true;
    } catch (error) {
      console.error('Error removing transaction:', error);
      return false;
    }
  };

  const addAccount = async (accountData: {
    name: string;
    type: Account['type'];
    balance: number;
    lastFour?: string;
  }) => {
    if (!user?.id) return null;
    
    try {
      const newAccount = await API.accounts.create({
        name: accountData.name,
        type: accountData.type,
        balance: accountData.balance,
        lastFour: accountData.lastFour || '',
      });
      
      // Trigger refresh
      await refreshData();
      
      return newAccount;
    } catch (error) {
      console.error('Error adding account:', error);
      return null;
    }
  };

  return {
    transactions,
    accounts,
    totals,
    isLoading,
    addTransaction,
    removeTransaction,
    addAccount,
    refreshData,
  };
}