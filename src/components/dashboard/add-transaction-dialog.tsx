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
import { TransactionService } from "@/lib/storage-service";
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
    
    // Ensure user has a cash account for manual transactions
    TransactionService.ensureCashAccount(user.id);
    
    // Initialize default categories if none exist
    TransactionService.initializeDefaultCategories(user.id);
    
    const userAccounts = TransactionService.getAccounts(user.id);
    setAccounts(userAccounts);
    
    const userCategories = TransactionService.getCategories(user.id);
    setCategories(userCategories);
    
    // Set cash account as default for manual transactions
    const cashAccount = userAccounts.find(account => account.type === 'Cash');
    if (cashAccount && !selectedAccount) {
      setSelectedAccount(cashAccount.id);
    }
  }, [user?.id, isOpen, selectedAccount]);

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

    try {
      // Create new transaction
      const transactionData = {
        description,
        amount: type === "Income" ? parseFloat(amount) : -parseFloat(amount),
        category: category,
        accountId: selectedAccount,
        date: date,
        notes: notes || undefined,
      };
      
      // Add to localStorage
      TransactionService.addTransaction(user.id, transactionData);
      
      // Update account balance for all account types including Cash
      const account = accounts.find(a => a.id === selectedAccount);
      if (account) {
        TransactionService.updateAccount(user.id, selectedAccount, {
          balance: account.balance + transactionData.amount
        });
      }
      
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
                  <Label htmlFor="income">Income</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Expense" id="expense" />
                  <Label htmlFor="expense">Expense</Label>
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
                onChange={(e) => setAmount(e.target.value)}
                min="0"
                step="0.01"
              />
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