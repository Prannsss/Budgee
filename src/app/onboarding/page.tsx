import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import PublicHeader from "@/components/layout/public-header";
import Footer from "@/components/layout/footer";

export default function OnboardingPage() {
  const slides = [
    { title: "Welcome to Budgee", description: "Your new personal finance companion.", image: "https://picsum.photos/800/600", hint: "welcome abstract" },
    { title: "Connect Everything", description: "Securely link all your bank accounts and e-wallets.", image: "https://picsum.photos/800/600", hint: "connections network" },
    { title: "AI-Powered Insights", description: "Ask Budgee anything about your finances and get smart summaries.", image: "https://picsum.photos/800/600", hint: "robot thinking" },
    { title: "Visualize Your Wealth", description: "See your net worth, assets, and liabilities at a glance.", image: "https://picsum.photos/800/600", hint: "charts graphs" },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <PublicHeader />
      <main className="flex-1 flex flex-col items-center justify-center bg-background p-4">
        <div className="w-full max-w-3xl">
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {slides.map((slide, index) => (
                <CarouselItem key={index}>
                  <Card className="overflow-hidden shadow-lg">
                    <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-4">
                      <Image 
                        src={slide.image} 
                        width={800} 
                        height={600} 
                        alt={slide.title} 
                        data-ai-hint={slide.hint}
                        className="rounded-lg object-cover w-full h-72" 
                      />
                      <div className="space-y-2">
                        <h2 className="text-3xl font-bold font-headline">{slide.title}</h2>
                        <p className="text-muted-foreground mt-2">{slide.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="ml-16" />
            <CarouselNext className="mr-16" />
          </Carousel>
          <div className="mt-8 flex justify-center gap-4">
            <Button asChild>
              <Link href="/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
