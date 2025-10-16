"use client";

import Link from "next/link";
import {
  ArrowLeft,
  ChevronRight,
  User,
  ShieldCheck,
  Settings,
  HelpCircle,
  FileText,
  LogOut,
  Palette,
  Tags,
  Monitor,
  Moon,
  Sun,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useIsMobile } from "@/hooks/use-mobile";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { API } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const { logout, user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleThemeSelect = (selectedTheme: string) => {
    setTheme(selectedTheme);
    setThemeDialogOpen(false);
  };

  const handleDeleteClick = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    setIsDeleting(true);
    
    try {
      // Call delete account API
      await API.auth.deleteAccount();
      
      // Show success message first (before logout clears everything)
      toast({
        title: "Account Deleted",
        description: "Your account and all data have been permanently deleted.",
      });
      
      // Use the logout function to properly clear auth state
      await logout();
      
      // Small delay to allow logout to complete
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Redirect to signup page
      router.replace('/signup');
    } catch (error) {
      console.error('Error deleting account:', error);
      toast({
        title: "Error",
        description: "Failed to delete account. Please try again.",
        variant: "destructive",
      });
      setIsDeleting(false);
      setDeleteDialogOpen(false);
    }
  };

  const themeOptions = [
    {
      value: "light",
      label: "Light",
      icon: <Sun className="h-4 w-4" />,
      description: "Light mode",
    },
    {
      value: "dark",
      label: "Dark",
      icon: <Moon className="h-4 w-4" />,
      description: "Dark mode",
    },
    {
      value: "system",
      label: "System",
      icon: <Monitor className="h-4 w-4" />,
      description: "Follow system preference",
    },
  ];

  const ThemeSelector = () => (
    <div className="space-y-2">
      {themeOptions.map((option) => (
        <button
          key={option.value}
          onClick={() => handleThemeSelect(option.value)}
          className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors ${
            theme === option.value
              ? "border-primary bg-primary/5"
              : "border-border hover:bg-muted/50"
          }`}
        >
          {option.icon}
          <div className="flex-1 text-left">
            <div className="font-medium">{option.label}</div>
            <div className="text-sm text-muted-foreground">
              {option.description}
            </div>
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
        <h1 className="text-2xl font-bold tracking-tight font-headline">
          Profile
        </h1>
      </div>

      {/* Welcome Section */}
      <div>
        <p className="text-sm text-muted-foreground">Welcome,</p>
        <h2 className="text-xl font-bold text-foreground">
          {user ? `${user.firstName} ${user.lastName}!` : "Loading..."}
        </h2>
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
        <Drawer
          open={themeDialogOpen}
          onOpenChange={setThemeDialogOpen}
          shouldScaleBackground={false}
        >
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
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-3 p-4 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </Card>
      )}

      {/* Delete Account Section */}
      <Card className="p-6 border-red-200 dark:border-red-900">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-600 dark:text-red-500">Delete Account</h3>
              <p className="text-sm text-red-500 dark:text-red-400 mt-1">
                This will permanently delete your account and remove all your data.
              </p>
            </div>
          </div>
          <Button 
            variant="destructive" 
            onClick={handleDeleteClick}
            className="w-full"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Account
          </Button>
        </div>
      </Card>

      {/* Version Info */}
      <div className="text-center">
        <p className="text-xs text-muted-foreground">Version 1.20.0</p>
      </div>

      {/* Delete Account Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">We are sad to see you go :(</DialogTitle>
            <DialogDescription className="text-center pt-2">
              Are you sure you want to delete your account?
              <br />
              <br />
              <span className="text-red-600 dark:text-red-400 font-medium">
                This action cannot be undone. All your data will be permanently deleted.
              </span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <Button 
              variant="secondary" 
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={isDeleting}
              className="w-full sm:w-auto"
            >
              {isDeleting ? (
                <>
                  <span className="mr-2">Deleting...</span>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </>
              ) : (
                'Yes, delete my account'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Theme Selection Modal/Drawer */}
      {isMobile ? (
        <Drawer
          open={themeDialogOpen}
          onOpenChange={setThemeDialogOpen}
          shouldScaleBackground={false}
        >
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
