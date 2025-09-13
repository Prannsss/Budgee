"use client";

import { useState } from "react";
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
import { Plus, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { mockTransactions, mockAccounts } from "@/lib/data";
import { useRouter } from "next/navigation";
import type { Transaction } from "@/lib/types";

const categoriesByType = {
  Income: [
    "Income",        // General income (for existing data compatibility)
    "Salary",        // Employment income
    "Freelance",     // Freelance work
    "Business",      // Business income
    "Investment",    // Investment returns
    "Rental",        // Rental income
    "Gift",          // Gifts received
    "Refund",        // Refunds
    "Bonus",         // Work bonuses
    "Other Income"   // Other income sources
  ],
  Expense: [
    "Housing",
    "Food", 
    "Transportation", 
    "Entertainment", 
    "Utilities", 
    "Other"
  ]
};

export function AddTransactionDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  
  // Form state
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string>("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  
  const { toast } = useToast();
  const router = useRouter();

  const handleAddTransaction = async () => {
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

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create new transaction
    const newTransaction: Transaction = {
      id: `${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
      description,
      amount: type === "Income" ? parseFloat(amount) : -parseFloat(amount),
      category: type === "Income" ? "Income" : category as Transaction['category'], // All income types map to "Income" category for type compatibility
      status: 'completed',
      accountId: selectedAccount,
    };
    
    // Add to mock data
    mockTransactions.unshift(newTransaction);
    
    // Update account balance
    const account = mockAccounts.find(a => a.id === selectedAccount);
    if (account) {
      account.balance += newTransaction.amount;
    }
    
    setIsAdding(false);
    setIsOpen(false);
    
    // Notify app and refresh
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('accounts:updated'));
      window.dispatchEvent(new CustomEvent('transactions:updated'));
    }
    router.refresh();
    
    toast({
      title: "Transaction Added",
      description: `Your ${type.toLowerCase()} transaction has been added successfully.`,
    });
    
    // Reset form
    resetForm();
  };

  const resetForm = () => {
    setType("Expense");
    setAmount("");
    setDescription("");
    setCategory("");
    setSelectedAccount("");
  };

  const availableCategories = categoriesByType[type];

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) {
        resetForm();
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
            Record a new income or expense transaction.
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
              <Label htmlFor="amount">Amount</Label>
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
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                type="text"
                placeholder="Enter transaction description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
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
              <Label htmlFor="account">Account</Label>
              <Select value={selectedAccount} onValueChange={setSelectedAccount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select an account" />
                </SelectTrigger>
                <SelectContent>
                  {mockAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
