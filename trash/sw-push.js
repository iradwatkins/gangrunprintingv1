// Push Notification Service Worker Extension
self.addEventListener('push', function(event) {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  const data = event.data.json();
  
  // Default notification options
  const options = {
    body: data.body || 'You have a new update from GangRun Printing',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'gangrun-notification',
    requireInteraction: data.requireInteraction || false,
    renotify: data.renotify || false,
    silent: data.silent || false,
    timestamp: Date.now(),
    data: {
      url: data.url || '/',
      orderId: data.orderId,
      type: data.type || 'general'
    },
    actions: data.actions || []
  };

  // Add image if provided
  if (data.image) {
    options.image = data.image;
  }

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'GangRun Printing',
      options
    )
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  
  // Handle action button clicks
  if (event.action === 'view-order' && event.notification.data?.orderId) {
    event.waitUntil(
      clients.openWindow(`/track?orderId=${event.notification.data.orderId}`)
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the URL
    event.waitUntil(
      clients.matchAll({ type: 'window', includeUncontrolled: true })
        .then(function(clientList) {
          // Check if there's already a window/tab open
          for (let client of clientList) {
            if (client.url === url && 'focus' in client) {
              return client.focus();
            }
          }
          // If not, open a new window
          if (clients.openWindow) {
            return clients.openWindow(url);
          }
        })
    );
  }
});

// Background sync for offline notification queue
self.addEventListener('sync', function(event) {
  if (event.tag === 'sync-notifications') {
    event.waitUntil(syncOfflineNotifications());
  }
});

async function syncOfflineNotifications() {
  try {
    // Get any queued notifications from IndexedDB
    const cache = await caches.open('notification-queue');
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const data = await response.json();
        // Try to send the notification
        await self.registration.showNotification(data.title, data.options);
        // Remove from queue if successful
        await cache.delete(request);
      }
    }
  } catch (error) {
    console.error('Error syncing notifications:', error);
  }
}