"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Landmark, CreditCard, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "../ui/dropdown-menu";

const items = [
  { href: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", Icon: Landmark },
  { href: "/dashboard/transactions", label: "Transactions", Icon: CreditCard },
  { href: "/dashboard/chat", label: "Chat", Icon: Bot },
];

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
    aria-label="Bottom navigation"
  className="fixed left-4 right-4 bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] z-40 md:hidden"
    >
      <div
        className={cn(
          "rounded-2xl border bg-background/80 shadow-lg",
          "backdrop-blur supports-[backdrop-filter]:bg-background/60"
        )}
      >
        <ul className="grid grid-cols-5">
          {items.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 transition-transform active:scale-95",
                    "text-xs font-medium",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("relative inline-flex")}
                    aria-hidden
                  >
                    <Icon className="h-5 w-5" />
                    {isActive && (
                      <span className="absolute -bottom-2 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-primary/60" />
                    )}
                  </span>
                  <span>{label}</span>
                </Link>
              </li>
            );
          })}
          {/* Profile menu */}
          <li>
            <div className="flex flex-col items-center justify-center gap-1 py-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="h-auto w-auto p-0">
                    <Avatar className="h-5 w-5">
                      <AvatarImage src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="@user" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuItem>Support</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <span className="text-xs font-medium text-muted-foreground">Profile</span>
            </div>
          </li>
        </ul>
      </div>
    </nav>
  );
}
