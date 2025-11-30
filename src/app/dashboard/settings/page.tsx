"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { PaymentModal } from "@/components/payment/payment-modal";
import { useSubscription } from "@/contexts/subscription-context";
import { pricingPlans, PricingPlan } from "@/lib/pricing-plans";

export default function YourPlanPage() {
  const { currentPlan, userPlan, isLoading } = useSubscription();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<PricingPlan | null>(null);

  const handleUpgradeClick = (plan: PricingPlan) => {
    if (plan.name !== currentPlan) {
      setSelectedPlan(plan);
      setIsPaymentModalOpen(true);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your subscription...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background px-4 py-6">
        <div className="container max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <Crown className="h-6 w-6 text-primary" />
            <div>
              <h1 className="text-2xl font-bold">Your Plan</h1>
              <p className="text-muted-foreground">Manage your subscription and explore upgrade options</p>
            </div>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      <div className="container max-w-6xl mx-auto px-4 py-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-2 w-2 rounded-full bg-green-500"></div>
              <span className="font-medium">You are currently on the <strong>{currentPlan} Plan</strong></span>
            </div>
            {userPlan && userPlan.next_billing_date && (
              <div className="text-sm text-muted-foreground">
                Next billing: {new Date(userPlan.next_billing_date).toLocaleDateString()}
              </div>
            )}
          </div>
          <div className="flex flex-col sm:flex-row sm:gap-6 mt-2 text-sm text-muted-foreground">
            {userPlan && userPlan.created_at && (
              <div>
                Member since: {new Date(userPlan.created_at).toLocaleDateString()}
              </div>
            )}
            {userPlan && userPlan.subscription_expires_at && (
              <div>
                Expires on: {new Date(userPlan.subscription_expires_at).toLocaleDateString()}
              </div>
            )}
          </div>
        </div>

        {/* Plans Layout - Simple Grid for both Desktop and Mobile */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {pricingPlans.map((plan) => {
            const isCurrent = plan.name === currentPlan;
            const isPaidPlan = currentPlan !== 'Free';
            // Disable other plans if currently on a paid plan
            const isDisabled = isCurrent || (isPaidPlan && !isCurrent);
            // Hide button for Free plan if currently on Free plan
            const shouldHideButton = isCurrent && plan.name === 'Free';

            return (
              <Card 
                key={plan.name} 
                className={`flex flex-col relative ${
                  isCurrent 
                    ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                    : plan.popular 
                    ? 'border-primary shadow-xl' 
                    : 'shadow-lg hover:shadow-xl transition-shadow'
                } ${isDisabled && !isCurrent ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                {isCurrent && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      Current Plan
                    </span>
                  </div>
                )}
                {plan.popular && !isCurrent && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {plan.name}
                    {isCurrent && <Crown className="h-4 w-4 text-primary" />}
                  </CardTitle>
                  <CardDescription className="text-sm">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1 pb-4">
                  <div className="flex items-baseline mb-4">
                    <span className="text-3xl sm:text-4xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm leading-relaxed">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter className="pt-0">
                  {!shouldHideButton && (
                    <Button 
                      onClick={() => handleUpgradeClick(plan)}
                      className="w-full" 
                      variant={isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                      disabled={isDisabled}
                    >
                      {isCurrent ? plan.currentPlanCta : plan.cta}
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-6 sm:mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help choosing a plan? <Link href="/dashboard/profile/help" className="text-primary hover:underline">Contact support</Link>
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  );
}
