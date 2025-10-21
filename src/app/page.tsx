"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2, Bot, Banknote, Landmark, Wallet, ArrowRight, Star } from "lucide-react";
import Link from "next/link";
import PublicHeader from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack";
import FadeIn from "@/components/ui/fade-in";
import { PublicRoute } from "@/components/auth/protected-route";
import { useState, useEffect, useMemo, memo, type ReactElement } from "react";

interface CountUpStatProps {
  end: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}

interface StatItem {
  value: number;
  suffix: string;
  prefix: string;
  label: string;
}

const CountUpStat = memo(function CountUpStat({ 
  end, 
  suffix = "", 
  prefix = "", 
  duration = 2000 
}: CountUpStatProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (!hasAnimated) {
      setHasAnimated(true);
      let startTime: number | null = null;
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        // Easing function for smooth animation
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const currentCount = easeOutQuart * end;
        
        setCount(currentCount);

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [end, duration, hasAnimated]);

  const displayValue = end % 1 === 0 ? Math.floor(count) : count.toFixed(1);

  return (
    <div className="text-2xl md:text-3xl font-bold text-foreground flex items-baseline gap-1">
      <span>{prefix}{displayValue.toLocaleString()}</span>
      <span className={suffix === "★" ? "text-yellow-400" : ""}>{suffix}</span>
    </div>
  );
});

