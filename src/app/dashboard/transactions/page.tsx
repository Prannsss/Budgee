"use client";
import { useMemo, useState, useRef, useEffect } from "react";
import { DataTable, type DataTableHandle } from "@/components/transactions/data-table";
import { createColumns } from "@/components/transactions/columns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import type { DateRange } from "react-day-picker";
import jsPDF from 'jspdf';
import { TransactionService } from "@/lib/storage-service";
import { useAuth } from "@/contexts/auth-context";
import type { Transaction, Account } from "@/lib/types";
import { SkeletonTable } from "@/components/ui/skeleton-components";

export default function TransactionsPage() {
  const [tab, setTab] = useState("all");
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportDateRange, setExportDateRange] = useState<DateRange | undefined>();
  const [exportDateRangeOption, setExportDateRangeOption] = useState<string>("all");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const tableRef = useRef<DataTableHandle>(null);
  const { user } = useAuth();

  // Create columns with accounts data
  const columns = useMemo(() => createColumns(accounts), [accounts]);

  // Load user transactions and accounts
  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay for better UX
      await new Promise(resolve => setTimeout(resolve, 400));
      
      const userTransactions = TransactionService.getTransactions(user.id);
      setTransactions(userTransactions);
      
      const userAccounts = TransactionService.getAccounts(user.id);
      setAccounts(userAccounts);
      setIsLoading(false);
    };

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  const handleExportSubmit = () => {
    // Get date range for export
    let exportData = transactions;
    
    // Filter by date range if custom range is selected
    if (exportDateRangeOption === "custom" && exportDateRange?.from) {
      const from = exportDateRange.from;
      const to = exportDateRange.to || exportDateRange.from;
      
      exportData = exportData.filter((t) => {
        const d = new Date(t.date);
        return d >= new Date(from.getFullYear(), from.getMonth(), from.getDate()) &&
               d <= new Date(to.getFullYear(), to.getMonth(), to.getDate(), 23, 59, 59, 999);
      });
    } else if (exportDateRangeOption !== "all") {
      // Handle predefined date ranges
      const now = new Date();
      let startDate: Date;
      
      switch (exportDateRangeOption) {
        case "last7days":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "last30days":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          break;
        case "last90days":
          startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
          break;
        default:
          startDate = new Date(0);
      }
      
      exportData = exportData.filter((t) => new Date(t.date) >= startDate);
    }
    
    // Generate branded PDF
    const generateBrandedPDF = () => {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPosition = 30;

      // Set normal character spacing for the entire document
      pdf.setCharSpace(0);

      // Brand colors (from CSS variables)
      const primaryColor = '#6366f1'; // Primary color from theme
      const mutedColor = '#64748b'; // Muted color
      const positiveColor = '#059669'; // Green for positive amounts
      const negativeColor = '#dc2626'; // Red for negative amounts

      // Header Section with Logo and Branding
      pdf.setFillColor(100, 102, 241); // Primary color
      pdf.rect(0, 0, pageWidth, 50, 'F');
      
      // Budgee Logo/Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Budgee', margin, 25);
      
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'italic');
      pdf.text('Your Personal Finance Buddy', margin, 35);

      // Transaction History Title
      yPosition = 70;
      pdf.setTextColor(51, 51, 51);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Transaction History', margin, yPosition);

      // Date and summary info
      yPosition += 15;
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(100, 116, 139);
      
      const currentDate = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      pdf.text(`Generated on: ${currentDate}`, margin, yPosition);
      
      yPosition += 8;
      pdf.text(`Total Transactions: ${exportData.length}`, margin, yPosition);
      
      // Calculate totals
      const totalIncome = exportData.filter(t => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
      const totalExpenses = exportData.filter(t => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
      
      yPosition += 8;
      // Build text without template literals to avoid spacing issues
      const totalIncomeAmount = totalIncome.toLocaleString('en-PH', { minimumFractionDigits: 2 });
      pdf.text('Total Income: Php ' + totalIncomeAmount, margin, yPosition);
      
      yPosition += 8;
      const totalExpensesAmount = totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2 });
      pdf.text('Total Expenses: Php ' + totalExpensesAmount, margin, yPosition);

      // Add separator line
      yPosition += 12;
      pdf.setDrawColor(229, 231, 235); // Border color
      pdf.line(margin, yPosition, pageWidth - margin, yPosition);
      
      // Table Header
      yPosition += 12;
      pdf.setFillColor(248, 250, 252); // Light background
      pdf.rect(margin, yPosition - 5, pageWidth - (margin * 2), 12, 'F');
      
      pdf.setTextColor(51, 51, 51);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      
      // Column headers
      pdf.text('Date', margin + 5, yPosition + 5);
      pdf.text('Description', margin + 45, yPosition + 5);
      pdf.text('Amount', margin + 110, yPosition + 5);
      pdf.text('Category', margin + 140, yPosition + 5);

      // Table content
      yPosition += 15;
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(8);

      exportData.forEach((transaction, index) => {
        // Check if we need a new page
        if (yPosition > 275) {
          pdf.addPage();
          yPosition = 30;
        }

        // Alternate row background
        if (index % 2 === 0) {
          pdf.setFillColor(250, 250, 250);
          pdf.rect(margin, yPosition - 2, pageWidth - (margin * 2), 10, 'F');
        }

        pdf.setTextColor(51, 51, 51);
        
        // Date
        const transactionDate = new Date(transaction.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });
        pdf.text(transactionDate, margin + 5, yPosition + 3);

        // Description (truncate if too long)
        const description = transaction.description.length > 25 
          ? transaction.description.substring(0, 22) + '...' 
          : transaction.description;
        pdf.text(description, margin + 45, yPosition + 3);

        // Amount with color coding
        const absAmount = Math.abs(transaction.amount);
        const amount = 'Php ' + absAmount.toLocaleString('en-PH', { minimumFractionDigits: 2 });
        
        if (transaction.amount > 0) {
          pdf.setTextColor(5, 150, 105);
        } else {
          pdf.setTextColor(220, 38, 38);
        }
        pdf.text(amount, margin + 110, yPosition + 3);

        // Category
        pdf.setTextColor(100, 116, 139);
        const category = transaction.category.length > 15 
          ? transaction.category.substring(0, 12) + '...' 
          : transaction.category;
        pdf.text(category, margin + 140, yPosition + 3);

        yPosition += 10;
      });

      // Footer
      const pageHeight = pdf.internal.pageSize.getHeight();
      pdf.setFontSize(8);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Generated by Budgee - Your Personal Finance Buddy', margin, pageHeight - 15);
      pdf.text('Page 1', pageWidth - 40, pageHeight - 15);

      // Save the PDF
      const fileName = `budgee-transactions-${new Date().toISOString().split('T')[0]}.pdf`;
      pdf.save(fileName);
    };
    
    generateBrandedPDF();
    
    // Close dialog and reset
    setExportDialogOpen(false);
    setExportDateRange(undefined);
    setExportDateRangeOption("all");
  };

  const filtered = useMemo(() => {
    let base = transactions;
    if (tab === "income") base = base.filter((t) => t.amount > 0);
    if (tab === "expenses") base = base.filter((t) => t.amount < 0);
    return base;
  }, [tab, transactions]);

  return (
    <div className="space-y-6 px-4 md:px-0">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Transactions
        </h1>
        <p className="text-muted-foreground">
          View and manage all your financial transactions.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {/* Export button */}
            <Button
              className="h-8 bg-primary text-primary-foreground hover:bg-primary/90 w-full sm:w-auto"
              size="sm"
              onClick={() => setExportDialogOpen(true)}
            >
              Export
            </Button>
          </div>
        </div>
        {/* Desktop table */}
        <div className="mt-1 hidden md:block">
          {isLoading ? (
            <SkeletonTable rows={8} columns={4} />
          ) : (
            <DataTable ref={tableRef} columns={columns} data={filtered} />
          )}
        </div>
        {/* Mobile list */}
        <div className="mt-2 md:hidden">
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    <div className="h-3 bg-muted animate-pulse rounded w-1/4" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <MobileTransactionList items={filtered} />
          )}
        </div>
      </Tabs>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Download Transactions</DialogTitle>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Your transactions will be downloaded onto your device.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Select a date range</Label>
                <p className="text-xs text-muted-foreground">
                  Tell us the dates to be included in your transaction history. All transactions are in PH time (GMT+8).
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="dateRange">Date Range</Label>
                  <Select value={exportDateRangeOption} onValueChange={setExportDateRangeOption}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="last7days">Last 7 Days</SelectItem>
                      <SelectItem value="last30days">Last 30 Days</SelectItem>
                      <SelectItem value="last90days">Last 90 Days</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {exportDateRangeOption === "custom" && (
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <Label>From</Label>
                      <div className="flex justify-center">
                        <div className="w-full max-w-sm h-[320px] flex items-center justify-center border rounded-md bg-background">
                          <Calendar
                            mode="range"
                            numberOfMonths={1}
                            selected={exportDateRange}
                            onSelect={setExportDateRange}
                            className="p-3"
                            fixedWeeks
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button 
              onClick={handleExportSubmit}
              className="w-full"
              disabled={exportDateRangeOption === "custom" && !exportDateRange?.from}
            >
              Download PDF
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

type Txn = Transaction;

function formatAmount(n: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(n);
}

function formatDayHeading(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yday = new Date();
  yday.setDate(today.getDate() - 1);
  const fmt = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yday.toDateString()) return "Yesterday";
  return fmt.format(d);
}

function groupByDay(items: Txn[]) {
  const sorted = [...items].sort((a, b) => b.date.localeCompare(a.date));
  const map = new Map<string, Txn[]>();
  for (const t of sorted) {
    const key = t.date;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(t);
  }
  return Array.from(map.entries());
}

function MobileTransactionList({ items }: { items: Txn[] }) {
  const groups = groupByDay(items);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<Txn | null>(null);

  if (items.length === 0) {
    return (
      <div className="rounded-lg border bg-card">
        <div className="px-4 py-8 text-center">
          <p className="text-muted-foreground">No transactions found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header summary */}
      <div className="rounded-lg border bg-card px-4 py-3">
        <div className="text-xs text-muted-foreground">
          As of{" "}
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date())}
        </div>
      </div>
      
      {/* Transaction groups */}
      {groups.map(([day, txns]) => (
        <div key={day} className="rounded-lg border bg-card overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/30">
            <h3 className="text-sm font-semibold text-foreground">
              {formatDayHeading(day)}
            </h3>
          </div>
          <div className="divide-y">
            {txns.map((t) => (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="text-[10px] text-muted-foreground">
                    {new Date(t.date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="truncate text-sm font-medium">
                    {t.description}
                  </span>
                </div>
                <div
                  className={
                    "text-sm font-semibold tabular-nums " +
                    (t.amount > 0 ? "text-emerald-600" : "text-red-600")
                  }
                >
                  {t.amount > 0 ? "+" : ""}
                  {formatAmount(t.amount)}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-1 h-8 w-8 shrink-0"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem
                      onClick={() => {
                        navigator.clipboard.writeText(t.id);
                      }}
                    >
                      Copy transaction ID
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setActive(t);
                        setOpen(true);
                      }}
                    >
                      View details
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Bottom sheet for details */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="bottom"
          className="rounded-t-2xl pb-[calc(env(safe-area-inset-bottom,0px)+16px)]"
        >
          <SheetHeader>
            <SheetTitle>Transaction Details</SheetTitle>
          </SheetHeader>
          {active && (
            <div className="mt-4 space-y-3 text-sm">
              <DetailRow label="Description" value={active.description} />
              <DetailRow
                label="Amount"
                value={formatAmount(active.amount)}
                emphasize={active.amount > 0 ? "pos" : "neg"}
              />
              <DetailRow
                label="Date"
                value={new Intl.DateTimeFormat("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(active.date))}
              />
              <DetailRow label="Category" value={active.category} />
              <DetailRow label="Status" value={active.status} />
              <DetailRow label="Transaction ID" value={active.id} copyable />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

function DetailRow({
  label,
  value,
  copyable = false,
  emphasize,
}: {
  label: string;
  value: string;
  copyable?: boolean;
  emphasize?: "pos" | "neg";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="text-muted-foreground">{label}</div>
      <div
        className={
          "ml-auto font-medium " +
          (emphasize === "pos"
            ? "text-emerald-600"
            : emphasize === "neg"
            ? "text-red-600"
            : "")
        }
      >
        {value}
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            className="ml-2 px-2 py-0"
            onClick={() => navigator.clipboard.writeText(String(value))}
          >
            Copy
          </Button>
        )}
      </div>
    </div>
  );
}
