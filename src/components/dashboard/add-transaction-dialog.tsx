"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Textarea } from "../ui/textarea";
import { Plus, DollarSign, Landmark } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { API } from "@/lib/api-service";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import type { Transaction, Account, Category } from "@/lib/types";
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog";

export function AddTransactionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  
  // Form state
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState("");
  
  const { toast } = useToast();
  const { user } = useAuth();
  const router = useRouter();

  // Load user accounts and categories when dialog opens
  useEffect(() => {
    if (!user?.id || !isOpen) return;
    
    let isMounted = true;
    
    const loadData = async () => {
      try {
        const [userAccounts, userCategories] = await Promise.all([
          API.accounts.getAll(),
          API.categories.getAll()
        ]);
        
        if (isMounted) {
          setAccounts(Array.isArray(userAccounts) ? userAccounts : []);
          setCategories(Array.isArray(userCategories) ? userCategories : []);
          
          // Set first account as default if none selected
          if (Array.isArray(userAccounts) && userAccounts.length > 0 && !selectedAccount) {
            setSelectedAccount(userAccounts[0].id);
          }
        }
      } catch (error: any) {
        // Silently handle auth errors (user is being logged out)
        if (error?.message?.includes('Unauthorized')) {
          console.log('User session expired - logout in progress');
          return;
        }
        
        console.error('Error loading transaction dialog data:', error);
        if (isMounted) {
          toast({
            title: "Error",
            description: "Failed to load accounts and categories.",
            variant: "destructive",
          });
        }
      }
    };
    
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id, isOpen, selectedAccount, toast]);

  const handleAddTransaction = async () => {
    if (!user?.id) return;
    
    setIsAdding(true);
    
    // Validate form
    if (!amount || !description || !category || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsAdding(false);
      return;
    }

    // Validate amount limit (1 million)
    const numAmount = parseFloat(amount);
    if (numAmount > 1000000) {
      toast({
        title: "Amount Too Large",
        description: "Transaction amount cannot exceed ₱1,000,000.",
        variant: "destructive",
      });
      setIsAdding(false);
      return;
    }

    if (numAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than zero.",
        variant: "destructive",
      });
      setIsAdding(false);
      return;
    }

    try {
      // Find the selected category object to get its ID
      const selectedCategory = categories.find(cat => cat.name === category);
      
      if (!selectedCategory) {
        toast({
          title: "Error",
          description: "Selected category not found.",
          variant: "destructive",
        });
        setIsAdding(false);
        return;
      }

      // Create new transaction matching backend API
      const transactionData = {
        account_id: parseInt(selectedAccount),
        category_id: parseInt(selectedCategory.id),
        type: type.toLowerCase() as 'income' | 'expense',
        amount: parseFloat(amount),
        description: description,
        date: date,
        notes: notes || undefined,
      };
      
      // Add transaction via API
      await API.transactions.create(transactionData);
      
      // Reset form
      setAmount("");
      setDescription("");
      setCategory("");
      setType("Expense");
      setDate(new Date().toISOString().split('T')[0]);
      setNotes("");
      
      setIsOpen(false);
      
      // Notify components to refresh data
      window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
      
      toast({
        title: "Transaction Added",
        description: `Your ${type.toLowerCase()} transaction has been added successfully.`,
        variant: "success",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add transaction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const availableCategories = categories
    .filter(cat => cat.type === type)
    .map(cat => cat.name);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        // Reset form when dialog closes
        setAmount("");
        setDescription("");
        setCategory("");
        setType("Expense");
        setDate(new Date().toISOString().split('T')[0]);
        setNotes("");
      }
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Transaction</DialogTitle>
          <DialogDescription>
            Record a new income or expense transaction manually.
          </DialogDescription>
        </DialogHeader>
        
        {isAdding ? (
          <div className="flex flex-col items-center justify-center gap-4 h-40">
            <DollarSign className="h-12 w-12 animate-pulse text-primary" />
            <p className="text-muted-foreground">
              Adding your transaction...
            </p>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            <div className="space-y-3">
              <Label>Transaction Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(value) => {
                  setType(value as "Income" | "Expense");
                  setCategory(""); // Reset category when type changes
                }}
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Income" id="income" />
                  <Label htmlFor="income" className="cursor-pointer">Income</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Expense" id="expense" />
                  <Label htmlFor="expense" className="cursor-pointer">Expense</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => {
                  const value = e.target.value;
                  // Allow empty string for deletion
                  if (value === '') {
                    setAmount('');
                    return;
                  }
                  // Prevent values greater than 1 million
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue) && numValue <= 1000000) {
                    setAmount(value);
                  }
                }}
                min="0"
                max="1000000"
                step="0.01"
              />
              <p className="text-xs text-muted-foreground">Maximum amount: ₱1,000,000</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter transaction description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Date *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Account *</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {accounts.length === 0 && (
                <div className="text-center space-y-2 mt-2">
                  <p className="text-sm text-muted-foreground">
                    No accounts found. You can still add transactions.
                  </p>
                  <ConnectAccountDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Account
                      </Button>
                    }
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any additional notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
              />
            </div>

            <Button
              onClick={handleAddTransaction}
              className="w-full"
              disabled={!amount || !description || !category || !selectedAccount}
            >
              Add Transaction
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}