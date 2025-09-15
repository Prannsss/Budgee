import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Logo } from "@/components/icons/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRoute } from "@/components/auth/protected-route";
import Link from "next/link";

export default function LoginPage() {
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
        <Card className="shadow-2xl">
          <CardHeader>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>Enter your email and password to sign in to your account.</CardDescription>
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
