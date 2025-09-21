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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { PiggyBank, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TransactionService } from "@/lib/storage-service";
import { useAuth } from "@/contexts/auth-context";
import type { Account } from "@/lib/types";

export function SavingsAllocationDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  
  // Form state
  const [type, setType] = useState<"deposit" | "withdrawal">("deposit");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  const { toast } = useToast();
  const { user } = useAuth();

  // Load user accounts when dialog opens
  useEffect(() => {
    if (!user?.id || !isOpen) return;
    
    const userAccounts = TransactionService.getAccounts(user.id);
    setAccounts(userAccounts);
    
    // Set first account as default
    if (userAccounts.length > 0 && !selectedAccount) {
      setSelectedAccount(userAccounts[0].id);
    }
  }, [user?.id, isOpen, selectedAccount]);

  const handleSavingsAllocation = async () => {
    if (!user?.id) return;
    
    setIsProcessing(true);
    
    // Validate form
    if (!amount || !description || !selectedAccount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    const amountValue = parseFloat(amount);
    if (amountValue <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Amount must be greater than 0.",
        variant: "destructive",
      });
      setIsProcessing(false);
      return;
    }

    // Check if account has sufficient balance for deposits
    if (type === "deposit") {
      const account = accounts.find(a => a.id === selectedAccount);
      if (account && account.balance < amountValue) {
        toast({
          title: "Insufficient Balance",
          description: `Account balance (₱${account.balance.toFixed(2)}) is insufficient for this deposit.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    // Check if there are sufficient savings for withdrawals
    if (type === "withdrawal") {
      const currentSavings = TransactionService.getTotalSavings(user.id);
      if (currentSavings < amountValue) {
        toast({
          title: "Insufficient Savings",
          description: `Current savings (₱${currentSavings.toFixed(2)}) is insufficient for this withdrawal.`,
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }
    }

    try {
      // Create savings allocation
      TransactionService.addSavingsAllocation(user.id, {
        amount: amountValue,
        description,
        fromAccountId: selectedAccount,
        type,
        date,
      });
      
      // Reset form
      setAmount("");
      setDescription("");
      setType("deposit");
      setDate(new Date().toISOString().split('T')[0]);
      
      // Close dialog
      setIsOpen(false);
      
      toast({
        title: "Success!",
        description: `Savings ${type} of ₱${amountValue.toFixed(2)} has been recorded.`,
      });
      
    } catch (error) {
      console.error('Error processing savings allocation:', error);
      toast({
        title: "Error",
        description: "Failed to process savings allocation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setAmount("");
    setDescription("");
    setType("deposit");
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="gap-2">
            <PiggyBank className="h-4 w-4" />
            Manage Savings
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PiggyBank className="h-5 w-5" />
            Savings Allocation
          </DialogTitle>
          <DialogDescription>
            Move money to or from your savings. This will update your account balance and savings total.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Transaction Type */}
          <div className="space-y-2">
            <Label>Transaction Type</Label>
            <RadioGroup
              value={type}
              onValueChange={(value) => setType(value as "deposit" | "withdrawal")}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="deposit" id="deposit" />
                <Label htmlFor="deposit" className="flex items-center gap-1">
                  <ArrowUpCircle className="h-4 w-4 text-green-600" />
                  Deposit to Savings
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="withdrawal" id="withdrawal" />
                <Label htmlFor="withdrawal" className="flex items-center gap-1">
                  <ArrowDownCircle className="h-4 w-4 text-blue-600" />
                  Withdraw from Savings
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* Amount */}
          <div className="space-y-2">
            <Label htmlFor="amount">Amount *</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="0"
              step="0.01"
            />
          </div>

          {/* Account */}
          <div className="space-y-2">
            <Label htmlFor="account">Account *</Label>
            <Select value={selectedAccount} onValueChange={setSelectedAccount}>
              <SelectTrigger>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({account.type}) - ₱{account.balance.toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder={type === "deposit" ? "e.g., Emergency fund deposit" : "e.g., Emergency expense withdrawal"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Date */}
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => setIsOpen(false)}
          >
            Cancel
          </Button>
          <Button
            className="flex-1"
            onClick={handleSavingsAllocation}
            disabled={isProcessing}
          >
            {isProcessing ? "Processing..." : `${type === "deposit" ? "Deposit" : "Withdraw"} ₱${amount || "0.00"}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}