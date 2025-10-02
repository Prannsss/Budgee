'use client';

import { useEffect } from 'react';

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // Check if this is a chunk loading or network-related error
      const isChunkError = event.reason?.message?.includes('Loading chunk') ||
                          event.reason?.message?.includes('Loading CSS chunk');
                          
      const isNetworkError = 
        event.reason?.name === 'TypeError' && 
        (event.reason?.message?.includes('fetch') || 
         event.reason?.message?.includes('network') ||
         event.reason?.message?.includes('Failed to fetch'));

      if (isChunkError || isNetworkError) {
        // Don't prevent default for chunk/network errors in offline scenarios
        // This allows the service worker to handle them properly
        console.log('Chunk/network error detected, allowing service worker to handle');
      } else {
        // For other types of errors, prevent the default behavior
        // which would show the browser's error page
        event.preventDefault();
      }
    };

    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // Check if this is related to offline functionality or chunk loading
      const isOfflineError = 
        event.error?.message?.includes('navigator') ||
        event.error?.message?.includes('onLine') ||
        event.error?.message?.includes('network') ||
        event.error?.message?.includes('Loading chunk');

      if (isOfflineError) {
        console.log('Offline/chunk-related error detected, allowing service worker to handle');
        // Don't prevent default - let service worker handle
      } else {
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