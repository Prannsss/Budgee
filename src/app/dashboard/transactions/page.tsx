import { mockTransactions } from "@/lib/data";
import { DataTable } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";

export default function TransactionsPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight font-headline">Transactions</h1>
                <p className="text-muted-foreground">
                    View and manage all your financial transactions.
                </p>
            </div>
            <DataTable columns={columns} data={mockTransactions} />
        </div>
    )
}
