// Service Worker for JomFood PWA
const CACHE_NAME = 'jomfood-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// Check if we're in development mode (localhost or 127.0.0.1)
const isDevelopment = self.location.hostname === 'localhost' || 
                      self.location.hostname === '127.0.0.1' ||
                      self.location.hostname.includes('localhost');

// Install event - cache resources
self.addEventListener('install', (event) => {
  // Skip waiting in development to get updates faster
  if (isDevelopment) {
    self.skipWaiting();
  }
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// Fetch event - Network first in development, cache first in production
self.addEventListener('fetch', (event) => {
  // Skip caching for Vite HMR and dev server requests
  if (isDevelopment && (
    event.request.url.includes('/@vite/') ||
    event.request.url.includes('/node_modules/') ||
    event.request.url.includes('?t=') // Vite timestamped imports
  )) {
    event.respondWith(fetch(event.request));
    return;
  }

  if (isDevelopment) {
    // Network-first strategy for development
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Don't cache in development, always fetch fresh
          return response;
        })
        .catch(() => {
          // Fallback to cache only if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // Cache-first strategy for production
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          // Cache hit - return response
          if (response) {
            return response;
          }
          return fetch(event.request).then(
            (response) => {
              // Check if we received a valid response
              if (!response || response.status !== 200 || response.type !== 'basic') {
                return response;
              }
              // Clone the response
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(event.request, responseToCache);
                });
              return response;
            }
          );
        })
    );
  }
});

// Activate event - remove old caches
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Take control of all pages immediately in development
      if (isDevelopment) {
        return self.clients.claim();
      }
    })
  );
});

