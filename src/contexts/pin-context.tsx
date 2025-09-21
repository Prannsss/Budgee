"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { TransactionService } from '@/lib/storage-service';
import { useRouter, usePathname } from 'next/navigation';
import type { AppLockState, PinStatus } from '@/lib/types';
import { PIN_REQUIRED_ON_STARTUP_KEY, APP_LOCK_KEY, VISIBILITY_CHANGE_KEY } from '@/lib/constants';

interface PinContextType {
  pinStatus: PinStatus;
  isAppLocked: boolean;
  shouldShowPinVerification: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  checkPinRequired: () => boolean;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

export function PinProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [pinStatus, setPinStatus] = useState<PinStatus>('not-set');
  const [isAppLocked, setIsAppLocked] = useState(false);
  const [shouldShowPinVerification, setShouldShowPinVerification] = useState(false);

  // Check PIN status when user changes
  useEffect(() => {
    if (user?.id) {
      const hasPinEnabled = TransactionService.hasPinEnabled(user.id);
      setPinStatus(hasPinEnabled ? 'set' : 'not-set');
      
      // Set persistent flag that PIN is required on startup
      if (hasPinEnabled) {
        localStorage.setItem(PIN_REQUIRED_ON_STARTUP_KEY, 'true');
      } else {
        localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
      }
    } else {
      setPinStatus('not-set');
      localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
    }
  }, [user]);

  // Handle visibility change detection
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated || !user?.id) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        // App is being hidden/minimized
        const hasPinEnabled = TransactionService.hasPinEnabled(user.id);
        if (hasPinEnabled) {
          const lockState: AppLockState = {
            isLocked: true,
            lockTriggeredAt: new Date().toISOString(),
            shouldRequirePin: true
          };
          sessionStorage.setItem(APP_LOCK_KEY, JSON.stringify(lockState));
          sessionStorage.setItem(VISIBILITY_CHANGE_KEY, new Date().toISOString());
        }
      } else {
        // App is being shown/restored
        const lockStateStr = sessionStorage.getItem(APP_LOCK_KEY);
        const visibilityTimestamp = sessionStorage.getItem(VISIBILITY_CHANGE_KEY);
        
        if (lockStateStr && visibilityTimestamp) {
          const lockState: AppLockState = JSON.parse(lockStateStr);
          const timeDiff = Date.now() - new Date(visibilityTimestamp).getTime();
          
          // If app was hidden for any amount of time and PIN is enabled, require verification
          if (lockState.shouldRequirePin && timeDiff > 0) {
            setIsAppLocked(true);
            setPinStatus('required');
            
            // Don't redirect if already on pin-verify page
            if (pathname !== '/pin-verify') {
              setShouldShowPinVerification(true);
            }
          }
        }
      }
    };

    // Handle page focus/blur events (for web PWA)
    const handleFocus = () => {
      handleVisibilityChange();
    };

    const handleBlur = () => {
      document.dispatchEvent(new Event('visibilitychange'));
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    // Cleanup
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [isAuthenticated, user, pathname]);

  // Handle navigation to PIN verification
  useEffect(() => {
    if (shouldShowPinVerification && pathname !== '/pin-verify') {
      router.push('/pin-verify');
      setShouldShowPinVerification(false);
    }
  }, [shouldShowPinVerification, pathname, router]);

  // Check if app should be locked on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated || !user?.id) return;

    // Check sessionStorage first for temporary lock state
    const lockStateStr = sessionStorage.getItem(APP_LOCK_KEY);
    if (lockStateStr) {
      const lockState: AppLockState = JSON.parse(lockStateStr);
      if (lockState.isLocked && lockState.shouldRequirePin) {
        const hasPinEnabled = TransactionService.hasPinEnabled(user.id);
        if (hasPinEnabled && pathname !== '/pin-verify') {
          setIsAppLocked(true);
          setPinStatus('required');
          setShouldShowPinVerification(true);
          return;
        }
      }
    }

    // Check localStorage for persistent PIN requirement on app startup
    const pinRequiredOnStartup = localStorage.getItem(PIN_REQUIRED_ON_STARTUP_KEY);
    if (pinRequiredOnStartup === 'true') {
      const hasPinEnabled = TransactionService.hasPinEnabled(user.id);
      if (hasPinEnabled && pathname !== '/pin-verify') {
        // Set app as locked and require PIN verification
        setIsAppLocked(true);
        setPinStatus('required');
        setShouldShowPinVerification(true);
        
        // Also set session storage to maintain lock state during this session
        const lockState: AppLockState = {
          isLocked: true,
          lockTriggeredAt: new Date().toISOString(),
          shouldRequirePin: true
        };
        sessionStorage.setItem(APP_LOCK_KEY, JSON.stringify(lockState));
      }
    }
  }, [isAuthenticated, user, pathname]);

  const lockApp = () => {
    if (!user?.id) return;
    
    const hasPinEnabled = TransactionService.hasPinEnabled(user.id);
    if (hasPinEnabled) {
      const lockState: AppLockState = {
        isLocked: true,
        lockTriggeredAt: new Date().toISOString(),
        shouldRequirePin: true
      };
      sessionStorage.setItem(APP_LOCK_KEY, JSON.stringify(lockState));
      setIsAppLocked(true);
      setPinStatus('required');
    }
  };

  const unlockApp = () => {
    sessionStorage.removeItem(APP_LOCK_KEY);
    sessionStorage.removeItem(VISIBILITY_CHANGE_KEY);
    // Don't remove PIN_REQUIRED_ON_STARTUP_KEY here as we want it to persist
    // until the user disables PIN or logs out
    setIsAppLocked(false);
    setPinStatus(user?.id && TransactionService.hasPinEnabled(user.id) ? 'verified' : 'not-set');
  };

  const checkPinRequired = (): boolean => {
    if (!user?.id) return false;
    return TransactionService.hasPinEnabled(user.id);
  };

  const value: PinContextType = {
    pinStatus,
    isAppLocked,
    shouldShowPinVerification,
    lockApp,
    unlockApp,
    checkPinRequired,
  };

  return (
    <PinContext.Provider value={value}>
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  const context = useContext(PinContext);
  if (context === undefined) {
    throw new Error('usePin must be used within a PinProvider');
  }
  return context;
}