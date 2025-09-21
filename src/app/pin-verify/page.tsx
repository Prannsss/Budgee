"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Lock, Delete } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { PinUtils } from "@/lib/utils";
import { TransactionService } from "@/lib/storage-service";
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
  const [isRedirecting, setIsRedirecting] = useState(false); // Add this state
  
  const { user, logout } = useAuth();
  const { unlockApp } = usePin();
  const router = useRouter();

  const MAX_ATTEMPTS = 3;
  const BLOCK_DURATION = 30000; // 30 seconds

  useEffect(() => {
    // If user is not logged in, redirect to login
    if (!user) {
      router.push('/login');
      return;
    }

    // If user doesn't have PIN enabled, redirect to dashboard
    if (!TransactionService.hasPinEnabled(user.id)) {
      router.push('/dashboard');
      return;
    }
  }, [user, router]);

  const handlePinSubmit = async () => {
    if (!user?.id || isBlocked || pin.length !== 6 || isRedirecting) return;

    setIsLoading(true);
    setError('');

    try {
      const pinData = TransactionService.getPinData(user.id);
      
      if (!pinData || !pinData.isEnabled) {
        setError('PIN not found. Please contact support.');
        setIsLoading(false);
        return;
      }

      const isValid = await PinUtils.verifyPin(pin, pinData.hashedPin);
      
      if (isValid) {
        // Update last used timestamp
        TransactionService.updatePinLastUsed(user.id);
        
        // Unlock the app using PIN context
        unlockApp();
        
        // Set redirecting state to prevent multiple submissions
        setIsRedirecting(true);
        
        // Use replace instead of push to avoid back navigation issues
        // Add a small delay to ensure state is updated
        setTimeout(() => {
          router.replace('/dashboard');
        }, 100);
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= MAX_ATTEMPTS) {
          setIsBlocked(true);
          setError(`Too many failed attempts. Please wait 30 seconds before trying again.`);
          
          // Block for 30 seconds
          setTimeout(() => {
            setIsBlocked(false);
            setAttempts(0);
            setError('');
          }, BLOCK_DURATION);
        } else {
          setError(`Incorrect PIN. ${MAX_ATTEMPTS - newAttempts} attempts remaining.`);
        }
        
        setPin('');
      }
    } catch (error) {
      setError('Failed to verify PIN. Please try again.');
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
  }, [pin.length, isLoading, isBlocked, isRedirecting]); // Only depend on pin.length, not the whole pin

  if (!user) {
    return null; // Will redirect to login
  }

  const numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary to-primary/80 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/50 via-transparent to-primary/30" />
      
      <div className="relative z-10 flex flex-col h-screen">
        {/* Header */}
        <div className="flex-shrink-0 pt-12 pb-8 px-6 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white backdrop-blur-sm rounded-2xl p-4">
              <Logo className="h-8 w-8" />
            </div>
          </div>
          <h1 className="text-3xl font-bold font-headline mb-2">Budgee</h1>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col justify-center px-6 pb-8">
          {/* Greeting */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold mb-2">Good Day!</h2>
            <p className="text-white/80">
              {user.firstName} {user.lastName}
            </p>
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
                      ? 'bg-white border-white'
                      : 'border-white/50 bg-transparent'
                  }`}
                />
              ))}
            </div>
            
            {error && (
              <Alert className="mb-4 bg-red-500/20 border-red-400/50 text-white">
                <AlertDescription className="text-center text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}
            
            <p className="text-sm text-white/70">
              Never share your PIN or OTP with anyone.
            </p>
          </div>

          {/* Number Pad */}
          <div className="max-w-xs mx-auto">
            <div className="grid grid-cols-3 gap-4 mb-4">
              {numbers.slice(0, 9).map((number) => (
                <Button
                  key={number}
                  variant="ghost"
                  size="lg"
                  onClick={() => handleNumberPress(number)}
                  disabled={isLoading || isBlocked || isRedirecting}
                  className="h-16 w-16 text-2xl font-semibold text-white hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-200 active:scale-95"
                >
                  {number}
                </Button>
              ))}
            </div>
            
            {/* Bottom row with 0 and delete */}
            <div className="grid grid-cols-3 gap-4 items-center">
              <div /> {/* Empty space */}
              <Button
                variant="ghost"
                size="lg"
                onClick={() => handleNumberPress('0')}
                disabled={isLoading || isBlocked || isRedirecting}
                className="h-16 w-16 text-2xl font-semibold text-white hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-200 active:scale-95"
              >
                0
              </Button>
              <Button
                variant="ghost"
                size="lg"
                onClick={handleDelete}
                disabled={isLoading || isBlocked || pin.length === 0 || isRedirecting}
                className="h-16 w-16 text-white hover:bg-white/10 border border-white/20 rounded-xl transition-all duration-200 active:scale-95 disabled:opacity-50"
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
              className="text-white/80 hover:text-white transition-colors"
              disabled={isLoading}
            >
              Sign out instead
            </button>
            <div className="flex items-center gap-2 text-white/70">
              <Shield className="h-4 w-4" />
              <span>Secured with PIN</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Loading overlay */}
      {(isLoading || isRedirecting) && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white/30 border-t-white mx-auto mb-2"></div>
            <p className="text-white text-sm">{isRedirecting ? 'Redirecting...' : 'Verifying...'}</p>
          </div>
        </div>
      )}
    </div>
  );
}