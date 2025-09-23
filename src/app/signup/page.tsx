import { UserAuthForm } from "@/components/auth/user-auth-form";
import { Logo } from "@/components/icons/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PublicRoute } from "@/components/auth/protected-route";
import Link from "next/link";

export default function SignupPage() {
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
        {/* Card wrapper only visible on md+ screens (desktop) */}
        <Card className="shadow-2xl hidden md:block">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Enter your details below to create your account.</CardDescription>
          </CardHeader>
          <CardContent>
            <UserAuthForm formType="signup" />
          </CardContent>
        </Card>
        
        {/* Mobile layout without card wrapper */}
        <div className="md:hidden space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Create an account</h1>
            <p className="text-sm text-muted-foreground">Enter your details below to create your account.</p>
          </div>
          <UserAuthForm formType="signup" />
        </div>
        <p className="px-8 text-center text-sm text-muted-foreground mt-6">
          <Link
            href="/login"
            className="underline underline-offset-4 hover:text-primary"
          >
            Already have an account? Login
          </Link>
        </p>
         <p className="px-8 text-center text-xs text-muted-foreground mt-4">
          By clicking continue, you agree to our{" "}
          <Link
            href="/terms"
            className="underline underline-offset-4 hover:text-primary"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/privacy"
            className="underline underline-offset-4 hover:text-primary"
          >
            Privacy Policy
          </Link>
          .
        </p>
        </div>
      </div>
    </PublicRoute>
  );
}
