"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Logo } from "@/components/icons/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Handle OAuth callback
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');
    const error = searchParams.get('error');

    if (error === 'oauth_failed') {
      toast({
        title: "Authentication Failed",
        description: "Social login failed. Please try again.",
        variant: "destructive",
      });
      // Clear URL parameters
      router.replace('/login');
      return;
    }

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);

      // Fetch user data
      const fetchUserData = async () => {
        try {
          const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
          const response = await fetch(`${apiUrl}/api/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data?.user) {
              // Store user data
              localStorage.setItem('user', JSON.stringify(result.data.user));
              toast({
                title: "Welcome! 🎉",
                description: "You've successfully logged in.",
              });
              router.push('/dashboard');
            }
          }
        } catch (error) {
          console.error('Failed to fetch user data:', error);
          toast({
            title: "Error",
            description: "Failed to complete login. Please try again.",
            variant: "destructive",
          });
          router.replace('/login');
        }
      };

      fetchUserData();
    }
  }, [searchParams, router, toast]);

  return (
    <PublicRoute>
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">Budgee</span>
          </Link>
        </div>
        {/* Responsive card - hidden on mobile, shown on desktop */}
        <Card className="shadow-2xl md:shadow-2xl shadow-none border-0 md:border">
          <CardHeader className="text-center md:text-left">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your email and password to login to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserAuthForm formType="login" />
          </CardContent>
        </Card>
        <p className="px-8 text-center text-sm text-muted-foreground mt-6">
          <Link
            href="/signup"
            className="underline underline-offset-4 hover:text-primary"
          >
            Don't have an account? Sign Up
          </Link>
        </p>
        </div>
      </div>
    </PublicRoute>
  );
}
