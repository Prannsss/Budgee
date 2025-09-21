"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { TransactionService } from '@/lib/storage-service';
import { useRouter, usePathname } from 'next/navigation';
import type { AppLockState, PinStatus } from '@/lib/types';

interface PinContextType {
  pinStatus: PinStatus;
  isAppLocked: boolean;
  shouldShowPinVerification: boolean;
  lockApp: () => void;
  unlockApp: () => void;
  checkPinRequired: () => boolean;
}

const PinContext = createContext<PinContextType | undefined>(undefined);

// Session storage key for app lock state
const APP_LOCK_KEY = 'budgee_app_locked';
const VISIBILITY_CHANGE_KEY = 'budgee_visibility_timestamp';

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
    } else {
      setPinStatus('not-set');
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

    const lockStateStr = sessionStorage.getItem(APP_LOCK_KEY);
    if (lockStateStr) {
      const lockState: AppLockState = JSON.parse(lockStateStr);
      if (lockState.isLocked && lockState.shouldRequirePin) {
        const hasPinEnabled = TransactionService.hasPinEnabled(user.id);
        if (hasPinEnabled && pathname !== '/pin-verify') {
          setIsAppLocked(true);
          setPinStatus('required');
          setShouldShowPinVerification(true);
        }
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