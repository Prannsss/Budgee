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
import { mockTransactions, mockAccounts } from "@/lib/data"
import { cn } from "@/lib/utils"

export function RecentTransactions() {
  const transactions = mockTransactions.slice(0, 5);

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your 5 most recent transactions.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    const acct = mockAccounts.find(a => a.id === transaction.accountId)
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
                <TableCell className={cn("text-right", transaction.amount > 0 ? "text-green-600" : "text-destructive")}>
                  {transaction.amount > 0 ? 
                    `+${new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(transaction.amount)}` :
                    new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(transaction.amount)
                  }
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
      <CardFooter>
        <div className="text-xs text-muted-foreground">
          Showing <strong>1-5</strong> of <strong>{mockTransactions.length}</strong> transactions
        </div>
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
