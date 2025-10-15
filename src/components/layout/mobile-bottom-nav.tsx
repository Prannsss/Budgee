"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Landmark, CreditCard, Bot, User, PiggyBank } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSubscription } from "@/contexts/subscription-context";

const baseItems = [
  { href: "/dashboard", label: "Home", Icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", Icon: Landmark },
  { href: "/dashboard/transactions", label: "Transactions", Icon: CreditCard },
  { href: "/dashboard/savings", label: "Savings", Icon: PiggyBank },
];

const aiItem = { href: "/dashboard/chat", label: "Chat", Icon: Bot };

export function MobileBottomNav() {
  const pathname = usePathname();
  const { isAIEnabled } = useSubscription();
  
  // Build navigation items based on plan
  const items = isAIEnabled ? [...baseItems, aiItem] : baseItems;
  const gridCols = isAIEnabled ? "grid-cols-6" : "grid-cols-5";

  return (
    <nav
    aria-label="Bottom navigation"
  className="fixed left-3 right-3 bottom-[calc(env(safe-area-inset-bottom,0px)+16px)] z-40 md:hidden"
    >
      <div
        className={cn(
          "rounded-3xl border bg-background/80 shadow-lg py-1",
          "backdrop-blur supports-[backdrop-filter]:bg-background/60"
        )}
      >
        <ul className={cn("grid", gridCols)}>
          {items.map(({ href, label, Icon }) => {
            const isActive = pathname === href;
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 py-2 px-2 transition-transform active:scale-95",
                    "text-xs font-medium min-h-[48px]",
                    isActive
                      ? "text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <span className={cn("relative inline-flex")}
                    aria-hidden
                  >
                    <Icon className="h-6 w-6" />
                    {isActive && (
                      <span className="absolute -bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary/60" />
                    )}
                  </span>
                  <span className="sr-only">{label}</span>
                </Link>
              </li>
            );
          })}
          {/* Profile menu */}
          <li>
            <Link
              href="/dashboard/profile"
              className={cn(
                "flex flex-col items-center justify-center gap-1 py-2 px-2 transition-transform active:scale-95",
                "text-xs font-medium min-h-[48px]",
                pathname === "/dashboard/profile"
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <span className="relative inline-flex" aria-hidden>
                <User className="h-6 w-6" />
                {pathname === "/dashboard/profile" && (
                  <span className="absolute -bottom-2 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-primary/60" />
                )}
              </span>
              <span className="sr-only">Profile</span>
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}
