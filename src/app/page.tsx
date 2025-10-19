"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Bot, Banknote, Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PublicHeader from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack";
import FadeIn from "@/components/ui/fade-in";
import { PublicRoute } from "@/components/auth/protected-route";

export default function Home() {
  const features = [
    {
      icon: <Landmark className="h-8 w-8 text-primary" />,
      title: "Account Connections",
      description: "Securely link your bank accounts and e-wallets to get a complete financial picture.",
    },
    {
      icon: <Bot className="h-8 w-8 text-primary" />,
      title: "AI Assistant",
      description: "Ask Budgee anything about your finances and get smart, personalized insights in seconds.",
    },
    {
      icon: <Wallet className="h-8 w-8 text-primary" />,
      title: "Transaction Management",
      description: "Easily categorize, search, and filter your transactions to understand your spending habits.",
    },
    {
      icon: <Banknote className="h-8 w-8 text-primary" />,
      title: "Net Worth Tracking",
      description: "Watch your net worth grow with a clear overview of your assets and liabilities.",
    },
  ];

  return (
    <PublicRoute>
      <div className="flex flex-col min-h-screen bg-background text-foreground">
        <PublicHeader />
        <main className="flex-1">
        <section className="w-full min-h-screen md:min-h-0 py-0 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6 h-full">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-screen md:min-h-0">
              <div className="flex flex-col justify-center space-y-4 max-w-4xl">
                <FadeIn className="space-y-4" distance={28}>
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground">
                    Master Your Money with Budgee
                  </h1>
                  <FadeIn delay={0.08}>
                    <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl">
                      The smart, simple way to manage your finances. Connect your accounts, track your spending, and get personalized insights from your AI assistant.
                    </p>
                  </FadeIn>
                </FadeIn>
                <FadeIn delay={0.15} className="flex flex-col gap-2 min-[400px]:flex-row justify-center">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="/signup">Sign Up for Free</Link>
                  </Button>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-8 md:py-16 lg:py-20 bg-background min-h-screen md:min-h-0">
          <div className="container px-2 sm:px-4 md:px-6 h-full">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center mb-4 md:mb-8" distance={32}>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-muted-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-foreground">We Got Everything You Need!</h2>
                <FadeIn delay={0.1}>
                  <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Budgee provides powerful, easy-to-use tools to help you take control of your financial life.
                  </p>
                </FadeIn>
              </div>
            </FadeIn>
            <FadeIn className="py-4 md:py-8 h-full" delay={0.15} distance={40}>
              <ScrollStack
                className="bg-background max-w-4xl mx-auto w-full h-full min-h-[60vh] md:min-h-0"
                itemStackDistance={20}
                baseScale={0.92}
                itemScale={0.02}
                itemDistance={80}
              >
                <ScrollStackItem itemClassName="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg">
                      <Landmark className="h-8 w-8 text-blue-600 dark:text-blue-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">Account Connections</h3>
                    <p className="text-blue-50 dark:text-blue-100 text-lg max-w-md font-medium">
                      Securely link your bank accounts and e-wallets to get a complete financial picture.
                    </p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gradient-to-br from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg">
                      <Bot className="h-8 w-8 text-purple-600 dark:text-purple-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">AI Assistant</h3>
                    <p className="text-purple-50 dark:text-purple-100 text-lg max-w-md font-medium">
                      Ask Budgee anything about your finances and get smart, personalized insights in seconds.
                    </p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg">
                      <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">Transaction Management</h3>
                    <p className="text-emerald-50 dark:text-emerald-100 text-lg max-w-md font-medium">
                      Easily categorize, search, and filter your transactions to understand your spending habits.
                    </p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gradient-to-br from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg">
                      <Banknote className="h-8 w-8 text-orange-600 dark:text-orange-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm">Net Worth Tracking</h3>
                    <p className="text-orange-50 dark:text-orange-100 text-lg max-w-md font-medium">
                      Watch your net worth grow with a clear overview of your assets and liabilities.
                    </p>
                  </div>
                </ScrollStackItem>
              </ScrollStack>
            </FadeIn>
            {/* Reduced extra space to keep layout compact */}
          </div>
        </section>

        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-muted/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline text-foreground">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Join Budgee today and start your journey towards financial clarity and freedom. It's free to get started.
              </p>
            </div>
            <div className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full">
                <Link href="/signup">Start for Free</Link>
              </Button>
            </div>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </PublicRoute>
  );
}