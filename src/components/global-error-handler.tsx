'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if this is a network-related error
      const isNetworkError = 
        event.reason?.name === 'TypeError' && 
        (event.reason?.message?.includes('fetch') || 
         event.reason?.message?.includes('network') ||
         event.reason?.message?.includes('Failed to fetch'));

      if (isNetworkError) {
        // Don't prevent default for network errors in offline scenarios
        // This allows the app to gracefully handle them
        console.log('Network error detected, allowing graceful handling');
      } else {
        // For other types of errors, prevent the default behavior
        // which would show the browser's error page
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Check if this is related to offline functionality
      const isOfflineError = 
        event.error?.message?.includes('navigator') ||
        event.error?.message?.includes('onLine') ||
        event.error?.message?.includes('network');

      if (isOfflineError) {
        console.log('Offline-related error detected, suppressing');
        event.preventDefault();
      }
    };

    // Add global error handlers
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}