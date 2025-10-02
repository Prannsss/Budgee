'use client';

import { useState, useEffect } from 'react';

export function useOnlineStatus() {
  // Default to online to prevent hydration issues
  const [isOnline, setIsOnline] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Mark that we're on the client side
    setIsClient(true);
    
    // Safely check navigator.onLine
    if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
      try {
        setIsOnline(navigator.onLine);
      } catch (error) {
        console.warn('Failed to access navigator.onLine:', error);
        // Default to online if we can't determine status
        setIsOnline(true);
      }
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Only add event listeners if we're in a browser environment
    if (typeof window !== 'undefined') {
      try {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
      } catch (error) {
        console.warn('Failed to add network event listeners:', error);
      }
    }

    return () => {
      if (typeof window !== 'undefined') {
        try {
          window.removeEventListener('online', handleOnline);
          window.removeEventListener('offline', handleOffline);
        } catch (error) {
          console.warn('Failed to remove network event listeners:', error);
        }
      }
    };
  }, []);

  // Return true during SSR to prevent hydration mismatches
  return isClient ? isOnline : true;
}
