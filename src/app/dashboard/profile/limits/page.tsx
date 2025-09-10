"use client";

import Link from "next/link";
import { ArrowLeft, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

export default function LimitsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [limits, setLimits] = useState({
    daily: { current: 12500, limit: 25000 }, // ₱250 -> ₱12,500, ₱500 -> ₱25,000
    weekly: { current: 60000, limit: 100000 }, // ₱1,200 -> ₱60,000, ₱2,000 -> ₱100,000
    monthly: { current: 175000, limit: 400000 }, // ₱3,500 -> ₱175,000, ₱8,000 -> ₱400,000
    singleTransaction: 50000, // ₱1,000 -> ₱50,000
    atmWithdrawal: 15000 // ₱300 -> ₱15,000
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    // Here you would typically save the data to your backend
    setIsEditing(false);
    // Add your save logic here
  };

  const handleLimitChange = (type: string, field: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setLimits(prev => {
      if (type === 'singleTransaction' || type === 'atmWithdrawal') {
        return {
          ...prev,
          [type]: numValue
        };
      } else {
        return {
          ...prev,
          [type]: {
            ...(prev[type as keyof typeof prev] as any),
            [field]: numValue
          }
        };
      }
    });
  };
  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Header */}
      <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
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
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle>Spending Limits</CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={isEditing ? handleCancel : handleEdit}
              className="h-8 w-8"
            >
              {isEditing ? (
                <X className="h-4 w-4" />
              ) : (
                <Edit className="h-4 w-4" />
              )}
            </Button>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Daily Limit</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={limits.daily.limit}
                      onChange={(e) => handleLimitChange('daily', 'limit', e.target.value)}
                      className="w-24 h-8 text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(limits.daily.current)} / {formatCurrency(limits.daily.limit)}
                  </span>
                )}
              </div>
              <Progress value={(limits.daily.current / limits.daily.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Weekly Limit</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={limits.weekly.limit}
                      onChange={(e) => handleLimitChange('weekly', 'limit', e.target.value)}
                      className="w-24 h-8 text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(limits.weekly.current)} / {formatCurrency(limits.weekly.limit)}
                  </span>
                )}
              </div>
              <Progress value={(limits.weekly.current / limits.weekly.limit) * 100} className="h-2" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Monthly Limit</span>
                {isEditing ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={limits.monthly.limit}
                      onChange={(e) => handleLimitChange('monthly', 'limit', e.target.value)}
                      className="w-24 h-8 text-xs"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    {formatCurrency(limits.monthly.current)} / {formatCurrency(limits.monthly.limit)}
                  </span>
                )}
              </div>
              <Progress value={(limits.monthly.current / limits.monthly.limit) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transaction Limits</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Single Transaction</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={limits.singleTransaction}
                  onChange={(e) => handleLimitChange('singleTransaction', '', e.target.value)}
                  className="w-32 h-8 text-xs"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(limits.singleTransaction)}
                </span>
              )}
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">ATM Withdrawal</span>
              {isEditing ? (
                <Input
                  type="number"
                  value={limits.atmWithdrawal}
                  onChange={(e) => handleLimitChange('atmWithdrawal', '', e.target.value)}
                  className="w-32 h-8 text-xs"
                />
              ) : (
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(limits.atmWithdrawal)}
                </span>
              )}
            </div>
            {isEditing && (
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
