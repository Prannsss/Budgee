'use client';

import { useOnlineStatus } from '@/hooks/use-online-status';
import { Badge } from '@/components/ui/badge';
import { WifiOff, Wifi } from 'lucide-react';
import { useState, useEffect } from 'react';

export function OfflineIndicator() {
  const isOnline = useOnlineStatus();
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      setShowOfflineMessage(true);
    } else {
      // Hide the message after a brief delay when back online
      const timer = setTimeout(() => {
        setShowOfflineMessage(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline]);

  if (!showOfflineMessage) {
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
