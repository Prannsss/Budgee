"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, User, ShieldCheck, Settings, HelpCircle, FileText, LogOut, Palette, Tags, Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

const profileSections = [
  {
    icon: User,
    title: "Personal information",
    href: "/dashboard/profile/personal",
  },
  {
    icon: ShieldCheck,
    title: "Limits",
    href: "/dashboard/profile/limits",
  },
  {
    icon: Settings,
    title: "Your Plan",
    href: "/dashboard/settings",
  },
  {
    icon: Palette,
    title: "Theme",
    href: null, // This will be handled as a special case
    isTheme: true,
  },
  {
    icon: Tags,
    title: "Categories",
    href: "/dashboard/categories",
  },
  {
    icon: HelpCircle,
    title: "Help center",
    href: "/dashboard/profile/help",
  },
  {
    icon: FileText,
    title: "Terms and conditions",
    href: "/dashboard/profile/terms",
  },
];

export default function ProfilePage() {
  const isMobile = useIsMobile();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [themeDialogOpen, setThemeDialogOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setThemeDialogOpen(false);
  };

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      icon: <Sun className="h-4 w-4" />,
      description: "Light mode"
    },
    {
      value: "dark", 
      label: "Dark",
      icon: <Moon className="h-4 w-4" />,
      description: "Dark mode"
    },
    {
      value: "system",
      label: "System",
      icon: <Monitor className="h-4 w-4" />,
      description: "Follow system preference"
    }
  ];

  const ThemeSelector = () => (
    <div className="space-y-2">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleThemeSelect(option.value)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            theme === option.value 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:bg-muted/50'
          }`}
        >
          {option.icon}
          <div className="flex-1 text-left">
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground">{option.description}</div>
          </div>
          {theme === option.value && (
            <div className="h-2 w-2 rounded-full bg-primary" />
          )}
        </button>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight font-headline">Profile</h1>
      </div>

      {/* Welcome Section */}
      <div>
        <p className="text-sm text-muted-foreground">Welcome,</p>
        <h2 className="text-xl font-bold text-foreground">France Velarde!</h2>
      </div>

        {/* Profile Sections */}
        <Card className="p-0 overflow-hidden">
          {profileSections.map((section, index) => (
            <div key={section.title}>
              {section.isTheme ? (
                <button 
                  onClick={() => setThemeDialogOpen(true)}
                  className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8">
                      <section.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <span className="font-medium">{section.title}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ) : (
                <Link href={section.href!}>
                  <div className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center justify-center w-8 h-8">
                        <section.icon className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="font-medium">{section.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Link>
              )}
              {index < profileSections.length - 1 && <Separator />}
            </div>
          ))}
        </Card>

        {/* Theme Selection Modal/Drawer */}
        {isMobile ? (
          <Drawer open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Choose Theme</DrawerTitle>
              </DrawerHeader>
              <div className="p-4">
                <ThemeSelector />
              </div>
            </DrawerContent>
          </Drawer>
        ) : (
          <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Choose Theme</DialogTitle>
              </DialogHeader>
              <div className="pt-4">
                <ThemeSelector />
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Logout Section - Only show on mobile */}
        {isMobile && (
          <Card className="p-0 overflow-hidden">
            <button className="w-full flex items-center justify-center gap-3 p-4 text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </Card>
        )}

        {/* Version Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Version 1.55.1 (1521)</p>
        </div>

      {/* Theme Selection Modal/Drawer */}
      {isMobile ? (
        <Drawer open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Choose Theme</DrawerTitle>
            </DrawerHeader>
            <div className="p-4">
              <ThemeSelector />
            </div>
          </DrawerContent>
        </Drawer>
      ) : (
        <Dialog open={themeDialogOpen} onOpenChange={setThemeDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Choose Theme</DialogTitle>
            </DialogHeader>
            <div className="pt-4">
              <ThemeSelector />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
