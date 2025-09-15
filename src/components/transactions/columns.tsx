"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Transaction, Account } from "@/lib/types"
import { ArrowUpDown, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { Checkbox } from "../ui/checkbox"

export function createColumns(accounts: Account[]): ColumnDef<Transaction>[] {
  return [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => {
        const transaction = row.original;
        return (
          <div className="flex flex-col">
            <span className="font-medium">{transaction.description}</span>
            {transaction.notes && (
              <span className="text-xs text-muted-foreground">{transaction.notes}</span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "category",
      header: "Category",
    },
    {
      id: "account",
      header: "Account",
      cell: ({ row }) => {
        const acct = accounts.find(a => a.id === row.original.accountId)
        if (!acct) return <span className="text-muted-foreground">Unknown</span>
        return (
          <div className="flex flex-col">
            <span className="font-medium">{acct.name}</span>
            <span className="text-xs text-muted-foreground">{acct.type}</span>
          </div>
        )
      },
    },
    {
      accessorKey: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => {
        const iso = row.getValue("date") as string
        const d = new Date(iso)
        const formatted = isNaN(d.getTime())
          ? String(iso)
          : new Intl.DateTimeFormat("en-US", { month: "long", day: "numeric", year: "numeric" }).format(d)
        return <div className="whitespace-nowrap">{formatted}</div>
      },
    },
    {
      accessorKey: "amount",
      header: ({ column }) => {
        return (
          <div className="text-right">
              <Button
                variant="ghost"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Amount
                <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
          </div>
        )
      },
      cell: ({ row }) => {
        const amount = parseFloat(row.getValue("amount"))
        const formatted = new Intl.NumberFormat("en-PH", {
          style: "currency",
          currency: "PHP",
        }).format(amount)
    
    return <div className={cn("text-right font-medium", amount > 0 ? "text-green-600" : "text-red-600")}>{formatted}</div>
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const transaction = row.original
    
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(transaction.id)}
              >
                Copy transaction ID
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ];
}

// Default columns for backward compatibility
export const columns: ColumnDef<Transaction>[] = createColumns([]);
