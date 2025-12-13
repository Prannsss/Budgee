"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Logo } from "@/components/icons/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRoute } from "@/components/auth/protected-route";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { TokenManager } from "@/lib/api-service";
import { useAuth } from "@/contexts/auth-context";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { toast } = useToast();
  const { refreshUser } = useAuth();

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
      const handleLogin = async () => {
        try {
          // Store tokens using TokenManager to ensure correct keys
          TokenManager.setToken(token);
          TokenManager.setRefreshToken(refreshToken);

          // Refresh user data in context
          await refreshUser();

          toast({
            title: "Welcome! 🎉",
            description: "You've successfully logged in.",
          });
          
          // Redirect to dashboard
          router.push('/dashboard');
        } catch (error) {
          console.error('Failed to complete login:', error);
          toast({
            title: "Error",
            description: "Failed to complete login. Please try again.",
            variant: "destructive",
          });
          TokenManager.clearTokens();
          router.replace('/login');
        }
      };

      handleLogin();
    }
  }, [searchParams, router, toast, refreshUser]);

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
        <Card className="shadow-2xl md:shadow-2xl border-0 md:border">
          <CardHeader className="text-center md:text-left">
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your email and password to login to your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserAuthForm formType="login" />
            <div className="mt-4 text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                Forgot your password?
              </Link>
            </div>
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
