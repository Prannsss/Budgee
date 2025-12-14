"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

// Helper function to reset scroll styles
const resetScrollStyles = () => {
  if (typeof document !== 'undefined') {
    // Reset all potential scroll-blocking styles
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    
    // Also remove any potential classes that could block scroll
    document.body.classList.remove('overflow-hidden', 'fixed', 'inset-0');
    document.documentElement.classList.remove('overflow-hidden', 'fixed', 'inset-0');
  }
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Reset scroll when theme changes
  React.useEffect(() => {
    if (mounted && theme) {
      // Delay the scroll reset to ensure theme transition completes
      const timeoutId = setTimeout(() => {
        resetScrollStyles();
      }, 100);
      
      return () => clearTimeout(timeoutId);
    }
  }, [theme, mounted]);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <Sun className="h-4 w-4" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  const handleThemeToggle = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Immediate scroll reset
    resetScrollStyles();
    
    // Additional delayed resets to catch any late scroll locks
    requestAnimationFrame(() => {
      resetScrollStyles();
    });
    
    setTimeout(() => {
      resetScrollStyles();
    }, 50);
    
    setTimeout(() => {
      resetScrollStyles();
    }, 200);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleThemeToggle}
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
