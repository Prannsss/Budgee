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
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { ArrowLeft, Banknote, Landmark, Loader2, Plus, Wallet, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMockProviderData } from "@/lib/data";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useSubscription } from "@/contexts/subscription-context";
import { API } from "@/lib/api-service";
import bankInstitutions from "@/data/bankIns.json";
import { Institution, Account } from "@/lib/types";
import Image from "next/image";
import { DemoDisclaimerModal } from "./demo-disclaimer-modal";
import { DemoAccountForm } from "./demo-account-form";
import { UpgradePlanModal } from "./upgrade-plan-modal";
import { 
  generateDemoAccount, 
  saveDemoAccount,
  saveDemoTransactions, 
  getDemoAccounts,
  DEMO_UX_COPY 
} from "@/lib/demo-bank-service";

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
  const [step, setStep] = useState<"type" | "provider" | "disclaimer" | "demo-form" | "connecting" | "details">("type");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [connectionProgress, setConnectionProgress] = useState(0);
  const [connectionStatus, setConnectionStatus] = useState("");
  const [currentAccountCounts, setCurrentAccountCounts] = useState({ wallets: 0, banks: 0 });
  
  // Form state
  const [fullName, setFullName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [verificationMethod, setVerificationMethod] = useState<"password" | "otp">("password");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  
  const { toast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { currentPlan, getAccountLimits, canConnectAccount } = useSubscription();

  // Fetch current account counts when dialog opens
  useEffect(() => {
    const fetchAccountCounts = async () => {
      if (!isOpen || !user?.id) return;
      
      try {
        // Get API accounts
        const apiAccounts = await API.accounts.getAll();
        // Get demo accounts from local storage
        const demoAccounts = getDemoAccounts();
        
        // Combine and count
        const allAccounts = [...(apiAccounts || []), ...(demoAccounts || [])];
        
        // Don't count Cash accounts in the limit
        const countableAccounts = allAccounts.filter((acc: Account) => 
          acc.type !== 'Cash' && acc.name !== 'Cash'
        );
        
        const wallets = countableAccounts.filter((acc: Account) => acc.type === 'E-Wallet').length;
        const banks = countableAccounts.filter((acc: Account) => acc.type === 'Bank').length;
        
        setCurrentAccountCounts({ wallets, banks });
      } catch (error) {
        console.error('Error fetching account counts:', error);
      }
    };
    
    fetchAccountCounts();
  }, [isOpen, user?.id]);

  const handleSendOtp = async () => {
    // Simulate OTP sending
    setIsOtpSent(true);
    toast({
      title: "OTP Sent",
      description: "Please check your registered mobile number for the OTP.",
    });
  };

  // Handle demo account creation with realistic connecting animation
  const handleDemoConnect = async (formData: { nickname: string; initialBalance: number }) => {
    if (!user?.id || !selectedInstitution || !selectedType) {
      toast({
        title: "Error",
        description: "Missing required information. Please try again.",
        variant: "destructive",
      });
      return;
    }

    // Re-check account limits before creating (to handle race conditions)
    try {
      const apiAccounts = await API.accounts.getAll();
      const demoAccounts = getDemoAccounts();
      const allAccounts = [...(apiAccounts || []), ...(demoAccounts || [])];
      
      // Don't count Cash accounts in the limit
      const countableAccounts = allAccounts.filter((acc: Account) => 
        acc.type !== 'Cash' && acc.name !== 'Cash'
      );
      
      const currentTotal = countableAccounts.length;
      const limits = getAccountLimits();
      
      if (limits.maxTotal !== -1 && currentTotal >= limits.maxTotal) {
        toast({
          title: "Account Limit Reached",
          description: `You can only connect up to ${limits.maxTotal} accounts on your current plan. Please upgrade to add more.`,
          variant: "destructive",
        });
        setShowUpgradeModal(true);
        return;
      }
    } catch (error) {
      console.error('Error checking account limits:', error);
    }

    setStep("connecting");
    setIsConnecting(true);
    setConnectionProgress(0);

    // Simulate realistic connection process
    const steps = [
      { progress: 15, status: "Initiating secure connection..." },
      { progress: 35, status: `Connecting to ${selectedInstitution.short_name}...` },
      { progress: 55, status: "Verifying account access..." },
      { progress: 75, status: "Retrieving account information..." },
      { progress: 90, status: "Generating sample transactions..." },
      { progress: 100, status: "Finalizing setup..." },
    ];

    for (const stepData of steps) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 300));
      setConnectionProgress(stepData.progress);
      setConnectionStatus(stepData.status);
    }

    // Generate and save demo account
    const demoAccount = generateDemoAccount({
      accountType: selectedType as 'Bank' | 'E-Wallet',
      institution: selectedInstitution,
      nickname: formData.nickname,
      initialBalance: formData.initialBalance
    });

    saveDemoAccount(demoAccount.account);
    saveDemoTransactions(demoAccount.transactions);

    await new Promise(resolve => setTimeout(resolve, 500));

    setIsConnecting(false);
    setIsOpen(false);
    
    // Notify app components to refresh data
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
      window.dispatchEvent(new CustomEvent('accounts:updated'));
    }
    
    router.refresh();
    toast({
      title: DEMO_UX_COPY.success.title,
      description: `Your ${selectedInstitution.short_name} demo account is ready with sample transactions.`,
    });
    
    resetForm();
  };

  // Handler when user selects a provider - show disclaimer first
  const handleProviderSelect = (institution: Institution) => {
    setSelectedInstitution(institution);
    setShowDisclaimer(true);
  };

  // Handler when user acknowledges the disclaimer
  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    setStep("demo-form");
  };

  // Handler when user cancels the disclaimer
  const handleDisclaimerCancel = () => {
    setShowDisclaimer(false);
    setSelectedInstitution(null);
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

    setStep("connecting");
    setIsConnecting(true);
    setConnectionProgress(0);

    // Simulate realistic connection process
    const steps = [
      { progress: 20, status: "Initiating secure connection..." },
      { progress: 40, status: `Connecting to ${institution.short_name}...` },
      { progress: 60, status: "Verifying credentials..." },
      { progress: 80, status: "Retrieving account data..." },
      { progress: 100, status: "Finalizing..." },
    ];

    for (const stepData of steps) {
      await new Promise(resolve => setTimeout(resolve, 400 + Math.random() * 200));
      setConnectionProgress(stepData.progress);
      setConnectionStatus(stepData.status);
    }
    
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
    setConnectionProgress(0);
    setConnectionStatus("");
    setShowDisclaimer(false);
  };

  return (
    <>
      {/* Demo Disclaimer Modal */}
      <DemoDisclaimerModal
        isOpen={showDisclaimer}
        onContinue={handleDisclaimerAccept}
        onCancel={handleDisclaimerCancel}
      />

      {/* Upgrade Plan Modal */}
      <UpgradePlanModal
        open={showUpgradeModal}
        onOpenChange={setShowUpgradeModal}
        currentPlan={currentPlan}
        limitType="accounts"
      />

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
              {step === "connecting"
                ? "Connecting your account"
                : step === "type"
                ? "Connect a new account"
                : step === "provider"
                ? `Select a ${selectedType} provider`
                : step === "demo-form"
                ? "Connect your account"
                : "Enter your account details"}
            </DialogTitle>
            <DialogDescription>
              {step === "connecting"
                ? `Connecting to your ${selectedInstitution?.short_name ?? ""} account...`
                : step === "type"
                ? "Select the type of account you want to connect."
                : step === "provider"
                ? "Choose the platform you want to connect to."
                : step === "demo-form"
                ? "Connect your account to start tracking."
                : `Enter your ${selectedInstitution?.short_name} account details to securely connect.`}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {step === "connecting" ? (
              <div className="flex flex-col items-center justify-center gap-6 py-8">
                {/* Animated loader with progress */}
                <div className="relative">
                  <Loader2 className="h-16 w-16 animate-spin text-primary" />
                  {connectionProgress === 100 && (
                    <CheckCircle2 className="h-16 w-16 text-green-500 absolute inset-0 animate-in fade-in zoom-in" />
                  )}
                </div>
                
                {/* Progress bar */}
                <div className="w-full max-w-xs space-y-2">
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-300 ease-out rounded-full"
                      style={{ width: `${connectionProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    {connectionStatus || "Preparing..."}
                  </p>
                </div>

                {/* Demo indicator */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                    Demo
                  </span>
                  <span>Creating simulated data</span>
                </div>
              </div>
            ) : step === "demo-form" && selectedInstitution && selectedType ? (
              <DemoAccountForm
                institution={selectedInstitution}
                accountType={selectedType as 'Bank' | 'E-Wallet'}
                onSubmit={handleDemoConnect}
                onBack={() => setStep("provider")}
                isLoading={isConnecting}
              />
            ) : step === "type" ? (
            <div className="grid grid-cols-2 gap-4">
              {accountTypes.map((type) => {
                // Check if user can connect more accounts (total limit)
                const limits = getAccountLimits();
                const total = currentAccountCounts.wallets + currentAccountCounts.banks;
                
                let isDisabled = false;
                let disabledReason = "";
                
                // Check total account limit (applies to all plans except Premium)
                if (limits.maxTotal !== -1 && total >= limits.maxTotal) {
                  isDisabled = true;
                  disabledReason = "Account limit reached";
                }
                
                return (
                  <Button
                    key={type.name}
                    variant="outline"
                    className={`h-24 flex-col gap-2 ${isDisabled ? 'opacity-50' : ''}`}
                    onClick={() => {
                      if (isDisabled) {
                        setShowUpgradeModal(true);
                        return;
                      }
                      setSelectedType(type.name)
                      setStep("provider")
                    }}
                  >
                    {type.icon}
                    <span>{type.name}</span>
                    {isDisabled && (
                      <span className="text-[10px] text-muted-foreground">{disabledReason}</span>
                    )}
                  </Button>
                );
              })}
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
                
                {/* Demo mode indicator */}
                <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Demo Mode
                </span>
              </div>
              
              {/* Demo explanation banner */}
              <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                <strong>Demo accounts</strong> let you explore Budgee with realistic sample data. 
                No real bank credentials required.
              </div>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[350px] overflow-y-auto">
                {(institutionsByType[selectedType ?? ""] ?? []).map((institution) => (
                  <Button
                    key={institution.id}
                    variant="outline"
                    className="h-24 flex-col gap-1 p-2 relative overflow-hidden"
                    onClick={() => handleProviderSelect(institution)}
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
    </>
  );
}
