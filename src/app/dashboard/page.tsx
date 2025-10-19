"use client";

import dynamic from "next/dynamic";
import { Suspense } from "react";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LineChart, Plus, PiggyBank, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState, useEffect, useCallback } from "react";
import { API } from "@/lib/api-service";
import { useAuth } from "@/contexts/auth-context";
import { StatCard } from "@/components/dashboard/stat-card";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Transaction, Account } from "@/lib/types";
import { SkeletonStatCard, SkeletonChart } from "@/components/ui/skeleton-components";

// Dynamic imports for heavy components
const OverviewChart = dynamic(
  () => import("@/components/dashboard/overview-chart").then(mod => ({ default: mod.OverviewChart })),
  { 
    loading: () => <SkeletonChart height="h-64" className="rounded-lg" />,
    ssr: false 
  }
);

const AddTransactionDialog = dynamic(
  () => import("@/components/dashboard/add-transaction-dialog").then(mod => ({ default: mod.AddTransactionDialog })),
  { 
    loading: () => <div className="h-10 w-10 animate-pulse bg-muted rounded" />,
    ssr: false 
  }
);

const SavingsAllocationDialog = dynamic(
  () => import("@/components/dashboard/savings-allocation-dialog").then(mod => ({ default: mod.SavingsAllocationDialog })),
  { 
    loading: () => <div className="h-10 w-10 animate-pulse bg-muted rounded" />,
    ssr: false 
  }
);

const SavingsHistory = dynamic(
  () => import("@/components/dashboard/savings-history").then(mod => ({ default: mod.SavingsHistory })),
  { 
    loading: () => <SkeletonChart height="h-40" className="rounded-lg" />,
    ssr: false 
  }
);

export default function DashboardPage() {
  const [showOverview, setShowOverview] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const isMobile = useIsMobile();
  const { user } = useAuth();

  // State for dynamic data
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totals, setTotals] = useState({ totalIncome: 0, totalExpenses: 0, savings: 0 });

  // Load data when user changes or component mounts
  useEffect(() => {
    if (!user?.id) return;

    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const [userTransactions, userAccounts, dashboardStats] = await Promise.all([
          API.transactions.getAll(),
          API.accounts.getAll(),
          API.dashboard.getSummary()
        ]);

        if (isMounted) {
          setTransactions(Array.isArray(userTransactions) ? userTransactions : []);
          setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
          setTotals({
            totalIncome: Number(dashboardStats?.totalIncome) || 0,
            totalExpenses: Number(dashboardStats?.totalExpenses) || 0,
            savings: Number(dashboardStats?.savings) || 0,
          });
        }
      } catch (error: any) {
        // Silently handle auth errors (user is being logged out)
        if (error?.message?.includes('Unauthorized')) {
          console.log('User session expired - logout in progress');
          return;
        }
        
        console.error('Error loading dashboard data:', error);
        // Set empty defaults on error
        if (isMounted) {
          setTransactions([]);
          setAccounts([]);
          setTotals({ totalIncome: 0, totalExpenses: 0, savings: 0 });
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      isMounted = false;
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  // Calculate financial metrics with memoization
  const assets = useMemo(() => {
    if (!Array.isArray(accounts)) return 0;
    return accounts.reduce((sum, a) => sum + (Number(a.balance) || 0), 0);
  }, [accounts]);

  const savings = useMemo(() => {
    return Number(totals?.savings) || 0;
  }, [totals]);

  const netWorth = useMemo(() => {
    const assetsValue = Number(assets) || 0;
    const savingsValue = Number(savings) || 0;
    return assetsValue + savingsValue;
  }, [assets, savings]);
  
  // For now, we don't have liabilities in our simple model
  const liabilities = 0;

  // Memoized currency formatter
  const formatter = useMemo(() => 
    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }),
    []
  );
  
  const fmt = useCallback((n: number) => {
    const safeNumber = Number(n) || 0;
    return formatter.format(safeNumber);
  }, [formatter]);
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
        {!isMobile && (
          <div className="flex gap-2">
            <SavingsAllocationDialog />
            <AddTransactionDialog />
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {isLoading ? (
          <>
            <SkeletonStatCard />
            <SkeletonStatCard />
          </>
        ) : (
          (() => {
            const now = new Date();
            const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
            const monthly = transactions.filter((t: Transaction) => t.date.startsWith(ym));
            const income = monthly.filter((t: Transaction) => t.type === 'income').reduce((s: number, t: Transaction) => s + (Number(t.amount) || 0), 0);
            const expenses = monthly.filter((t: Transaction) => t.type === 'expense').reduce((s: number, t: Transaction) => s + (Number(t.amount) || 0), 0);
            return (
              <>
                <StatCard
                  title="This Month"
                  value={fmt(income)}
                  description="Income"
                  icon={<TrendingUp className="h-5 w-5 text-green-500" />}
                  variant="income"
                />
                <StatCard
                  title="This Month"
                  value={fmt(expenses)}
                  description="Expenses"
                  icon={<TrendingDown className="h-5 w-5 text-red-500" />}
                  variant="expense"
                />
              </>
            );
          })()
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          {showOverview && (
            <Suspense fallback={<SkeletonChart height="h-64" className="rounded-lg" />}>
              <OverviewChart />
            </Suspense>
          )}
          <RecentTransactions />
        </div>
        <div className="lg:col-span-1">
          <SavingsHistory />
        </div>
      </div>

      {/* Mobile Floating Action Buttons */}
      {isMobile && (
        <div className="fixed bottom-24 right-4 z-50 flex flex-col gap-3">
          <SavingsAllocationDialog 
            trigger={
              <Button
                size="icon"
                variant="secondary"
                className="h-12 w-12 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <PiggyBank className="h-5 w-5" />
              </Button>
            }
          />
          <AddTransactionDialog 
            trigger={
              <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                <Plus className="h-6 w-6" />
              </Button>
            }
          />
        </div>
      )}
    </div>
  );
}
