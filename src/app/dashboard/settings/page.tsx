"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check, Crown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    name: "Free",
    price: "₱0",
    period: "/ month",
    description: "For individuals just starting with budgeting.",
    features: [
      "Connect 1 bank account",
      "Connect 1 e-wallet",
      "Basic transaction categorization",
      "Net worth tracking",
      "Monthly spending summary",
    ],
    cta: "Current Plan",
    href: "/pricing",
    isCurrent: true,
  },
  {
    name: "Basic",
    price: "₱299",
    period: "/ month",
    description: "For users who want more control and smarter insights.",
    features: [
      "Everything in Free",
      "Connect up to 5 accounts",
      "Advanced categorization rules",
      "AI-powered financial insights",
      "Export transactions to CSV/Excel",
      "Budget goals and alerts",
    ],
    cta: "Upgrade to Basic",
    href: "/pricing",
    popular: true,
  },
  {
    name: "Premium",
    price: "₱499",
    period: "/ month",
    description: "For power users and small businesses needing advanced features.",
    features: [
      "Everything in Basic",
      "Unlimited account connections",
      "Full AI financial assistant access",
      "Investment and savings tracking",
      "Custom financial reports",
      "Priority customer support",
    ],
    cta: "Upgrade to Premium",
    href: "/pricing",
  },
];

export default function YourPlanPage() {
  const [currentPlan] = useState("Free");

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
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            <span className="font-medium">You are currently on the <strong>{currentPlan} Plan</strong></span>
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:gap-8">
          {plans.map((plan) => (
            <Card 
              key={plan.name} 
              className={`flex flex-col relative ${
                plan.isCurrent 
                  ? 'border-primary shadow-lg ring-2 ring-primary/20' 
                  : plan.popular 
                  ? 'border-primary shadow-xl' 
                  : 'shadow-lg hover:shadow-xl transition-shadow'
              }`}
            >
              {plan.isCurrent && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                    Current Plan
                  </span>
                </div>
              )}
              {plan.popular && !plan.isCurrent && (
                <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                  Most Popular
                </div>
              )}
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {plan.name}
                  {plan.isCurrent && <Crown className="h-4 w-4 text-primary" />}
                </CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-baseline mb-6">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="ml-1 text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-primary flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button 
                  asChild 
                  className="w-full" 
                  variant={plan.isCurrent ? 'outline' : plan.popular ? 'default' : 'outline'}
                  disabled={plan.isCurrent}
                >
                  <Link href={plan.isCurrent ? '#' : plan.href}>
                    {plan.cta}
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            Need help choosing a plan? <Link href="/dashboard/profile/help" className="text-primary hover:underline">Contact support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}