// Offline Support and Caching Service Worker Extension
const CACHE_NAME = 'gangrun-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/offline.html',
  '/manifest.json',
  '/favicon-100x100.png',
  '/gangrunprinting_logo_new_1448921366__42384-100x100.png',
  '/gangrunprinting_logo_new_1448921366__42384-200x200.png'
];

// API endpoints to cache
const API_CACHE_ENDPOINTS = [
  '/api/products',
  '/api/categories',
  '/api/sizes',
  '/api/paper-stocks',
  '/api/coating-options'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching static assets');
      
      // Try to cache each asset individually to avoid complete failure
      const cachePromises = STATIC_ASSETS.map(async (url) => {
        try {
          const response = await fetch(url);
          if (response.ok) {
            await cache.put(url, response);
            console.log(`[Service Worker] Cached: ${url}`);
          } else {
            console.log(`[Service Worker] Skipping ${url} - status ${response.status}`);
          }
        } catch (error) {
          console.log(`[Service Worker] Failed to cache ${url}:`, error.message);
        }
      });
      
      await Promise.all(cachePromises);
      console.log('[Service Worker] Static assets cached');
    })
  );
  
  self.skipWaiting();
});

// Activate event - clean up old caches
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

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
    return;
  }
  
  // Handle static assets
  event.respondWith(handleStaticAssetRequest(request));
});

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      // Clone the response before caching
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Network request failed, trying cache:', request.url);
    
    // Fall back to cache
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      console.log('[Service Worker] Serving from cache:', request.url);
      return cachedResponse;
    }
    
    // Return error response
    return new Response(
      JSON.stringify({ 
        error: 'Offline',
        message: 'This content is not available offline'
      }),
      {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Handle navigation requests with offline fallback
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      return networkResponse;
    }
    
    throw new Error('Network response was not ok');
  } catch (error) {
    console.log('[Service Worker] Navigation failed, serving offline page');
    
    // Try to get the offline page from cache
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(OFFLINE_URL);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return a basic offline response
    return new Response(
      `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - GangRun Printing</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #f5f5f5;
            text-align: center;
          }
          h1 { color: #333; }
          p { color: #666; }
          button {
            margin-top: 20px;
            padding: 10px 20px;
            background: #3b82f6;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <h1>You're Offline</h1>
        <p>Please check your internet connection and try again.</p>
        <button onclick="location.reload()">Retry</button>
      </body>
      </html>
      `,
      {
        headers: { 'Content-Type': 'text/html' }
      }
    );
  }
}

// Handle static assets with cache-first strategy
async function handleStaticAssetRequest(request) {
  const cache = await caches.open(CACHE_NAME);
  
  // Check cache first
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetchAndCache(request, cache);
    return cachedResponse;
  }
  
  // Try network
  try {
    const networkResponse = await fetch(request);
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[Service Worker] Failed to fetch:', request.url);
    
    // Return 404 response
    return new Response('Not Found', {
      status: 404,
      statusText: 'Not Found'
    });
  }
}

// Fetch and cache in background
async function fetchAndCache(request, cache) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silently fail - we already served from cache
  }
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[Service Worker] Background sync:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncOfflineOrders());
  }
});

// Sync offline orders when back online
async function syncOfflineOrders() {
  try {
    // Get offline orders from IndexedDB
    const db = await openDB();
    const tx = db.transaction('offline_orders', 'readonly');
    const store = tx.objectStore('offline_orders');
    const orders = await store.getAll();
    
    // Send each order to the server
    for (const order of orders) {
      try {
        const response = await fetch('/api/orders/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          // Remove synced order from IndexedDB
          const deleteTx = db.transaction('offline_orders', 'readwrite');
          const deleteStore = deleteTx.objectStore('offline_orders');
          await deleteStore.delete(order.id);
        }
      } catch (error) {
        console.error('[Service Worker] Failed to sync order:', order.id);
      }
    }
  } catch (error) {
    console.error('[Service Worker] Failed to sync offline orders:', error);
  }
}

// Open IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('gangrun_offline', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('offline_orders')) {
        db.createObjectStore('offline_orders', { keyPath: 'id' });
      }
    };
  });
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  console.log('[Service Worker] Message received:', event.data);
  
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
  
  if (event.data.type === 'CACHE_URLS') {
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(event.data.urls);
      })
    );
  }
});