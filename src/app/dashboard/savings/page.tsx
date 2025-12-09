"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, Trash2, Download } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { API } from "@/lib/api-service";
import type { SavingsAllocation, Account } from "@/lib/types";
import { SavingsAllocationDialog } from "@/components/dashboard/savings-allocation-dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SavingsPage() {
  const [savingsAllocations, setSavingsAllocations] = useState<SavingsAllocation[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [totalSavings, setTotalSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAllocation, setSelectedAllocation] = useState<SavingsAllocation | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'deposit' | 'withdrawal'>('all');
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (!user?.id) return;

    loadData();

    // Listen for data updates
    const handleDataUpdate = () => loadData();
    window.addEventListener('budgee:dataUpdate', handleDataUpdate);
    
    return () => {
      window.removeEventListener('budgee:dataUpdate', handleDataUpdate);
    };
  }, [user?.id]);

  const loadData = async () => {
    if (!user?.id) return;
    
    setIsLoading(true);
    try {
      const [allocations, userAccounts, total] = await Promise.all([
        API.savingsAllocations.getAll({ limit: 100 }), // Get all allocations
        API.accounts.getAll(),
        API.savingsAllocations.getTotalSavings(),
      ]);
      
      // Sort by date descending (most recent first)
      const sortedAllocations = allocations.sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      
      setSavingsAllocations(sortedAllocations);
      setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
      setTotalSavings(total);
    } catch (error) {
      console.error('Error loading savings data:', error);
      setSavingsAllocations([]);
      setAccounts([]);
      setTotalSavings(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedAllocation) return;

    try {
      await API.savingsAllocations.delete(selectedAllocation.id);
      
      toast({
        title: "Success!",
        description: "Savings allocation has been deleted.",
      });
      
      loadData();
    } catch (error: any) {
      console.error('Error deleting allocation:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete allocation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSelectedAllocation(null);
    }
  };

  const getAccountName = (accountId: string) => {
    const account = accounts.find(a => a.id === accountId);
    return account ? account.name : 'Unknown Account';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { 
      style: "currency", 
      currency: "PHP" 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const filteredAllocations = savingsAllocations.filter(alloc => {
    if (activeTab === 'all') return true;
    return alloc.type === activeTab;
  });

  const exportToCSV = () => {
    const csvData = savingsAllocations.map(alloc => ({
      Date: formatDate(alloc.date),
      Type: alloc.type.charAt(0).toUpperCase() + alloc.type.slice(1),
      Amount: alloc.amount,
      Description: alloc.description,
      Account: getAccountName(alloc.fromAccountId),
    }));

    const headers = Object.keys(csvData[0] || {});
    const csv = [
      headers.join(','),
      ...csvData.map(row => headers.map(h => `"${(row as any)[h]}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `savings-history-${new Date().toISOString().split('T')[0]}.csv`;
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Savings History</h1>
          <p className="text-muted-foreground">Track and manage all your savings allocations</p>
        </div>
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" onClick={exportToCSV} disabled={savingsAllocations.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <SavingsAllocationDialog 
            trigger={
              <Button>
                <PiggyBank className="h-4 w-4 mr-2" />
                New Allocation
              </Button>
            }
          />
        </div>
      </div>

      {/* Total Savings Card */}
      <Card className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <PiggyBank className="h-5 w-5" />
            Total Savings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">{formatCurrency(totalSavings)}</p>
          <p className="text-white/80 mt-2">
            {savingsAllocations.length} allocation{savingsAllocations.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      {/* Savings History Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Savings Allocations</CardTitle>
          <CardDescription>
            Complete history of your savings deposits and withdrawals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposit">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawal">Withdrawals</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              {isLoading ? (
                <SkeletonAllocationList />
              ) : filteredAllocations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <PiggyBank className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No savings activity yet</p>
                  <p className="text-sm mb-4">Start building your savings by making a deposit!</p>
                  <SavingsAllocationDialog 
                    trigger={
                      <Button>
                        <PiggyBank className="h-4 w-4 mr-2" />
                        Create First Allocation
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAllocations.map((allocation) => (
                    <AllocationCard 
                      key={allocation.id} 
                      allocation={allocation} 
                      accountName={getAccountName(allocation.fromAccountId)}
                      onDelete={(alloc) => {
                        setSelectedAllocation(alloc);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="deposit" className="mt-0">
              {isLoading ? (
                <SkeletonAllocationList />
              ) : filteredAllocations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowUpCircle className="h-16 w-16 mx-auto mb-4 opacity-50 text-green-500" />
                  <p className="text-lg font-medium">No deposits yet</p>
                  <p className="text-sm mb-4">Start saving by making your first deposit!</p>
                  <SavingsAllocationDialog 
                    trigger={
                      <Button>
                        <PiggyBank className="h-4 w-4 mr-2" />
                        Make Deposit
                      </Button>
                    }
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAllocations.map((allocation) => (
                    <AllocationCard 
                      key={allocation.id} 
                      allocation={allocation} 
                      accountName={getAccountName(allocation.fromAccountId)}
                      onDelete={(alloc) => {
                        setSelectedAllocation(alloc);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="withdrawal" className="mt-0">
              {isLoading ? (
                <SkeletonAllocationList />
              ) : filteredAllocations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <ArrowDownCircle className="h-16 w-16 mx-auto mb-4 opacity-50 text-blue-500" />
                  <p className="text-lg font-medium">No withdrawals yet</p>
                  <p className="text-sm">You haven't made any withdrawals from your savings.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAllocations.map((allocation) => (
                    <AllocationCard 
                      key={allocation.id} 
                      allocation={allocation} 
                      accountName={getAccountName(allocation.fromAccountId)}
                      onDelete={(alloc) => {
                        setSelectedAllocation(alloc);
                        setDeleteDialogOpen(true);
                      }}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Savings Allocation?</AlertDialogTitle>
            <AlertDialogDescription>
              This will delete the savings allocation and reverse the account balance change.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Allocation Card Component
function AllocationCard({ 
  allocation, 
  accountName, 
  onDelete 
}: { 
  allocation: SavingsAllocation; 
  accountName: string; 
  onDelete: (allocation: SavingsAllocation) => void;
}) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-PH", { 
      style: "currency", 
      currency: "PHP" 
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(new Date(dateString));
  };

  return (
    <div className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors gap-3">
      <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
        <div className={`p-2 md:p-3 rounded-full flex-shrink-0 ${
          allocation.type === 'deposit' 
            ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' 
            : 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
        }`}>
          {allocation.type === 'deposit' ? (
            <ArrowUpCircle className="h-4 w-4 md:h-5 md:w-5" />
          ) : (
            <ArrowDownCircle className="h-4 w-4 md:h-5 md:w-5" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold truncate" title={allocation.description}>
            {allocation.description}
          </p>
          <div className="flex flex-col md:flex-row md:flex-wrap gap-x-4 gap-y-0.5 text-xs md:text-sm text-muted-foreground">
            <span className="truncate">From {accountName}</span>
            <span className="hidden md:inline">•</span>
            <span>{formatDate(allocation.date)}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
        <div className="text-right">
          <p className={`text-sm md:text-lg font-semibold whitespace-nowrap ${
            allocation.type === 'deposit' ? 'text-green-600' : 'text-blue-600'
          }`}>
            {allocation.type === 'deposit' ? '+' : '-'}{formatCurrency(allocation.amount)}
          </p>
          <Badge variant="outline" className="text-xs">
            {allocation.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
          </Badge>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 flex-shrink-0"
          onClick={() => onDelete(allocation)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  );
}

function SkeletonAllocationList() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-4 rounded-lg border bg-card gap-3">
          <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
            <Skeleton className="h-9 w-9 md:h-11 md:w-11 rounded-full flex-shrink-0" />
            <div className="space-y-2 flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 max-w-[200px]" />
              <Skeleton className="h-3 w-1/2 max-w-[150px]" />
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
            <div className="text-right space-y-1.5">
              <Skeleton className="h-5 w-20 md:w-24 ml-auto" />
              <Skeleton className="h-5 w-14 ml-auto" />
            </div>
            <Skeleton className="h-8 w-8 rounded-md flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
