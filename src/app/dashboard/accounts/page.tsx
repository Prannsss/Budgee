import { mockAccounts } from "@/lib/data";
import { ConnectAccountDialog } from "@/components/accounts/connect-account-dialog";
import { AccountCard } from "@/components/accounts/account-card";

export default function AccountsPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight font-headline">Accounts</h1>
                    <p className="text-muted-foreground">
                        Manage your connected bank accounts, e-wallets, and crypto wallets.
                    </p>
                </div>
                <ConnectAccountDialog />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {mockAccounts.map(account => (
                    <AccountCard key={account.id} account={account} />
                ))}
            </div>
        </div>
    )
}
