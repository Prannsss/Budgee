"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AuthAPI } from "@/lib/api-service";
import { Logo } from "@/components/icons/logo";
import { PublicRoute } from "@/components/auth/protected-route";

const passwordSchema = z.object({
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ResetPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [resetToken, setResetToken] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string>("");

  // Get reset token from session storage on mount
  React.useEffect(() => {
    const token = sessionStorage.getItem('budgee_reset_token');
    const storedEmail = sessionStorage.getItem('budgee_reset_email');
    
    if (!token) {
      toast({
        title: "Session Expired",
        description: "Please request a new password reset.",
        variant: "destructive",
      });
      router.push("/forgot-password");
      return;
    }
    
    setResetToken(token);
    setEmail(storedEmail || "");
  }, [router, toast]);

  const { register, handleSubmit, formState: { errors } } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: PasswordFormData) => {
    if (!resetToken) {
      toast({
        title: "Session Expired",
        description: "Please request a new password reset.",
        variant: "destructive",
      });
      router.push("/forgot-password");
      return;
    }

    setIsLoading(true);

    try {
      await AuthAPI.resetPassword(resetToken, data.password);
      
      // Clear reset token from session storage
      sessionStorage.removeItem('budgee_reset_token');
      sessionStorage.removeItem('budgee_reset_email');
      
      setIsSuccess(true);
      
      toast({
        title: "Password Reset! 🎉",
        description: "Your password has been changed successfully.",
      });

      // Redirect to login after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to reset password";
      const isExpired = error.response?.data?.expired;
      
      if (isExpired) {
        sessionStorage.removeItem('budgee_reset_token');
        sessionStorage.removeItem('budgee_reset_email');
      }
      
      toast({
        title: isExpired ? "Link Expired" : "Error",
        description: message,
        variant: "destructive",
      });
      
      if (isExpired) {
        router.push("/forgot-password");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Success state
  if (isSuccess) {
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
            
            <Card className="shadow-2xl border-0 md:border">
              <CardHeader className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <CardTitle className="text-2xl">Password Reset!</CardTitle>
                <CardDescription>
                  Your password has been successfully changed. 
                  Redirecting you to login...
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </PublicRoute>
    );
  }

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

          <Card className="shadow-2xl border-0 md:border">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Lock className="h-12 w-12 text-primary" />
              </div>
              <CardTitle className="text-2xl">Set New Password</CardTitle>
              <CardDescription>
                Create a strong password for
                <br />
                <strong className="text-foreground">{email || "your account"}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        disabled={isLoading}
                        {...register("password")}
                        className={cn(
                          "pr-10",
                          errors?.password && "border-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors?.password && (
                      <p className="px-1 text-xs text-destructive">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        placeholder="••••••••"
                        type={showConfirmPassword ? "text" : "password"}
                        disabled={isLoading}
                        {...register("confirmPassword")}
                        className={cn(
                          "pr-10",
                          errors?.confirmPassword && "border-destructive"
                        )}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        disabled={isLoading}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors?.confirmPassword && (
                      <p className="px-1 text-xs text-destructive">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Password requirements hint */}
                  <div className="text-xs text-muted-foreground space-y-1 bg-muted/50 p-3 rounded-md">
                    <p className="font-medium">Password must contain:</p>
                    <ul className="list-disc list-inside space-y-0.5">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter (A-Z)</li>
                      <li>One lowercase letter (a-z)</li>
                      <li>One number (0-9)</li>
                    </ul>
                  </div>

                  <Button disabled={isLoading} type="submit" className="w-full">
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Reset Password
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <p className="px-8 text-center text-sm text-muted-foreground mt-6">
            <Link
              href="/login"
              className="underline underline-offset-4 hover:text-primary inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-3 w-3" />
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </PublicRoute>
  );
}
