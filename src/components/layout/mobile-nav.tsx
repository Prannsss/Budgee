// This component is no longer needed.
// The mobile navigation has been integrated into the header.
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Landmark, CreditCard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

const navItems = [
  { href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" />, label: "Dashboard" },
  { href: "/dashboard/accounts", icon: <Landmark className="h-5 w-5" />, label: "Accounts" },
  { href: "/dashboard/transactions", icon: <CreditCard className="h-5 w-5" />, label: "Transactions" },
];

export default function MobileNav() {
  return null;
}
