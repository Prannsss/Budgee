import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Bot, Banknote, Landmark, Wallet } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import PublicHeader from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";

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
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    Master Your Money with Budgee
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    The smart, simple way to manage your finances. Connect your accounts, track your spending, and get personalized insights from our AI assistant.
                  </p>
                </div>
                <div className="lg:hidden mt-6">
                  <Card>
                    <CardContent className="p-0">
                      <Image
                        src="/images/budgee.png"
                        width="1080"
                        height="1080"
                        alt="Budgee Dashboard Preview"
                        data-ai-hint="finance dashboard"
                        className="mx-auto aspect-square overflow-hidden rounded-xl object-cover"
                      />
                    </CardContent>
                  </Card>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="shadow-lg hover:shadow-xl transition-shadow">
                    <Link href="/signup">Sign Up for Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/onboarding">See How It Works</Link>
                  </Button>
                </div>
              </div>
              <div className="hidden lg:flex items-center justify-center">
                <Image
                  src="/images/budgee.png"
                  width="1080"
                  height="1080"
                  alt="Budgee Dashboard Preview"
                  data-ai-hint="finance dashboard"
                  className="mx-auto aspect-square object-cover sm:w-full"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">We Got Everything You Need!</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Budgee provides powerful, easy-to-use tools to help you take control of your financial life.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4 mt-12">
              {features.map((feature, index) => (
                <div key={index} className="grid gap-1 text-center">
                   <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-bold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="cta" className="w-full py-12 md:py-24 lg:py-32 bg-secondary/50">
          <div className="container grid items-center justify-center gap-4 px-4 text-center md:px-6">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold tracking-tighter md:text-4xl/tight font-headline">
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
  );
}
