"use client";

import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/auth-context";
import { TransactionService } from "@/lib/storage-service";
import { Account } from "@/lib/types";
import { SkeletonAccountCard } from "@/components/ui/skeleton-components";

export default function AccountsPage() {
    const isMobile = useIsMobile();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();

    useEffect(() => {
        if (!user?.id) return;

        const loadAccounts = async () => {
            setIsLoading(true);
            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            const userAccounts = TransactionService.getAccounts(user.id);
            setAccounts(userAccounts);
            setIsLoading(false);
        };

        loadAccounts();

        // Listen for account updates
        const handleAccountUpdate = () => loadAccounts();
        window.addEventListener('budgee:dataUpdate', handleAccountUpdate);
        window.addEventListener('accounts:updated', handleAccountUpdate);
        
        return () => {
            window.removeEventListener('budgee:dataUpdate', handleAccountUpdate);
            window.removeEventListener('accounts:updated', handleAccountUpdate);
        };
    }, [user?.id]);

    return (
        <div className="space-y-6 px-4 md:px-0">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Accounts</h1>
                    <p className="text-muted-foreground hidden md:block">
                        Manage your connected bank accounts and e-wallets.
                    </p>
                </div>
                {!isMobile && <ConnectAccountDialog />}
            </div>

            {isLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonAccountCard key={i} />
                    ))}
                </div>
            ) : accounts.length > 0 ? (
                <div className="grid gap-3 md:grid-cols-2">
                    {accounts.map(account => (
                        <AccountCard key={account.id} account={account} />
                    ))}
                </div>
            ) : (
                <Card>
                    <CardHeader className="text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                            <Landmark className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <CardTitle>No accounts connected</CardTitle>
                        <CardDescription>
                            Connect your bank accounts and e-wallets to start tracking your finances.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                        <ConnectAccountDialog 
                            trigger={
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Connect Your First Account
                                </Button>
                            }
                        />
                    </CardContent>
                </Card>
            )}

            {/* Mobile Floating Action Button */}
            {isMobile && !isLoading && accounts.length > 0 && (
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
