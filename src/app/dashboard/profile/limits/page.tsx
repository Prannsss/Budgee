"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export default function LimitsPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="flex items-center gap-4 px-4 py-4 border-b">
        <Link href="/dashboard/profile">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-lg font-semibold">Limits</h1>
      </header>

      {/* Main Content */}
      <div className="p-4 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Spending Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Daily Limit</span>
                <span className="text-sm text-muted-foreground">$250 / $500</span>
              </div>
              <Progress value={50} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Weekly Limit</span>
                <span className="text-sm text-muted-foreground">$1,200 / $2,000</span>
              </div>
              <Progress value={60} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Monthly Limit</span>
                <span className="text-sm text-muted-foreground">$3,500 / $8,000</span>
              </div>
              <Progress value={43.75} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Single Transaction</span>
              <span className="text-sm text-muted-foreground">$1,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">ATM Withdrawal</span>
              <span className="text-sm text-muted-foreground">$300</span>
            </div>
            <Button className="w-full">Modify Limits</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
