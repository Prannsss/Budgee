"use client";

import Link from "next/link";
import { ArrowLeft, Edit, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SpendingProgress } from "@/components/ui/spending-progress";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { API, type SpendingLimit } from "@/lib/api-service";
import { useToast } from "@/hooks/use-toast";

export default function LimitsPage() {
  const [isEditing, setIsEditing] = useState(false);
  const [limits, setLimits] = useState<SpendingLimit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editedAmounts, setEditedAmounts] = useState<Record<string, number>>({});
  const { toast } = useToast();

  useEffect(() => {
    // Add a small delay to ensure API module is loaded
    const timer = setTimeout(() => {
      fetchLimits();
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const fetchLimits = async () => {
    try {
      setLoading(true);
      
      // Check if API is available
      if (!API || !API.spendingLimits || typeof API.spendingLimits.getSpendingLimits !== 'function') {
        console.warn('Spending limits API not available yet, retrying...');
        // Retry after a short delay
        setTimeout(fetchLimits, 1000);
        return;
      }
      
      const data = await API.spendingLimits.getSpendingLimits();
      setLimits(data);
      
      // Initialize edited amounts
      const amounts: Record<string, number> = {};
      data.forEach(limit => {
        amounts[limit.type] = limit.amount;
      });
      setEditedAmounts(amounts);
    } catch (error) {
      console.error('Failed to fetch spending limits:', error);
      toast({
        title: "Error",
        description: "Failed to load spending limits",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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
    // Reset edited amounts to current values
    const amounts: Record<string, number> = {};
    limits.forEach(limit => {
      amounts[limit.type] = limit.amount;
    });
    setEditedAmounts(amounts);
  };

  const handleSave = async () => {
    try {
      // Check if API is available
      if (!API || !API.spendingLimits || typeof API.spendingLimits.updateSpendingLimit !== 'function') {
        toast({
          title: "Error",
          description: "API not ready, please try again",
          variant: "destructive",
        });
        return;
      }
      
      // Update all modified limits
      const updatePromises = Object.entries(editedAmounts).map(([type, amount]) => {
        return API.spendingLimits.updateSpendingLimit(
          type as 'Daily' | 'Weekly' | 'Monthly',
          amount
        );
      });

      await Promise.all(updatePromises);
      
      toast({
        title: "Success",
        description: "Spending limits updated successfully",
      });
      
      setIsEditing(false);
      await fetchLimits(); // Refresh data
      
      // Trigger spending limit check since limits changed
      window.dispatchEvent(new CustomEvent('budgee:dataUpdate'));
    } catch (error) {
      console.error('Failed to update spending limits:', error);
      toast({
        title: "Error",
        description: "Failed to update spending limits",
        variant: "destructive",
      });
    }
  };

  const handleAmountChange = (type: string, value: string) => {
    const numValue = parseFloat(value) || 0;
    setEditedAmounts(prev => ({
      ...prev,
      [type]: numValue
    }));
  };

  const getLimitByType = (type: string) => {
    return limits.find(l => l.type === type);
  };

  const getPercentage = (limit: SpendingLimit) => {
    if (limit.amount === 0) return 0;
    return Math.min((limit.current_spending / limit.amount) * 100, 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="sticky top-0 z-10 flex items-center gap-4 px-4 py-4 border-b bg-background/95 backdrop-blur-sm">
          <Link href="/dashboard/profile">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold">Limits</h1>
        </header>
        <div className="p-4 flex items-center justify-center">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  const dailyLimit = getLimitByType('Daily');
  const weeklyLimit = getLimitByType('Weekly');
  const monthlyLimit = getLimitByType('Monthly');

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
            {/* Daily Limit */}
            {dailyLimit && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Daily Limit</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedAmounts['Daily'] || 0}
                        onChange={(e) => handleAmountChange('Daily', e.target.value)}
                        className="w-32 h-8 text-xs"
                        min="0"
                        step="100"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(dailyLimit.current_spending)} / {formatCurrency(dailyLimit.amount)}
                    </span>
                  )}
                </div>
                <SpendingProgress 
                  value={getPercentage(dailyLimit)} 
                  limitAmount={dailyLimit.amount}
                  showTooltip={true}
                  className="h-2"
                />
              </div>
            )}

            {/* Weekly Limit */}
            {weeklyLimit && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Weekly Limit</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedAmounts['Weekly'] || 0}
                        onChange={(e) => handleAmountChange('Weekly', e.target.value)}
                        className="w-32 h-8 text-xs"
                        min="0"
                        step="100"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(weeklyLimit.current_spending)} / {formatCurrency(weeklyLimit.amount)}
                    </span>
                  )}
                </div>
                <SpendingProgress 
                  value={getPercentage(weeklyLimit)} 
                  limitAmount={weeklyLimit.amount}
                  showTooltip={true}
                  className="h-2"
                />
              </div>
            )}

            {/* Monthly Limit */}
            {monthlyLimit && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Monthly Limit</span>
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        value={editedAmounts['Monthly'] || 0}
                        onChange={(e) => handleAmountChange('Monthly', e.target.value)}
                        className="w-32 h-8 text-xs"
                        min="0"
                        step="100"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      {formatCurrency(monthlyLimit.current_spending)} / {formatCurrency(monthlyLimit.amount)}
                    </span>
                  )}
                </div>
                <SpendingProgress 
                  value={getPercentage(monthlyLimit)} 
                  limitAmount={monthlyLimit.amount}
                  showTooltip={true}
                  className="h-2"
                />
              </div>
            )}

            {isEditing && (
              <Button onClick={handleSave} className="w-full">
                Save Changes
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Set your spending limits to 0 to disable tracking for that period.</p>
            <p>• Limits automatically reset: Daily (24h), Weekly (7 days), Monthly (each month).</p>
            <p>• You'll receive warnings at 80% and alerts at 100% of your limits.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
