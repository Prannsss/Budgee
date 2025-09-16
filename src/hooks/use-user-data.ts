"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
      const [txns, accts, summary] = await Promise.all([
        api('/api/transactions', { method: 'GET' }),
        api('/api/accounts', { method: 'GET' }),
        api('/api/reports/summary', { method: 'GET' }),
      ]);

      setTransactions(txns || []);
      setAccounts(accts || []);
      setTotals(summary?.totals || { totalIncome: 0, totalExpenses: 0, savings: 0 });
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
  }) => {
    if (!user?.id) return null;
    const created = await api('/api/transactions', { json: transactionData });
    window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    return created;
  };

  const removeTransaction = async (transactionId: string) => {
    if (!user?.id) return false;
    await api(`/api/transactions?id=${encodeURIComponent(transactionId)}`, { method: 'DELETE' });
    window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    return true;
  };

  const addAccount = async (accountData: {
    name: string;
    type: Account['type'];
    balance: number;
    lastFour: string;
  }) => {
    if (!user?.id) return null;
    const created = await api('/api/accounts', { json: accountData });
    window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    return created;
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