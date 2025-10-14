
"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { API } from "@/lib/api-service"
import type { Transaction } from "@/lib/types"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { SkeletonBarChart } from "@/components/ui/skeleton-components"

const chartConfig = {
    income: {
        label: "Income",
        color: "hsl(var(--primary))",
    },
    expenses: {
        label: "Expenses",
        color: "hsl(var(--destructive))",
    },
}

export function OverviewChart() {
  const { user } = useAuth();
  const [chartData, setChartData] = useState<Array<{name: string, income: number, expenses: number}>>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const generateChartData = async () => {
      setIsLoading(true);
      
      try {
        const transactions = await API.transactions.getAll();
        const currentDate = new Date();
        const data = [];

        // Generate data for the last 6 months
        for (let i = 5; i >= 0; i--) {
          const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
          const monthStr = `${monthDate.getFullYear()}-${String(monthDate.getMonth() + 1).padStart(2, '0')}`;
          const monthName = monthDate.toLocaleDateString('en-US', { month: 'short' });

          const monthTransactions = transactions.filter((t: Transaction) => t.date.startsWith(monthStr));
          const income = monthTransactions
            .filter((t: Transaction) => t.amount > 0)
            .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0);
          const expenses = Math.abs(monthTransactions
            .filter((t: Transaction) => t.amount < 0)
            .reduce((sum: number, t: Transaction) => sum + (Number(t.amount) || 0), 0));

          data.push({
            name: monthName,
            income: Math.round(Number(income) || 0),
            expenses: Math.round(Number(expenses) || 0)
          });
        }

        setChartData(data);
      } catch (error) {
        console.error('Error generating chart data:', error);
        setChartData([]);
      } finally {
        setIsLoading(false);
      }
    };

    generateChartData();

    // Listen for data updates
    const handleDataUpdate = () => generateChartData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Your income and expenses over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <SkeletonBarChart bars={6} height="h-64" />
        ) : chartData.length === 0 || chartData.every(d => d.income === 0 && d.expenses === 0) ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground">No transaction data available.</p>
            <p className="text-sm text-muted-foreground mt-1">Add transactions to see your income and expense trends.</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="min-h-[350px] w-full">
              <BarChart accessibilityLayer data={chartData}>
                  <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  />
                  <YAxis
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `₱${value / 1000}k`}
                  />
                  <ChartTooltip
                  cursor={{ fill: 'hsl(var(--accent) / 0.2)' }}
                  content={<ChartTooltipContent />}
                  />
                  <Bar dataKey="income" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
              </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}
