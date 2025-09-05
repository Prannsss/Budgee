"use client";
import { useMemo, useState, useRef } from "react";
import { mockTransactions } from "@/lib/data";
import { DataTable, type DataTableHandle } from "@/components/transactions/data-table";
import { columns } from "@/components/transactions/columns";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { Filter } from "lucide-react";
import type { DateRange } from "react-day-picker";

export default function TransactionsPage() {
  const [tab, setTab] = useState("all");
  const [range, setRange] = useState<DateRange | undefined>();
  const [open, setOpen] = useState(false);
  const tableRef = useRef<DataTableHandle>(null);

  const filtered = useMemo(() => {
    let base = mockTransactions as typeof mockTransactions;
    if (tab === "income") base = base.filter((t) => t.amount > 0);
    if (tab === "expenses") base = base.filter((t) => t.amount < 0);

    if (!range?.from && !range?.to) return base;
    const from = range?.from ? new Date(range.from) : undefined;
    const to = range?.to ? new Date(range.to) : undefined;
    return base.filter((t) => {
      const d = new Date(t.date);
      if (
        from &&
        d < new Date(from.getFullYear(), from.getMonth(), from.getDate())
      )
        return false;
      if (
        to &&
        d >
          new Date(
            to.getFullYear(),
            to.getMonth(),
            to.getDate(),
            23,
            59,
            59,
            999
          )
      )
        return false;
      return true;
    });
  }, [tab, range]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Transactions
        </h1>
        <p className="text-muted-foreground">
          View and manage all your financial transactions.
        </p>
      </div>
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="income">Income</TabsTrigger>
            <TabsTrigger value="expenses">Expenses</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2">
            {/* Filter button (always visible) */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8"
                  aria-label="Filter by date"
                >
                  <Filter className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Select date range</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4">
                  <Calendar
                    mode="range"
                    numberOfMonths={1}
                    selected={range}
                    onSelect={setRange}
                  />
                  <div className="flex w-full items-center justify-between">
                    <Button variant="ghost" onClick={() => setRange(undefined)}>
                      Clear
                    </Button>
                    <Button onClick={() => setOpen(false)}>Done</Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            {/* Export button (filled style) */}
            <Button
              className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
              size="sm"
              onClick={() => tableRef.current?.exportSelected()}
            >
              Export
            </Button>
          </div>
        </div>
        {/* Desktop table */}
        <div className="mt-1 hidden md:block">
          <DataTable ref={tableRef} columns={columns} data={filtered} />
        </div>
        {/* Mobile list */}
        <div className="mt-2 md:hidden">
          <MobileTransactionList items={filtered} />
        </div>
      </Tabs>
    </div>
  );
}

type Txn = (typeof mockTransactions)[number];

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

  return (
    <div className="divide-y rounded-lg border bg-card">
      {/* Header summary like reference */}
      <div className="px-4 py-3">
        <div className="text-xs text-muted-foreground">
          As of{" "}
          {new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }).format(new Date())}
        </div>
      </div>
      {groups.map(([day, txns]) => (
        <section key={day} className="bg-muted/30">
          <h3 className="px-4 py-2 text-sm font-semibold text-foreground">
            {formatDayHeading(day)}
          </h3>
          <ul className="divide-y bg-background">
            {txns.map((t) => (
              <li key={t.id} className="flex items-center gap-3 px-4 py-3">
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
              </li>
            ))}
          </ul>
        </section>
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
