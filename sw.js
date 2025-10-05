// Service Worker for caching on GitHub Pages
const CACHE_VERSION = 'v1';
const CACHE_NAME = `student-benefits-${CACHE_VERSION}`;

// Files to cache immediately
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/benefits.json',
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('student-benefits-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version and update cache in background
        const fetchPromise = fetch(request).then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return networkResponse;
        });
        
        return cachedResponse;
      }

      // Not in cache, fetch from network
      return fetch(request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        // Add to cache
        caches.open(CACHE_NAME).then((cache) => {
          // Cache images for 1 year, other files for shorter periods
          if (request.url.includes('/assets/')) {
            cache.put(request, responseToCache);
          } else if (request.url.endsWith('.css') || request.url.endsWith('.js')) {
            cache.put(request, responseToCache);
          } else if (request.url.endsWith('.json')) {
            cache.put(request, responseToCache);
          }
        });

        return response;
      });
    })
  );
});
