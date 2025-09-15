"use client";

import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { AddTransactionDialog } from "@/components/dashboard/add-transaction-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LineChart, Plus } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { TransactionService } from "@/lib/storage-service";
import { useAuth } from "@/contexts/auth-context";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendingDown, TrendingUp } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Transaction, Account } from "@/lib/types";

export default function DashboardPage() {
  const [showOverview, setShowOverview] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // State for dynamic data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpenses: 0, savings: 0 });

  // Load data when user changes or component mounts
  useEffect(() => {
    if (!user?.id) return;

    const loadData = () => {
      const userTransactions = TransactionService.getTransactions(user.id);
      const userAccounts = TransactionService.getAccounts(user.id);
      const userTotals = TransactionService.calculateTotals(user.id);

      setTransactions(userTransactions);
      setAccounts(userAccounts);
      setTotals(userTotals);
    };

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  // Calculate financial metrics
  const assets = useMemo(() => {
    return accounts.reduce((sum, a) => sum + (a.type !== 'Crypto' ? a.balance : 0), 0);
  }, [accounts]);

  const savings = useMemo(() => {
    return totals.savings;
  }, [totals]);

  const liabilities = 0; // For now, we don't have liabilities in our simple model
  const netWorth = assets + savings;

  const fmt = (n: number) =>
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n);
  return (
    <div className="flex flex-col gap-6">
      <Card className="shadow-lg bg-primary text-primary-foreground">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              size="icon"
              aria-pressed={!showAmounts}
              title={showAmounts ? "Hide amounts" : "Show amounts"}
              onClick={() => setShowAmounts(v => !v)}
              className="text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground"
            >
              {showAmounts ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
            </Button>
            <div className="text-center">
              <p className="text-sm text-primary-foreground/80">Net Worth</p>
              <p className="text-3xl font-bold tracking-tight">
                {showAmounts ? fmt(netWorth) : "••••••"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              aria-pressed={showOverview}
              title={showOverview ? "Hide Overview" : "Show Overview"}
              onClick={() => setShowOverview((v) => !v)}
              className={`text-primary-foreground/80 hover:bg-white/10 hover:text-primary-foreground ${showOverview ? "bg-white/10 text-primary-foreground" : ""}`}
            >
              <LineChart className="h-5 w-5" />
            </Button>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center text-sm mt-6">
            <div>
              <p className="text-primary-foreground/80">Assets</p>
              <p className="font-semibold">{showAmounts ? fmt(assets) : "••••"}</p>
            </div>
            <div>
              <p className="text-primary-foreground/80">Savings</p>
              <p className="font-semibold">{showAmounts ? fmt(savings) : "••••"}</p>
            </div>
            <div>
              <p className="text-primary-foreground/80">Liabilities</p>
              <p className="font-semibold">{showAmounts ? fmt(liabilities) : "••••"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly income/expenses cards */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Quick Stats</h2>
        {!isMobile && <AddTransactionDialog />}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {(() => {
          const now = new Date();
          const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const monthly = transactions.filter((t: Transaction) => t.date.startsWith(ym));
          const income = monthly.filter((t: Transaction) => t.amount > 0).reduce((s: number, t: Transaction) => s + t.amount, 0);
          const expenses = monthly.filter((t: Transaction) => t.amount < 0).reduce((s: number, t: Transaction) => s + Math.abs(t.amount), 0);
          return (
            <>
              <StatCard
                title="This Month"
                value={fmt(income)}
                description="Income"
                icon={<TrendingUp className="h-5 w-5 text-green-500" />}
              />
              <StatCard
                title="This Month"
                value={fmt(expenses)}
                description="Expenses"
                icon={<TrendingDown className="h-5 w-5 text-red-500" />}
              />
            </>
          );
        })()}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-3 flex flex-col gap-6">
          {showOverview && <OverviewChart />}
          <RecentTransactions />
        </div>
      </div>

      {/* Mobile Floating Action Button */}
      {isMobile && (
        <AddTransactionDialog 
          trigger={
            <Button
              size="icon"
              className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
            >
              <Plus className="h-6 w-6" />
            </Button>
          }
        />
      )}
    </div>
  );
}
