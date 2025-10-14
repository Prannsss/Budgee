"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff } from "lucide-react";
import { PinUtils } from "@/lib/utils";
import { API } from "@/lib/api-service";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";

interface PinSetupProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PinSetup({ onSuccess, onCancel }: PinSetupProps) {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePinChange = (value: string) => {
    setPin(value);
    setError('');
    setWarning('');
    
    if (value.length === 6) {
      const validation = PinUtils.validatePinFormat(value);
      if (!validation.isValid) {
        setError(validation.error || '');
        return;
      }
      
      const strength = PinUtils.checkPinStrength(value);
      if (!strength.isStrong) {
        setWarning(strength.warning || '');
      }
    }
    // Don't show error while user is still typing (length < 6)
  };

  const handleConfirmPinChange = (value: string) => {
    setConfirmPin(value);
    setError('');
    
    if (value.length === 6) {
      if (value !== pin) {
        setError('PINs do not match');
      }
    }
    // Don't show error while user is still typing (length < 6)
  };

  const handleContinue = () => {
    const validation = PinUtils.validatePinFormat(pin);
    if (!validation.isValid) {
      setError(validation.error || '');
      return;
    }
    
    const strength = PinUtils.checkPinStrength(pin);
    if (!strength.isStrong) {
      setError(strength.warning || '');
      return;
    }
    
    setStep('confirm');
  };

  const handleBack = () => {
    setStep('enter');
    setConfirmPin('');
    setError('');
  };

  const handleSetupPin = async () => {
    if (!user?.id) {
      setError('User not found. Please try logging in again.');
      return;
    }

    if (pin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    setIsLoading(true);
    try {
      await API.pin.setupPin(pin);
      
      toast({
        title: "PIN Set Successfully",
        description: "Your PIN has been set up. Your account is now protected with PIN security.",
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('PIN setup error:', error);
      setError('PIN setup is not available yet. This feature will be enabled soon.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>
          {step === 'enter' ? 'Set Up PIN' : 'Confirm PIN'}
        </CardTitle>
        <CardDescription>
          {step === 'enter' 
            ? 'Create a 6-digit PIN to secure your account'
            : 'Please confirm your PIN by entering it again'
          }
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {step === 'enter' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="pin">Enter PIN</Label>
              <div className="relative">
                <Input
                  id="pin"
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="Enter your PIN"
                  maxLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {warning && (
              <Alert>
                <AlertDescription>{warning}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={handleContinue}
                disabled={pin.length !== 6 || !!error || isLoading}
                className="w-full"
              >
                Continue
              </Button>
              {onCancel && (
                <Button 
                  variant="outline" 
                  onClick={onCancel}
                  className="w-full"
                >
                  Cancel
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="confirmPin">Confirm PIN</Label>
              <div className="relative">
                <Input
                  id="confirmPin"
                  type={showPin ? "text" : "password"}
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  placeholder="Confirm your PIN"
                  maxLength={6}
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPin(!showPin)}
                >
                  {showPin ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Button 
                onClick={handleSetupPin}
                disabled={confirmPin.length !== 6 || !!error || isLoading}
                className="w-full"
              >
                {isLoading ? 'Setting up...' : 'Set PIN'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleBack}
                disabled={isLoading}
                className="w-full"
              >
                Back
              </Button>
            </div>
          </>
        )}
        
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>PIN Requirements:</p>
          <p>• Exactly 6 digits only</p>
          <p>• Avoid sequential numbers (123456)</p>
          <p>• Avoid repeating numbers (111111)</p>
        </div>
      </CardContent>
    </Card>
  );
}