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
import { ArrowLeft, Banknote, Landmark, Loader2, Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getMockProviderData, mockAccounts, mockTransactions } from "@/lib/data";
import { useRouter } from "next/navigation";

const accountTypes = [
    { name: "Bank", icon: <Landmark className="h-8 w-8" /> },
    { name: "E-Wallet", icon: <Wallet className="h-8 w-8" /> },
]

const providersByType: Record<string, string[]> = {
  "Bank": [
    "BPI",
    "BDO",
    "LandBank",
    "Metrobank",
    "UnionBank",
    "Security Bank",
    "EastWest",
  ],
  "E-Wallet": [
    "GCash",
    "Maya",
    "GrabPay",
    "ShopeePay",
    "PayPal",
    "Wise",
  ],
}

export function ConnectAccountDialog({ trigger }: { trigger?: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [step, setStep] = useState<"type" | "provider">("type");
  const { toast } = useToast();
  const router = useRouter();

  const handleConnect = async (type: string, provider: string) => {
    setIsConnecting(true);
    // Simulate API call for connecting account
    await new Promise(resolve => setTimeout(resolve, 2500));
    // Generate mock account + transactions and append to in-memory lists
    const { account, transactions } = getMockProviderData(type as any, provider);
    mockAccounts.push(account);
    mockTransactions.push(...transactions);
    setIsConnecting(false);
    setIsOpen(false);
    // Notify app and refresh the current route to re-render server components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('accounts:updated'))
    }
    router.refresh();
    toast({
        title: "Connection Successful",
        description: `Your ${provider} (${type}) account has been connected.`,
    })
    // Reset state
    setSelectedType(null);
    setSelectedProvider(null);
    setStep("type");
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
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
              : `Select a ${selectedType} provider`}
          </DialogTitle>
          <DialogDescription>
            {isConnecting
              ? `Connecting to ${selectedProvider ?? "your provider"}...`
              : step === "type"
              ? "Select the type of account you want to connect."
              : "Choose the platform you want to connect to."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          {isConnecting ? (
            <div className="flex flex-col items-center justify-center gap-4 h-40">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                Connecting to your {selectedProvider} ({selectedType}) account...
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
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setStep("type")
                    setSelectedProvider(null)
                  }}
                  className="gap-2"
                >
                  <ArrowLeft className="h-4 w-4" /> Back
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {(providersByType[selectedType ?? ""] ?? []).map((provider) => (
                  <Button
                    key={provider}
                    variant="outline"
                    className="h-20 flex-col gap-1"
                    onClick={() => {
                      setSelectedProvider(provider)
                      if (selectedType) {
                        handleConnect(selectedType, provider)
                      }
                    }}
                  >
                    {/* Reuse icons per type for now */}
                    {selectedType === "Bank" && <Landmark className="h-6 w-6" />}
                    {selectedType === "E-Wallet" && <Wallet className="h-6 w-6" />}
                    <span className="text-sm">{provider}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
