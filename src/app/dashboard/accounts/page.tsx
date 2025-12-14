"use client";

import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";
import { DemoCardCarousel } from "@/components/accounts/demo-card-carousel";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Landmark } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/contexts/auth-context";
import { API } from "@/lib/api-service";
import { Account } from "@/lib/types";
import { SkeletonAccountCard } from "@/components/ui/skeleton-components";
import { getDemoAccounts, deleteDemoAccount } from "@/lib/demo-bank-service";
import { useToast } from "@/hooks/use-toast";

export default function AccountsPage() {
    const isMobile = useIsMobile();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { user } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        if (!user?.id) return;

        const loadAccounts = async () => {
            setIsLoading(true);
            // Simulate loading delay for better UX
            await new Promise(resolve => setTimeout(resolve, 300));
            
            try {
                // Load both API accounts and demo accounts
                const [userAccounts, demoAccounts] = await Promise.all([
                    API.accounts.getAll(),
                    Promise.resolve(getDemoAccounts())
                ]);
                
                // Combine API accounts and demo accounts
                const allAccounts = [
                    ...(Array.isArray(userAccounts) ? userAccounts : []),
                    ...(Array.isArray(demoAccounts) ? demoAccounts : [])
                ];
                
                setAccounts(allAccounts);
            } catch (error) {
                console.error('Error loading accounts:', error);
                setAccounts([]);
            } finally {
                setIsLoading(false);
            }
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

    // Handle demo account deletion
    const handleDeleteDemoAccount = (accountId: string) => {
        try {
            deleteDemoAccount(accountId);
            setAccounts(prev => prev.filter(acc => acc.id !== accountId));
            toast({
                title: "Demo Account Removed",
                description: "The demo account has been removed from your local storage.",
            });
        } catch (error) {
            console.error('Error deleting demo account:', error);
            toast({
                title: "Error",
                description: "Failed to remove demo account. Please try again.",
                variant: "destructive",
            });
        }
    };

    // Separate demo and regular accounts
    const demoAccounts = useMemo(() => accounts.filter(acc => acc.isDemo), [accounts]);
    const regularAccounts = useMemo(() => accounts.filter(acc => !acc.isDemo), [accounts]);

    return (
        <div className="flex flex-col gap-6">
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
                <div className="space-y-6">
                    {/* Regular Accounts Grid - Show first */}
                    {regularAccounts.length > 0 && (
                        <div className="grid gap-3 md:grid-cols-2">
                            {regularAccounts.map(account => (
                                <AccountCard 
                                    key={account.id} 
                                    account={account}
                                />
                            ))}
                        </div>
                    )}

                    {/* Demo Cards Carousel - Show below */}
                    {demoAccounts.length > 0 && (
                        <div>
                            <h2 className="text-lg font-semibold mb-1">Your Connected Accounts</h2>
                            <p className="text-xs text-muted-foreground mb-2">
                                Swipe to view your connected accounts
                            </p>
                            <DemoCardCarousel 
                                accounts={demoAccounts} 
                                onDeleteAccount={handleDeleteDemoAccount}
                            />
                        </div>
                    )}
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