export default function Home() {
  const features = useMemo(() => [
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
  ], []);

  const stats: StatItem[] = useMemo(() => [
    { value: 1000, suffix: "+", prefix: "", label: "Active Users" },
    { value: 4.9, suffix: "★", prefix: "", label: "User Rating" },
  ], []);

  return (
    <PublicRoute>
      <div className="flex flex-col min-h-screen bg-background text-foreground relative">
        {/* Animated background elements */}
        <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>

        {/* Sticky Header - Semi-transparent */}
        <div className="sticky top-0 z-50 w-full border-b bg-background/50 backdrop-blur-lg supports-[backdrop-filter]:bg-background/30 shadow-sm">
          <PublicHeader />
        </div>
        
        <main className="flex-1">
        {/* Hero Section with enhanced design */}
        <section className="w-full min-h-screen md:min-h-0 py-0 md:py-24 lg:py-32 xl:py-48 bg-background relative">
          {/* Decorative grid pattern */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          
          <div className="px-4 md:px-6 h-full relative z-10">
            <div className="flex flex-col items-center justify-center text-center h-full min-h-screen md:min-h-0">
              <div className="flex flex-col justify-center space-y-6 max-w-4xl">
                {/* Floating badge */}
                <FadeIn className="flex justify-center" distance={20}>
                  <div 
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary animate-fade-in"
                    role="status"
                    aria-label="User trust badge"
                  >
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" aria-hidden="true" />
                    Trusted by 1,000+ users
                  </div>
                </FadeIn>

                <FadeIn className="space-y-4" distance={28} delay={0.1}>
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-foreground bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
                    Master Your Money with Budgee
                  </h1>
                  <FadeIn delay={0.2}>
                    <p className="max-w-[600px] mx-auto text-muted-foreground md:text-xl leading-relaxed">
                      The smart, simple way to manage your finances. Connect your accounts, track your spending, and get personalized insights from your AI assistant.
                    </p>
                  </FadeIn>
                </FadeIn>

                <FadeIn delay={0.3} className="flex flex-col gap-3 min-[400px]:flex-row justify-center items-center">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-all hover:scale-105 group shiny-button">
                    <Link href="/signup" className="flex items-center gap-2 relative overflow-hidden">
                      <span className="relative z-10">Sign Up for Free</span>
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
                      <div className="shine-overlay"></div>
                    </Link>
                  </Button>
                </FadeIn>

                {/* Stats section */}
                <FadeIn delay={0.4} className="pt-8">
                  <div className="grid grid-cols-2 gap-3 md:gap-4 max-w-md mx-auto" role="region" aria-label="User statistics">
                    {stats.map((stat, index) => (
                      <div 
                        key={`stat-${index}`}
                        className="flex flex-col items-center p-2"
                      >
                        <CountUpStat end={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
                        <p className="text-xs md:text-sm text-muted-foreground mt-1">{stat.label}</p>
                      </div>
                    ))}
                  </div>
                </FadeIn>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section with enhanced cards */}
        <section id="features" className="w-full py-8 md:py-16 lg:py-20 bg-background md:min-h-0 relative">
          {/* Decorative elements */}
          <div className="absolute top-1/4 left-0 w-64 h-64 bg-primary/5 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-0 w-64 h-64 bg-purple-500/5 rounded-full filter blur-3xl"></div>
          
          <div className="container px-2 sm:px-4 md:px-6 h-full relative z-10">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center mb-4 md:mb-8" distance={32}>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary font-medium">Key Features</div>
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
                <ScrollStackItem itemClassName="bg-gradient-to-br from-blue-400 to-blue-600 dark:from-blue-500 dark:to-blue-700 shadow-2xl">
                  <article className="flex flex-col items-center text-center h-full justify-center relative overflow-hidden">
                    {/* Decorative circles */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" aria-hidden="true"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" aria-hidden="true"></div>
                    
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg relative z-10" aria-hidden="true">
                      <Landmark className="h-8 w-8 text-blue-600 dark:text-blue-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm relative z-10">Account Connections</h3>
                    <p className="text-blue-50 dark:text-blue-100 text-lg max-w-md font-medium relative z-10">
                      Securely link your bank accounts and e-wallets to get a complete financial picture.
                    </p>
                  </article>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gradient-to-br from-purple-400 to-pink-500 dark:from-purple-500 dark:to-pink-600 shadow-2xl">
                  <article className="flex flex-col items-center text-center h-full justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full -ml-20 -mt-20" aria-hidden="true"></div>
                    <div className="absolute bottom-0 right-0 w-28 h-28 bg-white/10 rounded-full -mr-14 -mb-14" aria-hidden="true"></div>
                    
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg relative z-10" aria-hidden="true">
                      <Bot className="h-8 w-8 text-purple-600 dark:text-purple-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm relative z-10">AI Assistant</h3>
                    <p className="text-purple-50 dark:text-purple-100 text-lg max-w-md font-medium relative z-10">
                      Ask Budgee anything about your finances and get smart, personalized insights in seconds.
                    </p>
                  </article>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gradient-to-br from-emerald-400 to-teal-500 dark:from-emerald-500 dark:to-teal-600 shadow-2xl">
                  <article className="flex flex-col items-center text-center h-full justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-18 -mt-18" aria-hidden="true"></div>
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full -ml-16 -mb-16" aria-hidden="true"></div>
                    
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg relative z-10" aria-hidden="true">
                      <Wallet className="h-8 w-8 text-emerald-600 dark:text-emerald-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm relative z-10">Transaction Management</h3>
                    <p className="text-emerald-50 dark:text-emerald-100 text-lg max-w-md font-medium relative z-10">
                      Easily categorize, search, and filter your transactions to understand your spending habits.
                    </p>
                  </article>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gradient-to-br from-orange-400 to-amber-500 dark:from-orange-500 dark:to-amber-600 shadow-2xl">
                  <article className="flex flex-col items-center text-center h-full justify-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-44 h-44 bg-white/10 rounded-full -ml-22 -mt-22" aria-hidden="true"></div>
                    <div className="absolute bottom-0 right-0 w-36 h-36 bg-white/10 rounded-full -mr-18 -mb-18" aria-hidden="true"></div>
                    
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/90 dark:bg-white/80 mb-6 shadow-lg relative z-10" aria-hidden="true">
                      <Banknote className="h-8 w-8 text-orange-600 dark:text-orange-700" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4 drop-shadow-sm relative z-10">Net Worth Tracking</h3>
                    <p className="text-orange-50 dark:text-orange-100 text-lg max-w-md font-medium relative z-10">
                      Watch your net worth grow with a clear overview of your assets and liabilities.
                    </p>
                  </article>
                </ScrollStackItem>
              </ScrollStack>
            </FadeIn>
          </div>
        </section>

        {/* CTA Section with enhanced design */}
        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-primary/10 via-purple-500/10 to-pink-500/10 relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse animation-delay-2000"></div>
          
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-radial from-primary/20 via-transparent to-transparent opacity-50"></div>
          
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6 relative z-10">
            <div className="space-y-4">
              <FadeIn distance={30}>
                <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline text-foreground">
                  Ready to Take Control of Your Finances?
                </h2>
              </FadeIn>
              <FadeIn delay={0.1} distance={30}>
                <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Join Budgee today and start your journey towards financial clarity and freedom. It's free to get started.
                </p>
              </FadeIn>
            </div>
            <FadeIn delay={0.2} className="mx-auto w-full max-w-sm space-y-2">
              <Button asChild size="lg" className="w-full shadow-lg hover:shadow-xl hover:shadow-primary/50 transition-all hover:scale-105 group glow-button shiny-button">
                <Link href="/signup" className="flex items-center justify-center gap-2 relative overflow-hidden">
                  <span className="relative z-10">Start for Free</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform relative z-10" />
                  <div className="shine-overlay"></div>
                </Link>
              </Button>
            </FadeIn>
          </div>
        </section>
        </main>
        <Footer />
      </div>
    </PublicRoute>
  );
}