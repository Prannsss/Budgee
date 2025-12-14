'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import SplashScreen from '@/components/SplashScreen';

// Context to share splash state with children
interface SplashContextType {
  isSplashComplete: boolean;
  showSplash: boolean;
}

const SplashContext = createContext<SplashContextType>({ 
  isSplashComplete: true, 
  showSplash: false 
});

export const useSplash = () => useContext(SplashContext);

interface PWAInstallerProps {
  children?: React.ReactNode;
}

export function PWAInstaller({ children }: PWAInstallerProps) {
  // Initialize splash state immediately for standalone mode
  const [showSplash, setShowSplash] = useState(() => {
    if (typeof window === 'undefined') return false;
    
    const isStandalone = () =>
      window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;

    try {
      const alreadyShown = sessionStorage.getItem('budgee_splash_shown');
      return isStandalone() && !alreadyShown;
    } catch {
      return false;
    }
  });

  const [isSplashComplete, setIsSplashComplete] = useState(() => {
    if (typeof window === 'undefined') return true;
    
    const isStandalone = () =>
      window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;

    try {
      const alreadyShown = sessionStorage.getItem('budgee_splash_shown');
      // If not standalone or already shown, splash is complete
      return !isStandalone() || !!alreadyShown;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered successfully:', registration.scope);
        })
        .catch((error) => {
          console.log('Service Worker registration failed:', error);
        });
    }

    // Handle PWA install prompt
    let deferredPrompt: any;
    
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      deferredPrompt = e;
      
      // Show install button or notification
      // You can dispatch a custom event here to show your custom install UI
      window.dispatchEvent(new CustomEvent('pwa-installable'));
    };

    const handleAppInstalled = () => {
      console.log('PWA was installed');
      window.dispatchEvent(new CustomEvent('pwa-installed'));
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Expose install function to global scope
    (window as any).installPWA = async () => {
      if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
      }
    };

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Show splash only when running as installed PWA and not yet shown this session
  // Note: Initial state is set in useState initializer for immediate effect

  const handleFinish = () => {
    try {
      sessionStorage.setItem('budgee_splash_shown', '1');
    } catch {
      // ignore
    }
    setShowSplash(false);
    setIsSplashComplete(true);
    
    // Ensure body scroll is restored after splash screen
    if (typeof document !== 'undefined') {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.body.style.height = '';
      document.documentElement.style.overflow = '';
    }
  };

  return (
    <SplashContext.Provider value={{ isSplashComplete, showSplash }}>
      {showSplash && <SplashScreen onFinish={handleFinish} />}
      {/* Only render children when splash is complete */}
      {isSplashComplete ? children : (
        <div className="min-h-screen bg-background" aria-hidden="true" />
      )}
    </SplashContext.Provider>
  );
}
