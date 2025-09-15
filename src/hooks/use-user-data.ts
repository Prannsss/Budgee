"use client";

import { useState, useEffect } from 'react';
import { TransactionService } from '@/lib/storage-service';
import { useAuth } from '@/contexts/auth-context';
import type { Transaction, Account } from '@/lib/types';

export function useUserData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpenses: 0, savings: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const refreshData = () => {
    if (!user?.id) {
      setTransactions([]);
      setAccounts([]);
      setTotals({ totalIncome: 0, totalExpenses: 0, savings: 0 });
      setIsLoading(false);
      return;
    }

    const userTransactions = TransactionService.getTransactions(user.id);
    const userAccounts = TransactionService.getAccounts(user.id);
    const userTotals = TransactionService.calculateTotals(user.id);

    setTransactions(userTransactions);
    setAccounts(userAccounts);
    setTotals(userTotals);
    setIsLoading(false);
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

  const addTransaction = (transactionData: {
    description: string;
    amount: number;
    category: Transaction['category'];
    accountId: string;
    date?: string;
  }) => {
    if (!user?.id) return null;
    
    const newTransaction = TransactionService.addTransaction(user.id, transactionData);
    
    // Update account balance if needed
    const account = accounts.find(a => a.id === transactionData.accountId);
    if (account) {
      TransactionService.updateAccount(user.id, transactionData.accountId, {
        balance: account.balance + transactionData.amount
      });
    }
    
    // Trigger refresh
    window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    
    return newTransaction;
  };

  const removeTransaction = (transactionId: string) => {
    if (!user?.id) return false;
    
    const success = TransactionService.removeTransaction(user.id, transactionId);
    
    if (success) {
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    }
    
    return success;
  };

  const addAccount = (accountData: {
    name: string;
    type: Account['type'];
    balance: number;
    lastFour: string;
  }) => {
    if (!user?.id) return null;
    
    const newAccount = TransactionService.addAccount(user.id, accountData);
    
    // Trigger refresh
    window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    
    return newAccount;
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