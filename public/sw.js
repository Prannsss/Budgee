// Service Worker for Budgee PWA
const CACHE_NAME = 'budgee-v1';
const STATIC_CACHE_NAME = 'budgee-static-v1';
const DYNAMIC_CACHE_NAME = 'budgee-dynamic-v1';

// Files to cache immediately - including offline page for navigation fallback
const STATIC_ASSETS = [
  '/manifest.json',
  '/offline',
  '/favicon.ico',
  '/icons/icon-72x72.png',
  '/icons/icon-96x96.png',
  '/icons/icon-128x128.png',
  '/icons/icon-144x144.png',
  '/icons/icon-152x152.png',
  '/icons/icon-180x180.png',
  '/icons/icon-192x192.png',
  '/icons/icon-384x384.png',
  '/icons/icon-512x512.png',
  '/icons/shortcut-add.png',
  '/icons/shortcut-dashboard.png',
  '/icons/shortcut-chat.png'
];

// Cache the offline page HTML during install
const OFFLINE_FALLBACK_PAGE = '/offline';

// API routes that should be cached
const API_CACHE_PATTERNS = [
  /^https:\/\/api\./,
  /^\/api\//
];

// Install event - cache static assets and offline page
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    Promise.all([
      // Cache static assets
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Caching static assets');
          return cache.addAll(STATIC_ASSETS);
        }),
      // Pre-cache the offline page by fetching it
      caches.open(STATIC_CACHE_NAME)
        .then((cache) => {
          console.log('Service Worker: Pre-caching offline page');
          return fetch(OFFLINE_FALLBACK_PAGE)
            .then((response) => {
              if (response.ok) {
                return cache.put(OFFLINE_FALLBACK_PAGE, response);
              }
            })
            .catch((error) => {
              console.warn('Could not pre-cache offline page:', error);
            });
        })
    ])
    .then(() => {
      console.log('Service Worker: Installation complete');
      return self.skipWaiting(); // Activate immediately
    })
    .catch((error) => {
      console.error('Service Worker: Error during installation:', error);
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('Service Worker: Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim(); // Take control immediately
      })
  );
});

// Fetch event - handle requests with cache strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension requests
  if (url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different types of requests
  if (isStaticAsset(request)) {
    // Cache First for static assets
    event.respondWith(cacheFirst(request, STATIC_CACHE_NAME));
  } else if (isAPIRequest(request)) {
    // Network First for API requests
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  } else if (isPageRequest(request)) {
    // Network First for pages with better offline fallback
    event.respondWith(networkFirstForPages(request));
  } else {
    // Network First for everything else
    event.respondWith(networkFirst(request, DYNAMIC_CACHE_NAME));
  }
});

// Cache strategies
async function cacheFirst(request, cacheName) {
  try {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.error('Cache First failed:', error);
    return new Response('Offline content not available', { status: 503 });
  }
}

async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(cacheName);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', error);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirstForPages(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Network failed for page request, redirecting to offline page:', error);
    
    // For navigation requests when offline, redirect to the offline page
    if (request.mode === 'navigate') {
      // Return a redirect response to the offline page
      return Response.redirect('/offline', 302);
    }
    
    // For non-navigation requests, try to serve the cached offline page
    const offlineResponse = await caches.match(OFFLINE_FALLBACK_PAGE);
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Last resort fallback
    return new Response('Offline', { 
      status: 503, 
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  const fetchPromise = fetch(request).then((networkResponse) => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  });

  return cachedResponse || fetchPromise;
}

// Helper functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.includes('/_next/static/') ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/images/') ||
         url.pathname.endsWith('.css') ||
         url.pathname.endsWith('.js') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico');
}

function isAPIRequest(request) {
  const url = new URL(request.url);
  return url.pathname.startsWith('/api/') ||
         API_CACHE_PATTERNS.some(pattern => pattern.test(request.url));
}

function isPageRequest(request) {
  return request.mode === 'navigate' ||
         (request.method === 'GET' && request.headers.get('accept').includes('text/html'));
}

// Background sync for offline transactions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync triggered');
  
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

async function syncTransactions() {
  try {
    // Get pending transactions from IndexedDB or localStorage
    // This would integrate with your app's offline storage
    console.log('Service Worker: Syncing transactions...');
    
    // Implementation would depend on your data storage strategy
    // For now, just log that sync is available
    
    // Notify the main app that sync completed
    const clients = await self.clients.matchAll();
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_COMPLETE',
        data: { success: true }
      });
    });
  } catch (error) {
    console.error('Service Worker: Sync failed:', error);
  }
}

// Push notifications (for future enhancement)
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    data: data.data,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/icons/shortcut-dashboard.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});
