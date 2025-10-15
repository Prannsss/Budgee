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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ArrowLeft, Banknote, Landmark, Loader2, Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMockProviderData } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { API } from "@/lib/api-service";
import bankInstitutions from "@/data/bankIns.json";
import { Institution } from "@/lib/types";
import Image from "next/image";

const accountTypes = [
    { name: "Bank", icon: <Landmark className="h-8 w-8" /> },
    { name: "E-Wallet", icon: <Wallet className="h-8 w-8" /> },
]

// Load institutions from JSON
const institutions = bankInstitutions as Institution[];

// Group institutions by type
const institutionsByType: Record<string, Institution[]> = {
  "Bank": institutions.filter(inst => inst.type === "bank" && inst.is_supported),
  "E-Wallet": institutions.filter(inst => inst.type === "e-wallet" && inst.is_supported),
};

export function ConnectAccountDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedInstitution, setSelectedInstitution] = useState<Institution | null>(null);
  const [step, setStep] = useState<"type" | "provider" | "details">("type");
  const [isOtpSent, setIsOtpSent] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();

  const handleSendOtp = async () => {
    // Simulate OTP sending
    setIsOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "Please check your registered mobile number for the OTP.",
    });
  };

  const handleConnect = async (type: string, institution: Institution) => {
    if (!user?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to connect an account.",
        variant: "destructive",
      });
      return;
    }

    setIsConnecting(true);
    // Simulate API call for connecting account
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // Generate mock account + transactions and save to user's storage
    const { account, transactions } = getMockProviderData(type as any, institution.short_name);
    
    // Add account via API with institution info
    const newAccount = await API.accounts.create({
      name: account.name,
      type: account.type,
      balance: account.balance,
      lastFour: account.lastFour,
      institutionId: institution.id,
      institutionName: institution.short_name,
      institutionLogo: institution.logo,
    });

    // Get user categories to map transaction category names to IDs
    const categories = await API.categories.getAll();
    
    // Add transactions via API
    for (const txn of transactions) {
      // Find category by name (case-insensitive) or use first available category
      const categoryMatch = categories.find(
        cat => cat.name.toLowerCase() === txn.category.toLowerCase()
      );
      
      // Skip transaction if no category found (should not happen with default categories)
      if (!categoryMatch) {
        console.warn(`Category not found for transaction: ${txn.category}`);
        continue;
      }
      
      await API.transactions.create({
        account_id: parseInt(newAccount.id),
        category_id: parseInt(categoryMatch.id),
        type: txn.amount > 0 ? 'income' : 'expense',
        amount: Math.abs(txn.amount),
        description: txn.description,
        date: txn.date,
        notes: txn.notes,
      });
    }

    setIsConnecting(false);
    setIsOpen(false);
    
    // Notify app components to refresh data
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
      window.dispatchEvent(new CustomEvent('accounts:updated'));
    }
    
    router.refresh();
    toast({
        title: "Connection Successful",
        description: `Your ${institution.short_name} (${type}) account has been connected.`,
    });
    
    // Reset state
    resetForm();
  }

  const resetForm = () => {
    setSelectedType(null);
    setSelectedInstitution(null);
    setStep("type");
    setFullName("");
    setAccountNumber("");
    setVerificationMethod("password");
    setPassword("");
    setOtp("");
    setIsOtpSent(false);
  };

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
            <Plus className="mr-2 h-4 w-4" /> Connect Account
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {isConnecting
              ? "Connecting account"
              : step === "type"
              ? "Connect a new account"
              : step === "provider"
              ? `Select a ${selectedType} provider`
              : "Enter your account details"}
          </DialogTitle>
          <DialogDescription>
            {isConnecting
              ? `Connecting to ${selectedInstitution?.short_name ?? "your provider"}...`
              : step === "type"
              ? "Select the type of account you want to connect."
              : step === "provider"
              ? "Choose the platform you want to connect to."
              : `Enter your ${selectedInstitution?.short_name} account details to securely connect.`}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center gap-4 h-40">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Connecting to your {selectedInstitution?.short_name} ({selectedType}) account...
              </p>
            </div>
          ) : step === "type" ? (
            <div className="grid grid-cols-2 gap-4">
              {accountTypes.map((type) => (
                <Button
                  key={type.name}
                  variant="outline"
                  className="h-24 flex-col gap-2"
                  onClick={() => {
                    setSelectedType(type.name)
                    setStep("provider")
                  }}
                >
                  {type.icon}
                  <span>{type.name}</span>
                </Button>
              ))}
            </div>
          ) : step === "provider" ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("type")
                    setSelectedInstitution(null)
                  }}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[400px] overflow-y-auto">
                {(institutionsByType[selectedType ?? ""] ?? []).map((institution) => (
                  <Button
                    key={institution.id}
                    variant="outline"
                    className="h-24 flex-col gap-1 p-2 relative overflow-hidden"
                    onClick={() => {
                      setSelectedInstitution(institution)
                      setStep("details")
                    }}
                  >
                    {/* Display institution logo */}
                    <div className="relative w-full h-12 flex items-center justify-center mb-1">
                      <Image
                        src={institution.logo}
                        alt={institution.short_name}
                        width={48}
                        height={48}
                        className="object-contain opacity-90"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <span className="text-xs font-medium text-center line-clamp-2 w-full">
                      {institution.short_name}
                    </span>
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Details form step
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("provider")
                  }}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name (as registered with {selectedType?.toLowerCase()})</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="accountNumber">
                    {selectedType === "Bank" ? "Account Number" : "Account/Card Number"}
                  </Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder={selectedType === "Bank" ? "Enter your account number" : "Enter your account/card number"}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Verification Method</Label>
                  <RadioGroup
                    value={verificationMethod}
                    onValueChange={(value) => setVerificationMethod(value as "password" | "otp")}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="password" id="password" />
                      <Label htmlFor="password">Password</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="otp" id="otp" />
                      <Label htmlFor="otp">Send OTP</Label>
                    </div>
                  </RadioGroup>
                </div>

                {verificationMethod === "password" && (
                  <div className="space-y-2">
                    <Label htmlFor="passwordInput">Password</Label>
                    <Input
                      id="passwordInput"
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                )}

                {verificationMethod === "otp" && (
                  <div className="space-y-3">
                    {!isOtpSent ? (
                      <Button 
                        onClick={handleSendOtp}
                        variant="outline"
                        className="w-full"
                      >
                        Send OTP
                      </Button>
                    ) : (
                      <div className="space-y-2">
                        <Label htmlFor="otpInput">Enter OTP</Label>
                        <Input
                          id="otpInput"
                          type="text"
                          placeholder="Enter the OTP sent to your mobile"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          maxLength={6}
                        />
                      </div>
                    )}
                  </div>
                )}

                <Button
                  onClick={() => {
                    if (selectedType && selectedInstitution) {
                      handleConnect(selectedType, selectedInstitution)
                    }
                  }}
                  className="w-full"
                  disabled={
                    !fullName ||
                    !accountNumber ||
                    (verificationMethod === "password" && !password) ||
                    (verificationMethod === "otp" && (!isOtpSent || !otp))
                  }
                >
                  Connect Account
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
