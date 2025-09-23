import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
// Notifications icon removed per requirement
import dynamic from "next/dynamic";
const ChatAssistant = dynamic(() => import("../ai/chat-assistant").then(m => m.ChatAssistant), {
  ssr: false,
  loading: () => null,
});
import { ThemeToggle } from "@/components/theme-toggle";

export default function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
  <header className="flex h-14 items-center gap-4 bg-background px-4 lg:px-6 sticky top-0 z-30">
  <SidebarTrigger className="hidden md:inline-flex" />
      <div className="w-full flex-1" />
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ChatAssistant />
  {/* Notifications removed per requirement */}
        <DropdownMenu onOpenChange={setIsProfileOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="secondary" size="icon" className="overflow-hidden rounded-full relative">
              <User className="h-4 w-4" />
              {isProfileOpen && (
                <span className="absolute -bottom-1 left-1/2 h-0.5 w-8 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Support</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
