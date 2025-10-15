"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Delete } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { PinUtils } from "@/lib/utils";
import { API } from "@/lib/api-service";
import { useAuth } from "@/contexts/auth-context";
import { usePin } from "@/contexts/pin-context";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth/protected-route";

export default function PinVerificationPage() {
  return (
    <ProtectedRoute requireAuth={true} allowedWithoutPin={true}>
      <PinVerificationContent />
    </ProtectedRoute>
  );
}

function PinVerificationContent() {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockRemaining, setBlockRemaining] = useState<number>(0); // milliseconds remaining
  const [isRedirecting, setIsRedirecting] = useState(false); // Add this state
  
  const { user, logout } = useAuth();
  const { unlockApp } = usePin();
  const router = useRouter();

  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 30000; // 30 seconds
  const BLOCK_UNTIL_KEY = 'budgee_pin_block_until';

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // Check if session is already verified and redirect to dashboard
    const isSessionVerified = sessionStorage.getItem('budgee_pin_verified_session') === 'true';
    if (isSessionVerified && !isRedirecting) {
      setIsRedirecting(true);
      router.replace('/dashboard');
    }
  }, [user, router, isRedirecting]);

  const handlePinSubmit = async () => {
    if (!user?.id || isBlocked || pin.length !== 6 || isRedirecting) return;

    setIsLoading(true);
    setError('');

    try {
      const { success } = await API.pin.verifyPin(pin);
      
      if (success) {
        // Clear any existing block state on successful verification
        localStorage.removeItem(BLOCK_UNTIL_KEY);
        setAttempts(0);
        setIsBlocked(false);
        
        // Set redirecting state FIRST to prevent re-renders
        setIsRedirecting(true);
        
        // Unlock the app using PIN context (this sets session flag)
        await unlockApp();
        
        // Small delay to ensure state is synchronized
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Navigate to dashboard
        router.replace('/dashboard');
      } else {
        // This shouldn't happen if backend returns proper status codes
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const unblockAt = Date.now() + BLOCK_DURATION;
          localStorage.setItem(BLOCK_UNTIL_KEY, String(unblockAt));
          setIsBlocked(true);
          setBlockRemaining(BLOCK_DURATION);
          setError('Too many failed attempts. Please wait 30 seconds before trying again.');
        } else {
          setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
        
        setPin('');
      }
    } catch (error: any) {
      console.error('PIN verification error:', error);
      
      // Check if the error response contains attempt information from backend
      const errorData = error?.response?.data;
      
      if (errorData?.locked) {
        // Backend says account is locked
        const lockedUntil = errorData.lockedUntil ? new Date(errorData.lockedUntil).getTime() : Date.now() + BLOCK_DURATION;
        const remaining = lockedUntil - Date.now();
        
        if (remaining > 0) {
          localStorage.setItem(BLOCK_UNTIL_KEY, String(lockedUntil));
          setIsBlocked(true);
          setBlockRemaining(remaining);
          setError(errorData.message || 'Too many failed attempts. Please wait before trying again.');
        }
      } else if (errorData?.attemptsRemaining !== undefined) {
        // Backend provided attempts remaining info
        const backendAttemptsUsed = MAX_ATTEMPTS - errorData.attemptsRemaining;
        setAttempts(backendAttemptsUsed);
        
        if (errorData.attemptsRemaining === 0) {
          const unblockAt = Date.now() + BLOCK_DURATION;
          localStorage.setItem(BLOCK_UNTIL_KEY, String(unblockAt));
          setIsBlocked(true);
          setBlockRemaining(BLOCK_DURATION);
          setError('Too many failed attempts. Please wait 30 seconds before trying again.');
        } else {
          setError(`Incorrect PIN. ${errorData.attemptsRemaining} attempts remaining.`);
        }
      } else {
        // Generic error (network, etc.) - increment local attempts
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          const unblockAt = Date.now() + BLOCK_DURATION;
          localStorage.setItem(BLOCK_UNTIL_KEY, String(unblockAt));
          setIsBlocked(true);
          setBlockRemaining(BLOCK_DURATION);
          setError('Too many failed attempts. Please wait 30 seconds before trying again.');
        } else {
          setError(errorData?.message || 'Incorrect PIN. Please try again.');
        }
      }
      
      setPin('');
      setIsRedirecting(false); // Reset on error
    } finally {
      setIsLoading(false);
    }
  };

  const handleNumberPress = (number: string) => {
    if (pin.length < 6 && !isBlocked && !isRedirecting) {
      setPin(prev => prev + number);
      setError('');
    }
  };

  const handleDelete = () => {
    if (pin.length > 0 && !isBlocked && !isRedirecting) {
      setPin(prev => prev.slice(0, -1));
      setError('');
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  // Auto-submit when PIN reaches 6 digits
  useEffect(() => {
    if (pin.length === 6 && !isLoading && !isBlocked && !isRedirecting) {
      handlePinSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pin.length]); // Only depend on pin.length to avoid re-triggering

  // Initialize block state from storage
  useEffect(() => {
    const untilStr = localStorage.getItem(BLOCK_UNTIL_KEY);
    if (!untilStr) return;
    const until = Number(untilStr);
    if (Number.isFinite(until)) {
      const remaining = until - Date.now();
      if (remaining > 0) {
        setIsBlocked(true);
        setBlockRemaining(remaining);
        setError('Too many failed attempts. Please wait 30 seconds before trying again.');
      } else {
        localStorage.removeItem(BLOCK_UNTIL_KEY);
      }
    }
  }, []);

  // Countdown tick
  useEffect(() => {
    if (!isBlocked) return;
    const id = setInterval(() => {
      setBlockRemaining((prev) => {
        const untilStr = localStorage.getItem(BLOCK_UNTIL_KEY);
        const until = untilStr ? Number(untilStr) : 0;
        const remaining = until - Date.now();
        if (remaining <= 0) {
          clearInterval(id);
          localStorage.removeItem(BLOCK_UNTIL_KEY);
          setIsBlocked(false);
          setAttempts(0);
          setError('');
          return 0;
        }
        return remaining;
      });
    }, 250);
    return () => clearInterval(id);
  }, [isBlocked]);

  if (!user) {
    return null; // Will redirect to login
  }

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center relative">
          <div className="absolute right-6 top-6">
            <ThemeToggle />
          </div>
          <div className="flex items-center justify-center mb-6">
            <Logo className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold font-headline mb-2">Budgee</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-8">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold mb-3">Good Day!</h1>
            <div className="flex justify-center">
              <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {user.firstName} {user.lastName}
              </span>
            </div>
          </div>

          {/* PIN Input */}
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium mb-6">Enter your PIN</h3>
            <div className="flex justify-center gap-3 mb-6">
              {[0, 1, 2, 3, 4, 5].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                    index < pin.length
                      ? 'bg-foreground border-foreground'
                      : 'border-foreground/40 bg-transparent'
                  }`}
                />
              ))}
            </div>
            
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription className="text-center text-sm">
                  {isBlocked && blockRemaining > 0
                    ? `Too many failed attempts. Please wait ${Math.ceil(blockRemaining/1000)} seconds before trying again.`
                    : error}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-muted-foreground">
              Never share your PIN or OTP with anyone.
            </p>
          </div>

          {/* Number Pad */}
          <div className="max-w-xs mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {numbers.slice(0, 9).map((number) => (
                <Button
                  key={number}
                  variant="outline"
                  size="lg"
                  onClick={() => handleNumberPress(number)}
                  disabled={isLoading || isBlocked || isRedirecting}
                  className="h-16 w-16 text-2xl font-semibold rounded-xl transition-all duration-200 active:scale-95"
                >
                  {number}
                </Button>
              ))}
            </div>
            
            {/* Bottom row with 0 and delete */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div /> {/* Empty space */}
              <Button
                variant="outline"
                size="lg"
                onClick={() => handleNumberPress('0')}
                disabled={isLoading || isBlocked || isRedirecting}
                className="h-16 w-16 text-2xl font-semibold rounded-xl transition-all duration-200 active:scale-95"
              >
                0
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={handleDelete}
                disabled={isLoading || isBlocked || pin.length === 0 || isRedirecting}
                className="h-16 w-16 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
              >
                <Delete className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 pb-8">
          <div className="flex justify-between items-center text-sm">
            <button
              onClick={handleLogout}
              className="text-destructive hover:text-destructive/100 transition-colors"
              disabled={isLoading}
            >
              Sign out instead
            </button>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>Secured with PIN</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading overlay */}
      {(isLoading || isRedirecting) && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-card rounded-xl p-6 text-center border">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-muted-foreground/30 border-t-primary mx-auto mb-2"></div>
            <p className="text-foreground text-sm">{isRedirecting ? 'Redirecting...' : 'Verifying...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}