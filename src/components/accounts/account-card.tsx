import { Account } from "@/lib/types";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Banknote, Landmark, MoreVertical, Wallet } from "lucide-react";
import { Button } from "../ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";

type AccountCardProps = {
    account: Account;
}

const iconMap = {
    Bank: <Landmark className="h-6 w-6 text-muted-foreground" />,
    'E-Wallet': <Wallet className="h-6 w-6 text-muted-foreground" />,
    Crypto: <Banknote className="h-6 w-6 text-muted-foreground" />,
}

export function AccountCard({ account }: AccountCardProps) {
    return (
        <Card className="shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between">
                <div className="flex items-center gap-4">
                    {iconMap[account.type]}
                    <div>
                        <CardTitle>{account.name}</CardTitle>
                        <CardDescription>{account.type} •••• {account.lastFour}</CardDescription>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Refresh</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                            Disconnect
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                        style: "currency",
                        currency: "USD",
                    }).format(account.balance)}
                </div>
                <p className="text-xs text-muted-foreground">
                    Current balance
                </p>
            </CardContent>
        </Card>
    )
}
