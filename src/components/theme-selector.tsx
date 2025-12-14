"use client";

import * as React from "react";
import { Monitor, Moon, Sun, ChevronRight } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const isMobile = useIsMobile();

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const getThemeDisplay = () => {
    switch (theme) {
      case "light":
        return { icon: <Sun className="h-4 w-4" />, label: "Light" };
      case "dark":
        return { icon: <Moon className="h-4 w-4" />, label: "Dark" };
      case "system":
        return { icon: <Monitor className="h-4 w-4" />, label: "System" };
      default:
        return { icon: <Monitor className="h-4 w-4" />, label: "System" };
    }
  };

// Helper function to reset scroll styles (PWA fix)
const resetScrollStyles = () => {
  if (typeof document !== 'undefined') {
    document.body.style.overflow = '';
    document.body.style.position = '';
    document.body.style.width = '';
    document.body.style.height = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.documentElement.style.overflow = '';
    document.documentElement.style.position = '';
    document.body.classList.remove('overflow-hidden', 'fixed', 'inset-0');
    document.documentElement.classList.remove('overflow-hidden', 'fixed', 'inset-0');
  }
};

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setOpen(false);
    
    // Reset scroll after theme change and drawer close
    setTimeout(() => {
      resetScrollStyles();
    }, 100);
    
    setTimeout(() => {
      resetScrollStyles();
    }, 300);
  };

  const ThemeOptions = () => (
    <div className="space-y-2">
      <Button
        variant={theme === "light" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleThemeSelect("light")}
        className="w-full justify-start"
      >
        <Sun className="h-4 w-4 mr-3" />
        Light
      </Button>
      <Button
        variant={theme === "dark" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleThemeSelect("dark")}
        className="w-full justify-start"
      >
        <Moon className="h-4 w-4 mr-3" />
        Dark
      </Button>
      <Button
        variant={theme === "system" ? "default" : "ghost"}
        size="sm"
        onClick={() => handleThemeSelect("system")}
        className="w-full justify-start"
      >
        <Monitor className="h-4 w-4 mr-3" />
        System
      </Button>
    </div>
  );

  if (!mounted) {
    return (
      <Button variant="ghost" className="w-full justify-between p-3">
        <div className="flex items-center gap-3">
          <Monitor className="h-4 w-4" />
          <span>System</span>
        </div>
        <ChevronRight className="h-4 w-4" />
      </Button>
    );
  }

  const currentTheme = getThemeDisplay();

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen} shouldScaleBackground={false}>
        <DrawerTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-3">
            <div className="flex items-center gap-3">
              {currentTheme.icon}
              <span>{currentTheme.label}</span>
            </div>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Choose Theme</DrawerTitle>
          </DrawerHeader>
          <div className="p-4 pb-8">
            <ThemeOptions />
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-between p-3">
          <div className="flex items-center gap-3">
            {currentTheme.icon}
            <span>{currentTheme.label}</span>
          </div>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[300px]">
        <DialogHeader>
          <DialogTitle>Choose Theme</DialogTitle>
        </DialogHeader>
        <div className="p-2">
          <ThemeOptions />
        </div>
      </DialogContent>
    </Dialog>
  );
}
