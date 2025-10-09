"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import PublicHeader from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import { pricingPlans } from "@/lib/pricing-plans";

export default function PricingPage() {
  const router = useRouter();

  const handlePlanClick = (href: string) => {
    router.push(href);
  };
  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <section className="container flex flex-col items-center gap-6 py-12 md:py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl font-headline">
              Find the perfect plan
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start for free and upgrade as you grow. All plans include our core features.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-12 mt-10 w-full max-w-5xl">
            {pricingPlans.map((plan) => (
              <Card 
                key={plan.name} 
                className={`flex flex-col cursor-pointer transition-all duration-200 hover:scale-105 ${
                  plan.popular ? 'border-primary shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
                onClick={() => handlePlanClick(plan.href)}
              >
                {plan.popular && (
                  <div className="bg-primary text-primary-foreground text-center py-2 text-sm font-medium rounded-t-lg">
                    Most Popular
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="ml-1 text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="mt-6 space-y-4">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-primary" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    <Link href={plan.href}>{plan.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
