'use client';

import { Wifi, WifiOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function OfflinePage() {
  const handleTryAgain = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md text-center">
        <CardHeader className="pb-4">
          <div className="mx-auto mb-4 p-3 bg-muted rounded-full w-fit">
            <WifiOff className="h-8 w-8 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">You&apos;re Offline</CardTitle>
          <CardDescription className="text-base">
            No internet connection detected. Some features may be limited.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground">
            <p>You can still:</p>
            <ul className="list-disc list-inside mt-2 space-y-1 text-left">
              <li>View cached transactions</li>
              <li>Browse your dashboard</li>
              <li>Add new transactions (will sync later)</li>
            </ul>
          </div>
          <Button 
            onClick={handleTryAgain} 
            className="w-full"
          >
            <Wifi className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
