'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, X, Smartphone, Monitor } from 'lucide-react';

export function InstallPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    const checkIfInstalled = () => {
      if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
        setIsInstalled(true);
        return;
      }
      
      if ((window.navigator as any).standalone === true) {
        setIsInstalled(true);
        return;
      }
    };

    checkIfInstalled();

    // Listen for PWA events
    const handlePWAInstallable = () => {
      if (!isInstalled) {
        setIsInstallable(true);
        // Show prompt after a delay
        setTimeout(() => setIsVisible(true), 3000);
      }
    };

    const handlePWAInstalled = () => {
      setIsInstalled(true);
      setIsVisible(false);
      setIsInstallable(false);
    };

    window.addEventListener('pwa-installable', handlePWAInstallable);
    window.addEventListener('pwa-installed', handlePWAInstalled);

    return () => {
      window.removeEventListener('pwa-installable', handlePWAInstallable);
      window.removeEventListener('pwa-installed', handlePWAInstalled);
    };
  }, [isInstalled]);

  const handleInstall = () => {
    if ((window as any).installPWA) {
      (window as any).installPWA();
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!isVisible || !isInstallable || isInstalled) {
    return null;
  }

  // Check if user already dismissed this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-2">
      <Card className="w-80 shadow-lg border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary rounded-lg">
                <Download className="h-4 w-4 text-primary-foreground" />
              </div>
              <CardTitle className="text-lg">Install Budgee</CardTitle>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="h-6 w-6 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription>
            Install Budgee on your device for a better experience
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Smartphone className="h-4 w-4" />
              <span>Easier Access</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Monitor className="h-4 w-4" />
              <span>Fast and reliable</span>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={handleInstall} className="flex-1">
                <Download className="h-4 w-4 mr-2" />
                Install
              </Button>
              <Button variant="outline" onClick={handleDismiss}>
                Not now
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
