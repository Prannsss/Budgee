'use client';

import { useEffect, useState } from 'react';
import SplashScreen from '@/components/SplashScreen';

export function PWAInstaller() {
  const [showSplash, setShowSplash] = useState(false);

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
  useEffect(() => {
    const isStandalone = () =>
      window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;

    try {
      const alreadyShown = sessionStorage.getItem('budgee_splash_shown');
      if (isStandalone() && !alreadyShown) {
        setShowSplash(true);
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const handleFinish = () => {
    try {
      sessionStorage.setItem('budgee_splash_shown', '1');
    } catch {
      // ignore
    }
    setShowSplash(false);
  };

  return showSplash ? <SplashScreen onFinish={handleFinish} /> : null;
}
