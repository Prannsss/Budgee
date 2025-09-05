"use client";

import { OverviewChart } from "@/components/dashboard/overview-chart";
import { RecentTransactions } from "@/components/dashboard/recent-transactions";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, LineChart } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { mockAccounts } from "@/lib/data";
import { mockTransactions } from "@/lib/data";
import { StatCard } from "@/components/dashboard/stat-card";
import { TrendingDown, TrendingUp } from "lucide-react";

export default function DashboardPage() {
  const [showOverview, setShowOverview] = useState(false);
  const [showAmounts, setShowAmounts] = useState(true);

  const [assets, setAssets] = useState<number>(() => mockAccounts.reduce((sum, a) => sum + (a.type !== 'Crypto' ? a.balance : 0), 0));
  const [savings, setSavings] = useState<number>(() => {
    const acct = mockAccounts.find(a => a.name === "BDO");
    return acct?.balance ?? 0;
  });
  const liabilities = 5271.0;
  const netWorth = assets - liabilities;

  useEffect(() => {
    const handle = () => {
      const newAssets = mockAccounts.reduce((sum, a) => sum + (a.type !== 'Crypto' ? a.balance : 0), 0);
      setAssets(newAssets);
  const acct = mockAccounts.find(a => a.name === "BDO");
      setSavings(acct?.balance ?? 0);
    };
    window.addEventListener('accounts:updated', handle);
    return () => window.removeEventListener('accounts:updated', handle);
  }, []);

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
  <div className="grid grid-cols-2 gap-4">
        {(() => {
          const now = new Date();
          const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
          const monthly = mockTransactions.filter(t => t.date.startsWith(ym));
          const income = monthly.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
          const expenses = monthly.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
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
    </div>
  );
}
