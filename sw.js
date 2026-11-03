// Service Worker for Flight Miles vs Cash Advisor
// Version: 1.1.0
const CACHE_NAME = 'miles-advisor-v1.1.0';

const PRECACHE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './css/styles.css',
  './js/loyaltyPrograms.js',
  './js/routesData.js',
  './js/indonesianCards.js',
  './js/valuationLogic.js',
  './js/storage.js',
  './js/translations.js',
  './js/qrcode.min.js',
  './js/syncService.js',
  './js/app.js',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/apple-touch-icon.png',
  './icons/icon.svg'
];

// Install Event: Precaches core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Cache first, fallback to network
self.addEventListener('fetch', (event) => {
  // Only handle GET requests and http/https schemes
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached asset immediately
        return cachedResponse;
      }

      // If not in cache, fetch from network and dynamically cache same-origin assets
      return fetch(event.request).then((networkResponse) => {
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback for navigation requests when offline
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
