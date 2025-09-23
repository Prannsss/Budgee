"use client";

import { AppLoading } from "@/components/ui/loading";
import { usePathname } from "next/navigation";

export default function Loading() {
  const pathname = usePathname();

  if (pathname && pathname.startsWith("/pin-verify")) {
    return null;
  }

  return <AppLoading message="Initializing Budgee..." />;
}