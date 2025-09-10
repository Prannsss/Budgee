"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = (
    <>
      <Link
        href="/pricing"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        prefetch={false}
        onClick={() => setIsOpen(false)}
      >
        Pricing
      </Link>
      <Link
        href="/login"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        prefetch={false}
        onClick={() => setIsOpen(false)}
      >
        Login
      </Link>
      <ThemeToggle />
      <Button asChild>
        <Link href="/signup">Get Started</Link>
      </Button>
    </>
  );

  return (
    <header className="px-4 lg:px-6 h-16 flex items-center bg-background/95 backdrop-blur-sm sticky top-0 z-50 border-b border-border">
      <Link href="/" className="flex items-center justify-center gap-2" prefetch={false}>
        <Logo className="h-6 w-6 text-primary" />
        <span className="text-lg font-semibold font-headline text-foreground">Budgee</span>
      </Link>
      <nav className="ml-auto hidden md:flex gap-4 sm:gap-6 items-center">
        {navLinks}
      </nav>
      <div className="ml-auto md:hidden flex items-center gap-2">
        <ThemeToggle />
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="bg-background border-border">
            <SheetHeader>
              <SheetTitle>Navigation Menu</SheetTitle>
            </SheetHeader>
            <div className="grid gap-4 py-6">
                {navLinks}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
