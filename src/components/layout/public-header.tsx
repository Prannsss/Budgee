"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/icons/logo";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { usePathname } from "next/navigation";

export default function PublicHeader() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleLogoClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleAboutClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname === "/") {
      e.preventDefault();
      const featuresSection = document.getElementById('features');
      if (featuresSection) {
        featuresSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const centerNavLinks = (
    <>
      <Link
        href="/#features"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={handleAboutClick}
      >
        About
      </Link>
      <ThemeToggle />
      <Link
        href="/pricing"
        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
      >
        Pricing
      </Link>
    </>
  );

  const rightAuthLinks = (
    <>
      <Button variant="ghost" asChild className="text-sm font-medium text-muted-foreground hover:text-foreground">
        <Link href="/login">Login</Link>
      </Button>
      <Button asChild className="rounded-full px-6">
        <Link href="/signup">Get Started</Link>
      </Button>
    </>
  );

  const mobileNavLinks = (
    <>
      <Link
        href="/#features"
        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
        onClick={(e) => {
            setIsOpen(false);
            handleAboutClick(e);
        }}
      >
        About
      </Link>
      <Link
        href="/pricing"
        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
        onClick={() => setIsOpen(false)}
      >
        Pricing
      </Link>
      <Link
        href="/login"
        className="text-lg font-medium text-muted-foreground hover:text-foreground transition-colors text-center"
        onClick={() => setIsOpen(false)}
      >
        Login
      </Link>
      <Button asChild size="lg" className="mx-auto rounded-full w-full">
        <Link href="/signup">Get Started</Link>
      </Button>
    </>
  );

  return (
    <div className="flex justify-center w-full p-6 fixed top-0 z-50 pointer-events-none">
        <header className="w-[95%] md:w-[75%] h-24 flex items-center justify-between px-6 md:px-10 bg-background/80 backdrop-blur-md border border-border rounded-full shadow-sm pointer-events-auto transition-all duration-200">
        <Link 
            href="/" 
            className="flex items-center gap-2" 
            prefetch={false}
            onClick={handleLogoClick}
        >
            <Logo className="h-12 w-12 text-primary" />
            <span className="text-lg font-bold font-headline text-foreground">Budgee</span>
        </Link>

        {/* Center Nav - Absolute positioned to be perfectly centered */}
        <nav className="hidden md:flex items-center gap-6 absolute left-1/2 transform -translate-x-1/2">
            {centerNavLinks}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-2">
            {rightAuthLinks}
        </div>

        {/* Mobile Menu */}
        <div className="md:hidden flex items-center gap-2 ml-auto">
            <ThemeToggle />
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                <Menu className="h-20 w-20" />
                <span className="sr-only">Toggle navigation menu</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-border">
                <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <div className="grid gap-6 py-6 place-items-center">
                    {mobileNavLinks}
                </div>
            </SheetContent>
            </Sheet>
        </div>
        </header>
    </div>
  );
}
