"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail, ArrowLeft, KeyRound } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { AuthAPI } from "@/lib/api-service";
import { Logo } from "@/components/icons/logo";
import { PublicRoute } from "@/components/auth/protected-route";

const emailSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

const codeSchema = z.object({
  code: z.string()
    .length(6, { message: "Reset code must be 6 digits." })
    .regex(/^\d+$/, { message: "Reset code must contain only numbers." }),
});

type EmailFormData = z.infer<typeof emailSchema>;
type CodeFormData = z.infer<typeof codeSchema>;

type Step = "email" | "code";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  
  const [step, setStep] = React.useState<Step>("email");
  const [isLoading, setIsLoading] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [resendCooldown, setResendCooldown] = React.useState(0);

  // Countdown timer for resend
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const emailForm = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const codeForm = useForm<CodeFormData>({
    resolver: zodResolver(codeSchema),
    defaultValues: { code: "" },
  });

  const onEmailSubmit = async (data: EmailFormData) => {
    setIsLoading(true);

    try {
      await AuthAPI.forgotPassword(data.email);
      setEmail(data.email);
      setStep("code");
      setResendCooldown(60); // 60 second cooldown
      
      toast({
        title: "Check your email 📧",
        description: "If an account exists with that email, we've sent a reset code.",
        variant: "success",
      });
    } catch (error: any) {
      // Always show success message to prevent email enumeration
      setEmail(data.email);
      setStep("code");
      setResendCooldown(60);
      
      toast({
        title: "Check your email 📧",
        description: "If an account exists with that email, we've sent a reset code.",
        variant: "success",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onCodeSubmit = async (data: CodeFormData) => {
    setIsLoading(true);

    try {
      const response = await AuthAPI.verifyResetCode(email, data.code);
      
      // Store reset token and navigate to reset password page
      sessionStorage.setItem('budgee_reset_token', response.resetToken);
      sessionStorage.setItem('budgee_reset_email', email);
      
      toast({
        title: "Code verified! ✅",
        description: "You can now set your new password.",
        variant: "success",
      });

      router.push("/reset-password");
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Invalid or expired code";
      const isExpired = error.response?.data?.expired;
      
      toast({
        title: isExpired ? "Code Expired" : "Invalid Code",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (resendCooldown > 0) return;
    
    setIsLoading(true);
    try {
      await AuthAPI.forgotPassword(email);
      setResendCooldown(60);
      
      toast({
        title: "Code Resent! 📧",
        description: "A new reset code has been sent to your email.",
        variant: "success",
      });
    } catch (error) {
      // Still show success to prevent email enumeration
      setResendCooldown(60);
      toast({
        title: "Code Resent! 📧",
        description: "A new reset code has been sent to your email.",
        variant: "success",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToEmail = () => {
    setStep("email");
    codeForm.reset();
  };

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
                {step === "email" ? (
                  <KeyRound className="h-12 w-12 text-primary" />
                ) : (
                  <Mail className="h-12 w-12 text-primary" />
                )}
              </div>
              <CardTitle className="text-2xl">
                {step === "email" ? "Forgot Password?" : "Enter Reset Code"}
              </CardTitle>
              <CardDescription>
                {step === "email" 
                  ? "No worries! Enter your email and we'll send you a reset code."
                  : (
                    <>
                      We've sent a 6-digit code to
                      <br />
                      <strong className="text-foreground">{email}</strong>
                    </>
                  )
                }
              </CardDescription>
            </CardHeader>

            <CardContent>
              {step === "email" ? (
                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        placeholder="juandelacruz@gmail.com"
                        type="email"
                        autoComplete="email"
                        disabled={isLoading}
                        {...emailForm.register("email")}
                        className={cn(
                          emailForm.formState.errors?.email && "border-destructive"
                        )}
                      />
                      {emailForm.formState.errors?.email && (
                        <p className="px-1 text-xs text-destructive">
                          {emailForm.formState.errors.email.message}
                        </p>
                      )}
                    </div>
                    <Button disabled={isLoading} type="submit" className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Send Reset Code
                    </Button>
                  </div>
                </form>
              ) : (
                <form onSubmit={codeForm.handleSubmit(onCodeSubmit)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">Reset Code</Label>
                      <Input
                        id="code"
                        placeholder="000000"
                        type="text"
                        maxLength={6}
                        disabled={isLoading}
                        {...codeForm.register("code")}
                        className={cn(
                          "text-center text-2xl tracking-widest font-mono",
                          codeForm.formState.errors?.code && "border-destructive"
                        )}
                      />
                      {codeForm.formState.errors?.code && (
                        <p className="px-1 text-xs text-destructive">
                          {codeForm.formState.errors.code.message}
                        </p>
                      )}
                    </div>
                    <Button disabled={isLoading} type="submit" className="w-full">
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Verify Code
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              {step === "code" && (
                <>
                  <div className="text-sm text-muted-foreground text-center">
                    Didn't receive the code?
                    <Button
                      variant="link"
                      className="px-2"
                      onClick={handleResendCode}
                      disabled={isLoading || resendCooldown > 0}
                    >
                      {resendCooldown > 0 
                        ? `Resend (${resendCooldown}s)` 
                        : "Resend Code"
                      }
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={handleBackToEmail}
                    disabled={isLoading}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Use Different Email
                  </Button>
                </>
              )}
              
              <div className="text-sm text-center">
                <Link
                  href="/login"
                  className="text-primary underline-offset-4 hover:underline inline-flex items-center"
                >
                  <ArrowLeft className="mr-1 h-3 w-3" />
                  Back to Login
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </PublicRoute>
  );
}
