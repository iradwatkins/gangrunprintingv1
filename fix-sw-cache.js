// Script to fix service worker cache issues
// This generates a clean sw.js without problematic precache entries

const fs = require('fs');
const path = require('path');

// Read current sw.js
const swPath = path.join(__dirname, 'public', 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');

// Create a simplified service worker that doesn't try to cache everything
const simplifiedSW = `
// Simplified Service Worker for GangRun Printing
// Fixes cache.addAll errors by only caching essential files

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(clients.claim());
});

// Import push and offline functionality
try {
  importScripts('/sw-push.js', '/sw-offline.js');
} catch (error) {
  console.log('[Service Worker] Could not import scripts:', error);
}

// Basic fetch handler - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .catch(() => caches.match(event.request))
  );
});
`;

// Backup current sw.js
fs.writeFileSync(swPath + '.backup', swContent);

// Write simplified version
fs.writeFileSync(swPath, simplifiedSW);

console.log('✅ Service worker simplified to fix cache errors');
console.log('📁 Original backed up to public/sw.js.backup');