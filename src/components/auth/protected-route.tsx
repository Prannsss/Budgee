"use client";

import { useAuth } from "@/contexts/auth-context";
import { usePin } from "@/contexts/pin-context";
import { TransactionService } from "@/lib/storage-service";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  allowedWithoutPin?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requireAuth = true, 
  allowedWithoutPin = false 
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { pinStatus, isAppLocked } = usePin();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // If user is authenticated but app is locked with PIN
    if (isAuthenticated && isAppLocked && !allowedWithoutPin) {
      // Don't redirect if already on pin-verify page
      if (pathname !== '/pin-verify') {
        router.push('/pin-verify');
        return;
      }
    }

    // If user is on pin-verify page but PIN is not required
    if (pathname === '/pin-verify' && isAuthenticated) {
      // Only redirect if we're certain PIN is not set (avoid race conditions)
      const hasPinEnabled = user?.id ? TransactionService.hasPinEnabled(user.id) : false;
      if (!hasPinEnabled) {
        router.push('/dashboard');
        return;
      }
    }
  }, [isAuthenticated, isLoading, isAppLocked, pinStatus, requireAuth, allowedWithoutPin, router, pathname]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    return null; // Will redirect to login
  }

  // If app is locked and PIN verification is required
  if (isAuthenticated && isAppLocked && !allowedWithoutPin && pathname !== '/pin-verify') {
    return null; // Will redirect to pin verification
  }

  return <>{children}</>;
}

interface PublicRouteProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function PublicRoute({ children, redirectTo = '/dashboard' }: PublicRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router, redirectTo]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}