"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="h-9 w-9 relative overflow-hidden group hover:bg-accent transition-colors theme-toggle-button"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
    >
      <div className="relative w-4 h-4 theme-toggle-icon">
        <Sun className={`h-4 w-4 absolute inset-0 transition-all duration-500 ease-in-out ${
          theme === "dark" 
            ? "rotate-0 scale-100 opacity-100" 
            : "rotate-90 scale-0 opacity-0"
        }`} />
        <Moon className={`h-4 w-4 absolute inset-0 transition-all duration-500 ease-in-out ${
          theme === "dark" 
            ? "-rotate-90 scale-0 opacity-0" 
            : "rotate-0 scale-100 opacity-100"
        }`} />
      </div>
      {/* Ripple effect on hover */}
      <span className="absolute inset-0 rounded-md bg-primary/10 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out" />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
