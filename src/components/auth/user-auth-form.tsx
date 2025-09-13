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
import { Loader2 } from "lucide-react";
import { GoogleIcon } from "../icons/google";
import { FacebookIcon } from "../icons/facebook";

interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {
  formType: "login" | "signup";
}

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters." }),
});

type FormData = z.infer<typeof formSchema>;

export function UserAuthForm({ className, formType, ...props }: UserAuthFormProps) {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema),
  });
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isSocialLoading, setIsSocialLoading] = React.useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  async function onSubmit(data: FormData) {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsLoading(false);

    toast({
      title: "Success!",
      description: formType === "login" ? "You are now logged in." : "Your account has been created.",
    });

    router.push("/dashboard");
  }
  
  async function onSocialLogin(provider: 'google' | 'facebook') {
    setIsSocialLoading(provider);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsSocialLoading(null);
    router.push("/dashboard");
  }

  const handleTestLogin = () => {
    router.push("/dashboard");
  }

  return (
    <div className={cn("grid gap-6", className)} {...props}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4">
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
            <Input
              id="password"
              placeholder="••••••••"
              type="password"
              disabled={isLoading}
              {...register("password")}
            />
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
            {formType === 'login' ? 'Sign In with Email' : 'Sign Up with Email'}
          </Button>
        </div>
      </form>

      {formType === 'login' && (
        <Button onClick={handleTestLogin} variant="outline" type="button">
          Test login
        </Button>
      )}

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
      <div className="grid grid-cols-2 gap-4">
        <Button variant="outline" type="button" disabled={isLoading || !!isSocialLoading} onClick={() => onSocialLogin('google')}>
          {isSocialLoading === 'google' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <GoogleIcon className="mr-2 h-4 w-4" />
          )}{" "}
          Google
        </Button>
        <Button variant="outline" type="button" disabled={isLoading || !!isSocialLoading} onClick={() => onSocialLogin('facebook')}>
          {isSocialLoading === 'facebook' ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <FacebookIcon className="mr-2 h-4 w-4" />
          )}{" "}
          Facebook
        </Button>
      </div>
    </div>
  );
}
