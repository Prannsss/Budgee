"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Loader2, Mail, CheckCircle2, ArrowLeft, Edit2 } from "lucide-react";

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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { API, AuthAPI } from "@/lib/api-service";
import { PENDING_EMAIL_KEY } from "@/lib/constants";
import Link from "next/link";
import { Logo } from "@/components/icons/logo";

const verificationSchema = z.object({
  code: z.string()
    .length(6, { message: "Verification code must be 6 digits." })
    .regex(/^\d+$/, { message: "Verification code must contain only numbers." }),
});

const changeEmailSchema = z.object({
  newEmail: z.string().email({ message: "Please enter a valid email address." }),
});

type VerificationFormData = z.infer<typeof verificationSchema>;
type ChangeEmailFormData = z.infer<typeof changeEmailSchema>;

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlEmail = searchParams.get("email");
  const { toast } = useToast();
  
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isResending, setIsResending] = React.useState(false);
  const [isVerified, setIsVerified] = React.useState(false);
  const [resendCooldown, setResendCooldown] = React.useState(0);
  const [showChangeEmail, setShowChangeEmail] = React.useState(false);
  const [isChangingEmail, setIsChangingEmail] = React.useState(false);

  // Initialize email from URL param or localStorage
  React.useEffect(() => {
    const pendingEmail = localStorage.getItem(PENDING_EMAIL_KEY);
    const effectiveEmail = urlEmail || pendingEmail || "";
    setEmail(effectiveEmail);
    
    // If no email found, redirect to signup
    if (!effectiveEmail) {
      toast({
        title: "No pending verification",
        description: "Please sign up first.",
        variant: "destructive",
      });
      router.push("/signup");
    }
  }, [urlEmail, router, toast]);

  // Countdown timer effect
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verificationForm = useForm<VerificationFormData>({
    resolver: zodResolver(verificationSchema),
  });

  const changeEmailForm = useForm<ChangeEmailFormData>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: { newEmail: "" },
  });

  const onSubmit = async (data: VerificationFormData) => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address is missing. Please sign up again.",
        variant: "destructive",
      });
      router.push("/signup");
      return;
    }

    setIsLoading(true);

    try {
      await API.auth.verifyEmail(email, data.code);
      
      // Clear pending email from localStorage
      localStorage.removeItem(PENDING_EMAIL_KEY);
      
      setIsVerified(true);
      toast({
        title: "Email Verified! ✅",
        description: "Your email has been verified successfully.",
      });

      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Invalid verification code";
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
    if (!email) {
      toast({
        title: "Error",
        description: "Email address is missing. Please sign up again.",
        variant: "destructive",
      });
      return;
    }

    if (resendCooldown > 0) return;

    setIsResending(true);

    try {
      await API.auth.resendVerification(email);
      
      // Set 30-second cooldown
      setResendCooldown(30);
      toast({
        title: "Code Resent! 📧",
        description: "A new verification code has been sent to your email.",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || "Something went wrong. Please try again.";
      const remainingTime = error.response?.data?.remainingTime;
      
      if (remainingTime) {
        setResendCooldown(remainingTime);
      }
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async (data: ChangeEmailFormData) => {
    if (!email) return;
    
    setIsChangingEmail(true);

    try {
      const response = await AuthAPI.changeSignupEmail(email, data.newEmail);
      
      // Update email state and localStorage
      setEmail(response.email);
      localStorage.setItem(PENDING_EMAIL_KEY, response.email);
      
      // Update URL without reload
      const url = new URL(window.location.href);
      url.searchParams.set('email', response.email);
      window.history.replaceState({}, '', url.toString());
      
      setShowChangeEmail(false);
      changeEmailForm.reset();
      setResendCooldown(30); // New code was sent
      
      toast({
        title: "Email Updated! ✅",
        description: "A new verification code has been sent to your new email.",
      });
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Failed to change email";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsChangingEmail(false);
    }
  };

  const handleClearPendingEmail = () => {
    localStorage.removeItem(PENDING_EMAIL_KEY);
    router.push("/signup");
  };

  if (isVerified) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <Link href="/" className="flex items-center gap-2 text-foreground">
              <Logo className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold font-headline">Budgee</span>
            </Link>
          </div>
          
          <Card className="shadow-2xl border-0 md:border">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl">Email Verified!</CardTitle>
              <CardDescription>
                Your email has been successfully verified. Redirecting you to login...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <Link href="/" className="flex items-center gap-2 text-foreground">
            <Logo className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold font-headline">Budgee</span>
          </Link>
        </div>

        <Card className="shadow-2xl border-0 md:border">
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-4">
              <Mail className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl text-center">Verify Your Email</CardTitle>
            <CardDescription className="text-center">
              We've sent a 6-digit verification code to
              <br />
              <span className="inline-flex items-center gap-1 mt-1">
                <strong className="text-foreground">{email || "your email address"}</strong>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={() => setShowChangeEmail(true)}
                  title="Change email"
                >
                  <Edit2 className="h-3 w-3" />
                </Button>
              </span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={verificationForm.handleSubmit(onSubmit)}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Verification Code</Label>
                  <Input
                    id="code"
                    placeholder="000000"
                    type="text"
                    maxLength={6}
                    disabled={isLoading}
                    {...verificationForm.register("code")}
                    className={cn(
                      "text-center text-2xl tracking-widest font-mono",
                      verificationForm.formState.errors?.code && "border-destructive"
                    )}
                  />
                  {verificationForm.formState.errors?.code && (
                    <p className="px-1 text-xs text-destructive">
                      {verificationForm.formState.errors.code.message}
                    </p>
                  )}
                </div>
                <Button disabled={isLoading} type="submit" className="w-full">
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify Email
                </Button>
              </div>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="text-sm text-muted-foreground text-center">
              Didn't receive the code?
              <Button
                variant="link"
                className="px-2"
                onClick={handleResendCode}
                disabled={isResending || resendCooldown > 0}
              >
                {isResending ? (
                  <>
                    <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                    Sending...
                  </>
                ) : resendCooldown > 0 ? (
                  `Resend Code (${resendCooldown}s)`
                ) : (
                  "Resend Code"
                )}
              </Button>
            </div>
            
            <div className="flex flex-col gap-2 w-full">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowChangeEmail(true)}
              >
                <Edit2 className="mr-2 h-4 w-4" />
                Wrong Email? Change It
              </Button>
            </div>
            
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

        <p className="px-8 text-center text-xs text-muted-foreground mt-4">
          Want to start fresh?{" "}
          <button
            onClick={handleClearPendingEmail}
            className="underline underline-offset-4 hover:text-primary"
          >
            Sign up with a different account
          </button>
        </p>
      </div>

      {/* Change Email Dialog */}
      <Dialog open={showChangeEmail} onOpenChange={setShowChangeEmail}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Enter your new email address. We'll send a new verification code to this address.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={changeEmailForm.handleSubmit(handleChangeEmail)}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="currentEmail">Current Email</Label>
                <Input
                  id="currentEmail"
                  value={email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="newEmail">New Email Address</Label>
                <Input
                  id="newEmail"
                  placeholder="newemail@example.com"
                  type="email"
                  disabled={isChangingEmail}
                  {...changeEmailForm.register("newEmail")}
                  className={cn(
                    changeEmailForm.formState.errors?.newEmail && "border-destructive"
                  )}
                />
                {changeEmailForm.formState.errors?.newEmail && (
                  <p className="px-1 text-xs text-destructive">
                    {changeEmailForm.formState.errors.newEmail.message}
                  </p>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangeEmail(false)}
                disabled={isChangingEmail}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingEmail}>
                {isChangingEmail && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Update Email
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

