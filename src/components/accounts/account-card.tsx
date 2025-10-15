import { Account } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Banknote, Landmark, MoreVertical, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import Image from "next/image";

type AccountCardProps = {
    account: Account;
}

const iconMap = {
    Bank: <Landmark className="h-6 w-6 text-muted-foreground" />,
    'E-Wallet': <Wallet className="h-6 w-6 text-muted-foreground" />,
    Cash: <Banknote className="h-6 w-6 text-muted-foreground" />,
}

export function AccountCard({ account }: AccountCardProps) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
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
                    <div className="min-w-0">
                        <CardTitle className="truncate text-base md:text-lg">{account.name}</CardTitle>
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
                            <DropdownMenuItem>Refresh</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive">
                                Disconnect
                            </DropdownMenuItem>
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
                <p className="hidden text-xs text-muted-foreground md:block">Current balance</p>
            </CardContent>
        </Card>
    );
}
