"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './auth-context';
import { API } from '@/lib/api-service';
import { useRouter, usePathname } from 'next/navigation';
import type { AppLockState, PinStatus } from '@/lib/types';
import { PIN_REQUIRED_ON_STARTUP_KEY, APP_LOCK_KEY, VISIBILITY_CHANGE_KEY, PIN_VERIFIED_SESSION_KEY } from '@/lib/constants';

interface PinContextType {
  pinStatus: PinStatus;
  isAppLocked: boolean;
  shouldShowPinVerification: boolean;
  lockApp: () => Promise<void>;
  unlockApp: () => Promise<void>;
  checkPinRequired: () => Promise<boolean>;
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
    const checkPinStatus = async () => {
      if (user?.id) {
        try {
          const { enabled } = await API.pin.hasPinEnabled();
          setPinStatus(enabled ? 'set' : 'not-set');
          
          // Set persistent flag that PIN is required on startup
          if (enabled) {
            localStorage.setItem(PIN_REQUIRED_ON_STARTUP_KEY, 'true');
          } else {
            localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
          }
        } catch (error) {
          // If PIN API is not implemented yet, gracefully default to no PIN
          console.warn('PIN API not available, defaulting to no PIN protection:', error);
          setPinStatus('not-set');
          localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
        }
      } else {
        setPinStatus('not-set');
        localStorage.removeItem(PIN_REQUIRED_ON_STARTUP_KEY);
      }
    };

    checkPinStatus();
  }, [user]);

  // Handle visibility change detection
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated || !user?.id) return;

    const handleVisibilityChange = async () => {
      if (document.hidden) {
        // App is being hidden/minimized
        try {
          const { enabled } = await API.pin.hasPinEnabled();
          if (enabled) {
            const lockState: AppLockState = {
              isLocked: true,
              lockTriggeredAt: new Date().toISOString(),
              shouldRequirePin: true
            };
            sessionStorage.setItem(APP_LOCK_KEY, JSON.stringify(lockState));
            sessionStorage.setItem(VISIBILITY_CHANGE_KEY, new Date().toISOString());
          }
        } catch (error) {
          // If PIN API is not available, skip PIN locking on visibility change
          console.warn('PIN API not available on visibility change:', error);
        }
      } else {
        // App is being shown/restored
        const lockStateStr = sessionStorage.getItem(APP_LOCK_KEY);
        const visibilityTimestamp = sessionStorage.getItem(VISIBILITY_CHANGE_KEY);
        
        if (lockStateStr && visibilityTimestamp) {
          const lockState: AppLockState = JSON.parse(lockStateStr);
          const timeDiff = Date.now() - new Date(visibilityTimestamp).getTime();
          
          // If app was hidden for any amount of time and PIN is enabled, require verification
          const isSessionVerified = sessionStorage.getItem(PIN_VERIFIED_SESSION_KEY) === 'true';
          if (lockState.shouldRequirePin && timeDiff > 0 && !isSessionVerified) {
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
    if (shouldShowPinVerification && pathname !== '/pin-verify' && isAppLocked) {
      router.push('/pin-verify');
      setShouldShowPinVerification(false);
    }
  }, [shouldShowPinVerification, pathname, router, isAppLocked]);

  // Check if app should be locked on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !isAuthenticated || !user?.id) return;

    // Check sessionStorage first for temporary lock state
    const lockStateStr = sessionStorage.getItem(APP_LOCK_KEY);
    if (lockStateStr) {
      const lockState: AppLockState = JSON.parse(lockStateStr);
      const isSessionVerified = sessionStorage.getItem(PIN_VERIFIED_SESSION_KEY) === 'true';
      if (lockState.isLocked && lockState.shouldRequirePin && !isSessionVerified) {
        // Check PIN status asynchronously
        API.pin.hasPinEnabled()
          .then(({ enabled }) => {
            if (enabled && pathname !== '/pin-verify') {
              setIsAppLocked(true);
              setPinStatus('required');
              setShouldShowPinVerification(true);
            }
          })
          .catch(error => {
            console.error('Error checking PIN status on mount:', error);
          });
        return;
      }
    }

    // Check localStorage for persistent PIN requirement on app startup
    const pinRequiredOnStartup = localStorage.getItem(PIN_REQUIRED_ON_STARTUP_KEY);
    if (pinRequiredOnStartup === 'true') {
      const isSessionVerified = sessionStorage.getItem(PIN_VERIFIED_SESSION_KEY) === 'true';
      if (pathname !== '/pin-verify' && !isSessionVerified) {
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

  const lockApp = async () => {
    if (!user?.id) return;
    
    try {
      const { enabled } = await API.pin.hasPinEnabled();
      if (enabled) {
        // Clear session verified marker when locking again
        sessionStorage.removeItem(PIN_VERIFIED_SESSION_KEY);
        const lockState: AppLockState = {
          isLocked: true,
          lockTriggeredAt: new Date().toISOString(),
          shouldRequirePin: true
        };
        sessionStorage.setItem(APP_LOCK_KEY, JSON.stringify(lockState));
        setIsAppLocked(true);
        setPinStatus('required');
      }
    } catch (error) {
      // If PIN API is not available, silently skip PIN locking
      console.warn('PIN API not available, skipping app lock:', error);
    }
  };

  const unlockApp = async () => {
    sessionStorage.removeItem(APP_LOCK_KEY);
    sessionStorage.removeItem(VISIBILITY_CHANGE_KEY);
    // Don't remove PIN_REQUIRED_ON_STARTUP_KEY here as we want it to persist
    // until the user disables PIN or logs out
    setIsAppLocked(false);
    setShouldShowPinVerification(false);
    // Explicitly mark the current session as verified if PIN is enabled
    if (user?.id) {
      try {
        const { enabled } = await API.pin.hasPinEnabled();
        if (enabled) {
          sessionStorage.setItem(PIN_VERIFIED_SESSION_KEY, 'true');
          setPinStatus('verified');
        } else {
          setPinStatus('not-set');
        }
      } catch (error) {
        // If PIN API is not available, default to not-set
        console.warn('PIN API not available when unlocking app:', error);
        setPinStatus('not-set');
      }
    }
  };

  const checkPinRequired = async (): Promise<boolean> => {
    if (!user?.id) return false;
    try {
      const { enabled } = await API.pin.hasPinEnabled();
      return enabled;
    } catch (error) {
      // If PIN API is not available, PIN is not required
      console.warn('PIN API not available, PIN not required:', error);
      return false;
    }
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