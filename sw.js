// Service Worker optimitzat per GitHub Pages
const CACHE_VERSION = 'v2';
const CACHE_NAME = `student-benefits-${CACHE_VERSION}`;

// Files to cache immediately
const STATIC_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/benefits.json',
  '/manifest.json',
  '/assets/favicon.ico'
];

// Cache durations (in seconds)
const CACHE_DURATION = {
  images: 31536000,    // 1 year for images
  assets: 2592000,     // 30 days for CSS/JS
  json: 86400,         // 1 day for JSON
  html: 3600           // 1 hour for HTML
};

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('[SW] Installing Service Worker...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static files');
      return cache.addAll(STATIC_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating Service Worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('student-benefits-') && name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Helper function to determine cache duration
function getCacheDuration(url) {
  if (url.includes('/assets/benefits/')) return CACHE_DURATION.images;
  if (url.endsWith('.css') || url.endsWith('.js')) return CACHE_DURATION.assets;
  if (url.endsWith('.json')) return CACHE_DURATION.json;
  if (url.endsWith('.html') || url.endsWith('/')) return CACHE_DURATION.html;
  return CACHE_DURATION.assets;
}

// Helper function to check if cached response is still fresh
function isCacheFresh(cachedResponse, url) {
  if (!cachedResponse) return false;
  
  const cachedDate = new Date(cachedResponse.headers.get('date'));
  const now = new Date();
  const age = (now - cachedDate) / 1000; // age in seconds
  const maxAge = getCacheDuration(url);
  
  return age < maxAge;
}

// Fetch event - stale-while-revalidate strategy with time-based expiration
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(request);
      
      // For images, use cache-first strategy with long expiration
      if (request.url.includes('/assets/')) {
        if (cachedResponse && isCacheFresh(cachedResponse, request.url)) {
          console.log('[SW] Serving from cache:', request.url);
          return cachedResponse;
        }
        
        // Fetch and cache
        try {
          const networkResponse = await fetch(request);
          if (networkResponse && networkResponse.status === 200) {
            console.log('[SW] Caching image:', request.url);
            cache.put(request, networkResponse.clone());
          }
          return networkResponse;
        } catch (error) {
          console.log('[SW] Network failed, using stale cache:', request.url);
          return cachedResponse || new Response('Network error', { status: 408 });
        }
      }
      
      // For other files, use stale-while-revalidate
      const fetchPromise = fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          console.log('[SW] Updating cache:', request.url);
          cache.put(request, networkResponse.clone());
        }
        return networkResponse;
      }).catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});

// Message event - manual cache clear
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => caches.delete(name))
        );
      })
    );
  }
});
