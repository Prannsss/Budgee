'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);
  const [hasBeenOffline, setHasBeenOffline] = useState(false);

  useEffect(() => {
    try {
      if (!isOnline) {
        setShowOfflineMessage(true);
        setHasBeenOffline(true);
      } else if (hasBeenOffline) {
        // Show "back online" message briefly when reconnected
        setShowOfflineMessage(true);
        const timer = setTimeout(() => {
          setShowOfflineMessage(false);
        }, 2000);
        return () => clearTimeout(timer);
      }
    } catch (error) {
      console.warn('Error in OfflineIndicator:', error);
      // Don't show indicator if there's an error
      setShowOfflineMessage(false);
    }
  }, [isOnline, hasBeenOffline]);

  // Don't render during SSR or if there's no message to show
  if (typeof window === 'undefined' || !showOfflineMessage) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge 
        variant={isOnline ? "default" : "secondary"}
        className="px-3 py-2 flex items-center gap-2 animate-in slide-in-from-top-2"
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4" />
            Back online
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4" />
            You&apos;re offline
          </>
        )}
      </Badge>
    </div>
  );
}
