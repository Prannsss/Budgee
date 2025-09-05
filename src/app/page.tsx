import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Bot, Banknote, Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PublicHeader from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";
import ScrollStack, { ScrollStackItem } from "@/components/ui/scroll-stack";
import FadeIn from "@/components/ui/fade-in";

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
    <div className="flex flex-col min-h-screen bg-black text-white">
      <PublicHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="flex flex-col justify-center space-y-4 max-w-4xl">
                <FadeIn className="space-y-4" distance={28}>
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline text-white">
                    Master Your Money with Budgee
                  </h1>
                  <FadeIn delay={0.08}>
                    <p className="max-w-[600px] mx-auto text-gray-300 md:text-xl">
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

        <section id="features" className="w-full py-8 md:py-16 lg:py-20 bg-black">
          <div className="container px-4 md:px-6">
            <FadeIn className="flex flex-col items-center justify-center space-y-4 text-center mb-8" distance={32}>
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-gray-800 px-3 py-1 text-sm text-white">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline text-white">We Got Everything You Need!</h2>
                <FadeIn delay={0.1}>
                  <p className="max-w-[900px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                    Budgee provides powerful, easy-to-use tools to help you take control of your financial life.
                  </p>
                </FadeIn>
              </div>
            </FadeIn>
            <FadeIn className="py-8" delay={0.15} distance={40}>
              <ScrollStack
                className="bg-black max-w-4xl mx-auto"
                itemStackDistance={0}
                baseScale={1}
                itemScale={0}
                itemDistance={0}
              >
                <ScrollStackItem itemClassName="bg-gray-900 border border-gray-700">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-6">
                      <Landmark className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Account Connections</h3>
                    <p className="text-gray-300 text-lg max-w-md">
                      Securely link your bank accounts and e-wallets to get a complete financial picture.
                    </p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gray-900 border border-gray-700">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-6">
                      <Bot className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">AI Assistant</h3>
                    <p className="text-gray-300 text-lg max-w-md">
                      Ask Budgee anything about your finances and get smart, personalized insights in seconds.
                    </p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gray-900 border border-gray-700">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-6">
                      <Wallet className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Transaction Management</h3>
                    <p className="text-gray-300 text-lg max-w-md">
                      Easily categorize, search, and filter your transactions to understand your spending habits.
                    </p>
                  </div>
                </ScrollStackItem>
                <ScrollStackItem itemClassName="bg-gray-900 border border-gray-700">
                  <div className="flex flex-col items-center text-center h-full justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 mb-6">
                      <Banknote className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-4">Net Worth Tracking</h3>
                    <p className="text-gray-300 text-lg max-w-md">
                      Watch your net worth grow with a clear overview of your assets and liabilities.
                    </p>
                  </div>
                </ScrollStackItem>
              </ScrollStack>
            </FadeIn>
            {/* Reduced extra space to keep layout compact */}
          </div>
        </section>

        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-gray-900">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline text-white">
                Ready to Take Control of Your Finances?
              </h2>
              <p className="mx-auto max-w-[600px] text-gray-300 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
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
  );
}
