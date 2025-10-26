// Service Worker for Push Notifications
// UPDATED: 2025-10-26 - Cache version bumped to force refresh
const CACHE_NAME = 'gangrun-printing-v2-20251026'
const urlsToCache = [
  '/',
  '/offline.html'
]

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache)
      })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  // CRITICAL FIX: Never cache Next.js build files (they change with each build)
  // This prevents old CSS/JS from being served after deployments
  const url = new URL(event.request.url)
  if (url.pathname.startsWith('/_next/static') ||
      url.pathname.startsWith('/_next/image') ||
      url.pathname.includes('.css') ||
      url.pathname.includes('.js') ||
      url.pathname.includes('.json')) {
    // Always fetch fresh for Next.js build assets
    event.respondWith(fetch(event.request))
    return
  }

  // For other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request)
      }).catch(() => {
        // If both fail, return offline page for navigate requests
        if (event.request.mode === 'navigate') {
          return caches.match('/offline.html')
        }
      })
  )
})

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
  console.log('Push event received:', event)

  let data = {}
  try {
    data = event.data ? event.data.json() : {}
  } catch (e) {
    data = { title: 'GangRun Printing', body: event.data ? event.data.text() : 'New notification' }
  }

  const title = data.title || 'GangRun Printing'
  const options = {
    body: data.body || 'You have a new order update',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: data.image,
    data: {
      url: data.url || '/',
      orderId: data.orderId,
      timestamp: Date.now()
    },
    actions: [
      {
        action: 'view',
        title: 'View Order',
        icon: '/icon-view.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icon-dismiss.png'
      }
    ],
    requireInteraction: data.requireInteraction || false,
    silent: data.silent || false,
    vibrate: [100, 50, 100],
    tag: data.tag || 'order-update'
  }

  event.waitUntil(
    self.registration.showNotification(title, options)
  )
})

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event)

  event.notification.close()

  if (event.action === 'dismiss') {
    return
  }

  const url = event.notification.data?.url || '/'
  const orderId = event.notification.data?.orderId

  // Focus or open the app window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(url) && 'focus' in client) {
            return client.focus()
          }
        }

        // Open new window/tab
        const targetUrl = orderId ? `/account/orders/${orderId}` : url
        if (clients.openWindow) {
          return clients.openWindow(targetUrl)
        }
      })
  )
})

// Background sync for offline order submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'order-sync') {
    event.waitUntil(syncOrders())
  }
})

async function syncOrders() {
  try {
    // Get pending orders from IndexedDB
    const pendingOrders = await getPendingOrders()

    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        })

        if (response.ok) {
          await removePendingOrder(order.id)
          // Show success notification
          self.registration.showNotification('Order Submitted', {
            body: 'Your order was successfully submitted!',
            icon: '/icon-192x192.png',
            tag: 'order-success'
          })
        }
      } catch (error) {
        console.error('Failed to sync order:', error)
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error)
  }
}

// Helper functions for IndexedDB operations
function getPendingOrders() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GangRunPrinting', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingOrders'], 'readonly')
      const store = transaction.objectStore('pendingOrders')
      const getRequest = store.getAll()

      getRequest.onsuccess = () => resolve(getRequest.result)
      getRequest.onerror = () => reject(getRequest.error)
    }
  })
}

function removePendingOrder(orderId) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('GangRunPrinting', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => {
      const db = request.result
      const transaction = db.transaction(['pendingOrders'], 'readwrite')
      const store = transaction.objectStore('pendingOrders')
      const deleteRequest = store.delete(orderId)

      deleteRequest.onsuccess = () => resolve()
      deleteRequest.onerror = () => reject(deleteRequest.error)
    }
  })
}