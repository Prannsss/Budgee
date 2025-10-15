"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "../ui/button"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { API } from "@/lib/api-service"
import { useAuth } from "@/contexts/auth-context"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import type { Transaction, Account } from "@/lib/types"
import { SkeletonTransactionRow } from "@/components/ui/skeleton-components"

export function RecentTransactions() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      
      try {
        const [userTransactions, userAccounts] = await Promise.all([
          API.transactions.getAll({ limit: 5 }),
          API.accounts.getAll()
        ]);
        
        setTransactions(Array.isArray(userTransactions) ? userTransactions : []);
        setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
      } catch (error) {
        console.error('Error loading recent transactions:', error);
        setTransactions([]);
        setAccounts([]);
      } finally {
        setIsLoading(false);
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

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your 5 most recent transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Bank/E-wallet</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonTransactionRow key={i} />
              ))}
            </TableBody>
          </Table>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No transactions yet.</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first transaction to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Description</TableHead>
                <TableHead className="hidden sm:table-cell">Bank/E-wallet</TableHead>
                <TableHead className="hidden sm:table-cell">Category</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map(transaction => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <div className="font-medium">{transaction.description}</div>
                    <div className="text-sm text-muted-foreground md:hidden">{transaction.date}</div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {(() => {
                      const acct = accounts.find((a: Account) => a.id === transaction.accountId)
                      if (!acct) return <span className="text-muted-foreground">—</span>
                      return (
                        <div className="flex flex-col">
                          <span className="font-medium">{acct.name}</span>
                          <span className="text-xs text-muted-foreground">{acct.type}</span>
                        </div>
                      )
                    })()}
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{transaction.category}</TableCell>
                  <TableCell className={cn("text-right", transaction.type === 'income' ? "text-green-600" : "text-destructive")}>
                    {transaction.type === 'income' ? 
                      `+${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(transaction.amount)}` :
                      `-${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(transaction.amount)}`
                    }
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
      <CardFooter>
        {transactions.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Showing <strong>1-{Math.min(5, transactions.length)}</strong> of <strong>{transactions.length}</strong> transactions
          </div>
        )}
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="/dashboard/transactions">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
