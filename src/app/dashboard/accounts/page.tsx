"use client";

import { mockAccounts } from "@/lib/data";
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useState } from "react";

export default function AccountsPage() {
    const isMobile = useIsMobile();
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Accounts</h1>
                    <p className="text-muted-foreground hidden md:block">
                        Manage your connected bank accounts and e-wallets.
                    </p>
                </div>
                {!isMobile && <ConnectAccountDialog />}
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                {mockAccounts.map(account => (
                    <AccountCard key={account.id} account={account} />
                ))}
            </div>

            {/* Mobile Floating Action Button */}
            {isMobile && (
                <ConnectAccountDialog 
                    trigger={
                        <Button
                            size="icon"
                            className="fixed bottom-24 right-4 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-50"
                        >
                            <Plus className="h-6 w-6" />
                        </Button>
                    }
                />
            )}
        </div>
    );
}
