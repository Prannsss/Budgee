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
import { Banknote, Landmark, Loader2, Plus, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const accountTypes = [
    { name: "Bank", icon: <Landmark className="h-8 w-8" /> },
    { name: "E-Wallet", icon: <Wallet className="h-8 w-8" /> },
    { name: "Crypto", icon: <Banknote className="h-8 w-8" /> },
]

export function ConnectAccountDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { toast } = useToast();

  const handleConnect = async (type: string) => {
    setSelectedType(type);
    setIsConnecting(true);
    // Simulate API call for connecting account
    await new Promise(resolve => setTimeout(resolve, 2500));
    setIsConnecting(false);
    setIsOpen(false);
    toast({
        title: "Connection Successful",
        description: `Your ${type} account has been connected.`,
    })
    setSelectedType(null);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" /> Connect Account
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Connect a new account</DialogTitle>
          <DialogDescription>
            Select the type of account you want to connect.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {isConnecting && selectedType ? (
                <div className="flex flex-col items-center justify-center gap-4 h-40">
                    <Loader2 className="h-12 w-12 animate-spin text-primary"/>
                    <p className="text-muted-foreground">Connecting to your {selectedType} account...</p>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-4">
                    {accountTypes.map(type => (
                        <Button
                            key={type.name}
                            variant="outline"
                            className="h-24 flex-col gap-2"
                            onClick={() => handleConnect(type.name)}
                        >
                            {type.icon}
                            <span>{type.name}</span>
                        </Button>
                    ))}
                </div>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
