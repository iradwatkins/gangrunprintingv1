// Custom Service Worker for GangRun Printing
// Properly handles authentication routes without caching

const CACHE_NAME = 'gangrun-v2';
const OFFLINE_URL = '/offline.html';

// Never cache these patterns
const excludePatterns = [
  /\/api\/auth\//,
  /\/auth\//,
  /\/oauth\//,
  /accounts\.google\.com/,
  /\/callback/,
  /_next\/static\/chunks\/pages\/api/,
  /\/signin/,
  /\/signout/,
  /\/error/
];

// Assets that are safe to cache
const cacheableAssets = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon-100x100.png'
];

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      // Only cache static assets, no auth routes
      return cache.addAll(cacheableAssets).catch((error) => {
        console.error('[Service Worker] Cache failed:', error);
        // Don't fail installation on cache errors
        return Promise.resolve();
      });
    })
  );
  
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          })
      );
    })
  );
  
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Skip caching for auth-related requests
  if (excludePatterns.some(pattern => pattern.test(url.pathname))) {
    // console.log('[Service Worker] Skipping auth route:', url.pathname);
    return event.respondWith(fetch(event.request));
  }
  
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return event.respondWith(fetch(event.request));
  }
  
  // For navigation requests, try network first then offline page
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
    return;
  }
  
  // For other requests, network first with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        
        // Clone the response
        const responseToCache = response.clone();
        
        caches.open(CACHE_NAME).then((cache) => {
          // Only cache if it's not an auth route
          if (!excludePatterns.some(pattern => pattern.test(url.pathname))) {
            cache.put(event.request, responseToCache);
          }
        });
        
        return response;
      })
      .catch(() => {
        // Try to return cached version
        return caches.match(event.request);
      })
  );
});

// Import push and offline functionality
try {
  importScripts('/sw-push.js', '/sw-offline.js');
} catch (error) {
  console.log('[Service Worker] Could not import scripts:', error);
}