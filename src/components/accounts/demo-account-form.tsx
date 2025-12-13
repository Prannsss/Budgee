"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Institution } from "@/lib/types";
import Image from "next/image";
import { Landmark, Wallet } from "lucide-react";

interface DemoAccountFormProps {
  institution: Institution;
  accountType: 'Bank' | 'E-Wallet';
  onSubmit: (data: { nickname: string; initialBalance: number }) => void;
  onBack: () => void;
  isLoading?: boolean;
}

/**
 * Demo Account Setup Form
 * 
 * Allows users to customize their demo account with a nickname
 * and optional initial balance before creation.
 */
export function DemoAccountForm({
  institution,
  accountType,
  onSubmit,
  onBack,
  isLoading = false,
}: DemoAccountFormProps) {
  const [nickname, setNickname] = React.useState(
    `My ${institution.short_name} Account`
  );
  const [initialBalance, setInitialBalance] = React.useState(
    accountType === 'Bank' ? '25000' : '5000'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      nickname: nickname.trim() || `${institution.short_name} Account`,
      initialBalance: parseFloat(initialBalance) || (accountType === 'Bank' ? 25000 : 5000),
    });
  };

  const suggestedBalances = accountType === 'Bank' 
    ? ['10,000', '25,000', '50,000', '100,000']
    : ['1,000', '5,000', '10,000', '20,000'];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Institution Header */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50">
        <div className="relative w-12 h-12 flex items-center justify-center rounded-lg bg-background border overflow-hidden">
          {institution.logo ? (
            <Image
              src={institution.logo}
              alt={institution.short_name}
              width={40}
              height={40}
              className="object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          ) : accountType === 'Bank' ? (
            <Landmark className="h-6 w-6 text-muted-foreground" />
          ) : (
            <Wallet className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div>
          <p className="font-medium">{institution.name}</p>
          <p className="text-sm text-muted-foreground">{accountType} Account</p>
        </div>
      </div>

      {/* Demo Notice */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 p-3 rounded-md">
        <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
          Demo
        </span>
        <span>This will create a simulated account with sample transactions</span>
      </div>

      {/* Account Nickname */}
      <div className="space-y-2">
        <Label htmlFor="nickname">Account Nickname</Label>
        <Input
          id="nickname"
          type="text"
          placeholder="e.g., My Savings Account"
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          disabled={isLoading}
          maxLength={50}
        />
        <p className="text-xs text-muted-foreground">
          Give your demo account a memorable name
        </p>
      </div>

      {/* Initial Balance */}
      <div className="space-y-2">
        <Label htmlFor="balance">Starting Balance (₱)</Label>
        <Input
          id="balance"
          type="number"
          placeholder="Enter amount"
          value={initialBalance}
          onChange={(e) => setInitialBalance(e.target.value)}
          disabled={isLoading}
          min={0}
          max={10000000}
          step={100}
        />
        <div className="flex flex-wrap gap-2 mt-2">
          {suggestedBalances.map((amount) => (
            <button
              key={amount}
              type="button"
              onClick={() => setInitialBalance(amount.replace(/,/g, ''))}
              className="text-xs px-2 py-1 rounded-md border hover:bg-muted transition-colors"
              disabled={isLoading}
            >
              ₱{amount}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">
          This is a simulated balance for demo purposes
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="flex-1"
        >
          Back
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? 'Creating...' : 'Create Demo Account'}
        </Button>
      </div>
    </form>
  );
}
