"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Wallet,
  Landmark,
  Settings,
  HelpCircle,
  LogOut,
  CreditCard,
  User,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useSidebar, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { useSubscription } from "@/contexts/subscription-context";
import { useAuth } from "@/contexts/auth-context";
import { TransactionService } from "@/lib/storage-service";

const baseNavItems = [
    { href: "/dashboard", icon: <LayoutDashboard />, label: "Dashboard" },
    { href: "/dashboard/accounts", icon: <Landmark />, label: "Accounts" },
    { href: "/dashboard/transactions", icon: <CreditCard />, label: "Transactions" },
];

const aiNavItem = { href: "/dashboard/chat", icon: <Bot />, label: "Budgee AI" };

const settingsItems = [
  { href: "/dashboard/profile", icon: <User />, label: "Profile" },
];

export function SidebarNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isAIEnabled } = useSubscription();
  const { logout, user } = useAuth();
  
  // Build navigation items based on plan
  const navItems = isAIEnabled ? [...baseNavItems, aiNavItem] : baseNavItems;

  const handleLogout = () => {
    if (user?.id) {
      // Clear user data but keep it available if they log back in
      // TransactionService.clearUserData(user.id); // Uncomment if you want to clear data on logout
    }
    logout();
    router.push('/login');
  };

  const renderLink = (item: any) => (
    <SidebarMenuItem key={item.label}>
      <Link href={item.href}>
          <SidebarMenuButton 
            isActive={pathname === item.href}
            tooltip={{children: item.label}}
          >
              {item.icon}
              <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
          </SidebarMenuButton>
      </Link>
    </SidebarMenuItem>
  );

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1">
        <SidebarMenu className="px-2 pt-2 text-sm font-medium lg:px-4">
          {navItems.map(renderLink)}
        </SidebarMenu>
      </div>
      <div className="mt-auto p-4 border-t">
         <SidebarMenu className="grid items-start gap-1 px-2 text-sm font-medium lg:px-4">
            {settingsItems.map(renderLink)}
             <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={handleLogout}
                  tooltip={{children: 'Logout'}}
                  className="bg-red-600/90 hover:bg-red-600 text-white focus-visible:ring-red-600 transition-colors cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    <span className="group-data-[collapsible=icon]:hidden">Logout</span>
                </SidebarMenuButton>
             </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </div>
  );
}
