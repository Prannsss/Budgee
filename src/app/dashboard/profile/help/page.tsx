"use client";

import Link from "next/link";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const helpCategories = [
  {
    title: "Getting Started",
    items: [
      "How to set up your account",
      "Connecting your bank accounts",
      "Understanding your dashboard",
    ],
  },
  {
    title: "Transactions",
    items: [
      "How to categorize transactions",
      "Setting up recurring transactions",
      "Splitting transactions",
    ],
  },
  {
    title: "Budgeting",
    items: [
      "Creating your first budget",
      "Setting spending limits",
      "Budget tracking tips",
    ],
  },
  {
    title: "Security",
    items: [
      "Two-factor authentication",
      "Account security best practices",
      "What to do if your account is compromised",
    ],
  },
];

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Help Center</h1>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        {helpCategories.map((category, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="text-lg">{category.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {category.items.map((item, itemIndex) => (
                  <button
                    key={itemIndex}
                    className="flex w-full items-center justify-between p-3 text-left rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{item}</span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}

        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="space-y-2">
              <Button className="w-full">Chat with Support</Button>
              <Button variant="outline" className="w-full">Email Support</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
