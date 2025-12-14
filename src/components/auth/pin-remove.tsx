"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Eye, EyeOff } from "lucide-react";
import { API } from "@/lib/api-service";
import { useAuth } from "@/contexts/auth-context";
import { useToast } from "@/hooks/use-toast";
import { PIN_REQUIRED_ON_STARTUP_KEY } from "@/lib/constants";

interface PinRemoveProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PinRemove({ onSuccess, onCancel }: PinRemoveProps) {
  const [pin, setPin] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePinChange = (value: string) => {
    setPin(value);
    setError('');
  };

  const handleRemovePin = async () => {
    if (!user?.id) {
      setError('User not found. Please try logging in again.');
      return;
    }

    if (pin.length !== 6) {
      setError('PIN must be 6 digits');
      return;
    }

    setIsLoading(true);
    try {
      // First verify the PIN, then remove it
      await API.pin.removePin(pin);
      
      // Clear the persistent PIN requirement flag
      localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
      
      toast({
        title: "PIN Removed",
        description: "PIN protection has been disabled for your account.",
        variant: "success",
      });
      
      onSuccess?.();
    } catch (error: any) {
      console.error('PIN removal error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to remove PIN. Please check your PIN and try again.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-center space-y-2">
        <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <p className="text-lg font-semibold">Remove PIN Protection</p>
        <p className="text-sm text-muted-foreground">
          Enter your current PIN to confirm removal. Your account will no longer be protected with a PIN.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="removePin">Current PIN</Label>
        <div className="relative">
          <Input
            id="removePin"
            type={showPin ? "text" : "password"}
            value={pin}
            onChange={(e) => handlePinChange(e.target.value)}
            placeholder="Enter your PIN"
            maxLength={6}
            className="pr-10"
            autoFocus
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
      
      <div className="flex justify-end space-x-2">
        <Button 
          variant="outline" 
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleRemovePin}
          disabled={pin.length !== 6 || isLoading}
        >
          {isLoading ? 'Removing...' : 'Remove PIN'}
        </Button>
      </div>
    </div>
  );
}
