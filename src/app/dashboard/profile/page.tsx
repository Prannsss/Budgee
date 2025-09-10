"use client";

import Link from "next/link";
import { ArrowLeft, ChevronRight, User, ShieldCheck, Settings, HelpCircle, FileText, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

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
    title: "Settings",
    href: "/dashboard/settings",
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
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Link href="/dashboard">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Profile</h1>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {/* Welcome Section */}
        <div>
          <p className="text-sm text-muted-foreground">Welcome,</p>
          <h2 className="text-xl font-bold text-foreground">France Velarde!</h2>
        </div>

        {/* Profile Sections */}
        <Card className="p-0 overflow-hidden">
          {profileSections.map((section, index) => (
            <div key={section.href}>
              <Link href={section.href}>
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
              {index < profileSections.length - 1 && <Separator />}
            </div>
          ))}
        </Card>

        {/* Logout Section */}
        <Card className="p-0 overflow-hidden">
          <button className="w-full flex items-center justify-center gap-3 p-4 text-red-600 hover:bg-red-50 transition-colors">
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </Card>

        {/* Version Info */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">Version 1.55.1 (1521)</p>
        </div>
      </div>
    </div>
  );
}
