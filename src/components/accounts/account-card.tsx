import { Account } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Banknote, Landmark, MoreVertical, Wallet, FlaskConical } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Image from "next/image";

type AccountCardProps = {
    account: Account;
    onDelete?: (accountId: string) => void;
}

const iconMap = {
    Bank: <Landmark className="h-6 w-6 text-muted-foreground" />,
    'E-Wallet': <Wallet className="h-6 w-6 text-muted-foreground" />,
    Cash: <Banknote className="h-6 w-6 text-muted-foreground" />,
}

/**
 * Demo Badge Component
 * Clearly indicates that an account is simulated/demo data
 */
function DemoBadge() {
    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
            <FlaskConical className="h-3 w-3" />
            Demo
        </span>
    );
}

export function AccountCard({ account, onDelete }: AccountCardProps) {
    return (
        <Card className={`shadow-sm hover:shadow-md transition-shadow ${account.isDemo ? 'border-amber-200 dark:border-amber-800/50' : ''}`}>
            <CardHeader className="p-4 md:p-6 flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div className="flex w-full items-start gap-3">
                    {/* Display institution logo if available, otherwise show icon */}
                    {account.institutionLogo ? (
                        <div className="relative w-10 h-10 flex items-center justify-center rounded-md bg-muted overflow-hidden">
                            {iconMap[account.type]}
                        </div>
                    ) : (
                        iconMap[account.type]
                    )}
                    <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                            <CardTitle className="truncate text-base md:text-lg">{account.name}</CardTitle>
                            {account.isDemo && <DemoBadge />}
                        </div>
                        <CardDescription className="truncate text-xs md:text-sm">
                            {account.institutionName || account.type} 
                            {account.lastFour && ` •••• ${account.lastFour}`}
                        </CardDescription>
                    </div>
                    {/* Amount on the right on mobile */}
                    <div className="ml-auto text-right md:hidden">
                        <div className="text-base font-semibold text-green-600">
                            {new Intl.NumberFormat("en-PH", {
                                style: "currency",
                                currency: "PHP",
                            }).format(account.balance)}
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="ml-1 h-8 w-8">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {account.isDemo ? (
                                <>
                                    <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                                        Demo accounts cannot sync
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                        className="text-destructive"
                                        onClick={() => onDelete?.(account.id)}
                                    >
                                        Remove Demo Account
                                    </DropdownMenuItem>
                                </>
                            ) : account.type === 'Cash' ? (
                                <DropdownMenuItem disabled className="text-muted-foreground text-xs">
                                    Default cash account
                                </DropdownMenuItem>
                            ) : (
                                <>
                                    <DropdownMenuItem>Refresh</DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive">
                                        Disconnect
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </CardHeader>
            <CardContent className="hidden md:block">
                <div className="hidden text-3xl font-bold text-green-600 md:block">
                    {new Intl.NumberFormat("en-PH", {
                        style: "currency",
                        currency: "PHP",
                    }).format(account.balance)}
                </div>
                <p className="hidden text-xs text-muted-foreground md:block">
                    {account.isDemo ? 'Simulated balance' : 'Current balance'}
                </p>
            </CardContent>
        </Card>
    );
}
