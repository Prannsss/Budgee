"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleIcon } from "../icons/google";
import { FacebookIcon } from "../icons/facebook";
import { useAuth } from "@/contexts/auth-context";
import { PENDING_EMAIL_KEY } from "@/lib/constants";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  formType: "login" | "signup";
}

const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

const signupSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string()
    .min(8, { message: "Password must be at least 8 characters." })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter." })
    .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter." })
    .regex(/[0-9]/, { message: "Password must contain at least one number." }),
});

type LoginFormData = z.infer<typeof loginSchema>;
type SignupFormData = z.infer<typeof signupSchema>;

export function UserAuthForm({ className, formType, ...props }: UserAuthFormProps) {
  const schema = formType === 'signup' ? signupSchema : loginSchema;
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(schema),
    defaultValues: formType === 'signup' ? {
      firstName: '',
      lastName: '',
      email: '',
      password: ''
    } : {
      email: '',
      password: ''
    }
  }) as any;
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSocialLoading, setIsSocialLoading] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState<boolean>(false);
  const { toast } = useToast();
  const router = useRouter();
  const { login, signup } = useAuth();

  async function onSubmit(data: any) {
    setIsLoading(true);

    try {
      let success = false;
      
      if (formType === "login") {
        try {
          success = await login(data.email, data.password);
          
          if (success) {
            toast({
              title: "Success!",
              description: "You are now logged in.",
              variant: "success",
            });
            router.push("/dashboard");
          } else {
            toast({
              title: "Error",
              description: "Invalid credentials. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          // Check if error is due to unverified email (403 status or specific message)
          const isUnverified = 
            error.response?.status === 403 ||
            error.response?.data?.requiresVerification ||
            (error.message && error.message.toLowerCase().includes('verify'));
          
          if (isUnverified) {
            // Store email for recovery flow
            localStorage.setItem(PENDING_EMAIL_KEY, data.email);
            
            toast({
              title: "Email Not Verified",
              description: "Please verify your email address to continue.",
              variant: "destructive",
            });
            // Redirect to verification page with email
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          } else {
            toast({
              title: "Error",
              description: error.response?.data?.message || "Invalid credentials. Please try again.",
              variant: "destructive",
            });
          }
        }
      } else {
        // Signup using auth context
        try {
          const success = await signup(data.email, data.password, data.firstName, data.lastName);
          
          if (success) {
            // Store pending email for recovery flow
            localStorage.setItem(PENDING_EMAIL_KEY, data.email);
            
            toast({
              title: "Account Created! 🎉",
              description: "Please check your email to verify your account.",
              variant: "success",
            });
            
            // Redirect to verification page with email
            router.push(`/verify-email?email=${encodeURIComponent(data.email)}`);
          } else {
            toast({
              title: "Error",
              description: "Failed to create account. Please try again.",
              variant: "destructive",
            });
          }
        } catch (error: any) {
          console.error('Signup error:', error);
          toast({
            title: "Error",
            description: error.message || "Failed to connect to server. Please check your internet connection and try again.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  async function onSocialLogin(provider: 'google' | 'facebook') {
    setIsSocialLoading(provider);
    
    try {
      // Redirect to backend OAuth endpoint
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      window.location.href = `${apiUrl}/api/auth/${provider}`;
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
      setIsSocialLoading(null);
    }
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* Always show signup fields for debugging */}
          {formType === 'signup' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">
                    First Name
                  </Label>
                  <Input
                    id="firstName"
                    placeholder="Juan"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="given-name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...register("firstName")}
                  />
                  {errors?.firstName && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.firstName?.message || "First name is required"}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">
                    Last Name
                  </Label>
                  <Input
                    id="lastName"
                    placeholder="Dela Cruz"
                    type="text"
                    autoCapitalize="words"
                    autoComplete="family-name"
                    autoCorrect="off"
                    disabled={isLoading}
                    {...register("lastName")}
                  />
                  {errors?.lastName && (
                    <p className="px-1 text-xs text-destructive">
                      {errors.lastName?.message || "Last name is required"}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="email">
              Email
            </Label>
            <Input
              id="email"
              placeholder="juandelacruz@gmail.com"
              type="email"
              autoCapitalize="none"
              autoComplete="email"
              autoCorrect="off"
              disabled={isLoading}
              {...register("email")}
            />
            {errors?.email && (
              <p className="px-1 text-xs text-destructive">
                {errors.email.message}
              </p>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="password">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                {...register("password")}
                className="pr-10"
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
          <Button disabled={isLoading}>
            {isLoading && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {formType === 'login' 
              ? 'Login with Email' 
              : 'Create Account'
            }
          </Button>
        </div>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
        </div>
      </div>
      <div className="grid gap-3">
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading || !!isSocialLoading} 
          onClick={() => onSocialLogin('google')}
          className="w-full h-12 rounded-full border-2"
        >
          {isSocialLoading === 'google' ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-5 w-5" />
          )}
          Sign {formType === 'login' ? 'in' : 'up'} with Google
        </Button>
        <Button 
          variant="outline" 
          type="button" 
          disabled={isLoading || !!isSocialLoading} 
          onClick={() => onSocialLogin('facebook')}
          className="w-full h-12 rounded-full border-2"
        >
          {isSocialLoading === 'facebook' ? (
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
          ) : (
            <FacebookIcon className="mr-2 h-5 w-5" />
          )}
          Sign {formType === 'login' ? 'in' : 'up'} with Facebook
        </Button>
      </div>
    </div>
  );
}
