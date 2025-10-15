"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { API } from "@/lib/api-service";
import type { SavingsAllocation, Account } from "@/lib/types";

export function SavingsHistory() {
  const [savingsAllocations, setSavingsAllocations] = useState<SavingsAllocation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      try {
        const [allocations, userAccounts] = await Promise.all([
          API.savingsAllocations.getAll({ limit: 5 }), // Get last 5 allocations
          API.accounts.getAll(),
        ]);
        
        // Sort by date descending (most recent first)
        const sortedAllocations = allocations.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setSavingsAllocations(sortedAllocations.slice(0, 5)); // Show last 5
        // Ensure accounts is an array
        setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
      } catch (error) {
        console.error('Error loading savings data:', error);
        setSavingsAllocations([]);
        setAccounts([]);
      }
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
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <PiggyBank className="h-5 w-5" />
              Recent Savings Activity
            </CardTitle>
            <Link href="/dashboard/savings">
              <Button variant="ghost" size="sm">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
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
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Recent Savings Activity
          </CardTitle>
          <Link href="/dashboard/savings">
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
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