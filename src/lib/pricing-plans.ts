export interface PricingPlan {
  name: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  cta: string;
  currentPlanCta: string;
  href: string;
  popular?: boolean;
}

export const pricingPlans: PricingPlan[] = [
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
    cta: "Get Started for Free",
    currentPlanCta: "Current Plan",
    href: "/signup",
  },
  {
    name: "Budgeet",
    price: "₱199",
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
    cta: "Choose Basic",
    currentPlanCta: "Current Plan",
    href: "/signup?plan=basic",
    popular: true,
  },
  {
    name: "Premium",
    price: "₱399",
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
    cta: "Choose Premium",
    currentPlanCta: "Current Plan",
    href: "/signup?plan=premium",
  },
];
