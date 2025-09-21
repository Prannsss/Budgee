"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpCircle, ArrowDownCircle, PiggyBank } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { TransactionService } from "@/lib/storage-service";
import type { SavingsAllocation, Account } from "@/lib/types";

export function SavingsHistory() {
  const [savingsAllocations, setSavingsAllocations] = useState<SavingsAllocation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const loadData = () => {
      const allocations = TransactionService.getSavingsAllocations(user.id);
      const userAccounts = TransactionService.getAccounts(user.id);
      
      // Sort by date descending (most recent first)
      const sortedAllocations = allocations.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setSavingsAllocations(sortedAllocations.slice(0, 5)); // Show last 5
      setAccounts(userAccounts);
    };

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { 
      style: "currency", 
      currency: "PHP" 
    }).format(amount);
  };

  if (savingsAllocations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Recent Savings Activity
          </CardTitle>
          <CardDescription>
            Your recent savings deposits and withdrawals will appear here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <PiggyBank className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No savings activity yet</p>
            <p className="text-sm">Start building your savings by making a deposit!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PiggyBank className="h-5 w-5" />
          Recent Savings Activity
        </CardTitle>
        <CardDescription>
          Your latest savings deposits and withdrawals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {savingsAllocations.map((allocation) => (
            <div
              key={allocation.id}
              className="flex items-center justify-between p-3 rounded-lg border bg-card"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  allocation.type === 'deposit' 
                    ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
                    : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                }`}>
                  {allocation.type === 'deposit' ? (
                    <ArrowUpCircle className="h-4 w-4" />
                  ) : (
                    <ArrowDownCircle className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <p className="font-medium">{allocation.description}</p>
                  <p className="text-sm text-muted-foreground">
                    From {getAccountName(allocation.fromAccountId)} • {new Date(allocation.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-semibold ${
                  allocation.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
                }`}>
                  {allocation.type === 'deposit' ? '+' : '-'}{formatCurrency(allocation.amount)}
                </p>
                <Badge variant="outline" className="text-xs">
                  {allocation.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}