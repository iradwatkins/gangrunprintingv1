'use client'

export class ServiceWorkerManager {
  private static instance: ServiceWorkerManager
  private registration: ServiceWorkerRegistration | null = null

  private constructor() {}

  public static getInstance(): ServiceWorkerManager {
    if (!ServiceWorkerManager.instance) {
      ServiceWorkerManager.instance = new ServiceWorkerManager()
    }
    return ServiceWorkerManager.instance
  }

  async register(): Promise<ServiceWorkerRegistration | null> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service Workers not supported')
      return null
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered successfully:', this.registration)

      // Wait for service worker to be ready
      await navigator.serviceWorker.ready

      // Listen for messages from service worker
      this.setupMessageListener()

      return this.registration
    } catch (error) {
      console.error('Service Worker registration failed:', error)
      return null
    }
  }

  private setupMessageListener() {
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data)

      if (event.data.type === 'NOTIFICATION_CLICKED') {
        // Handle notification click from service worker
        const { url, orderId } = event.data
        if (orderId) {
          window.location.href = `/account/orders/${orderId}`
        } else {
          window.location.href = url || '/'
        }
      }
    })
  }

  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.register()
    }

    if (!this.registration) {
      return null
    }

    try {
      return await this.registration.pushManager.getSubscription()
    } catch (error) {
      console.error('Error getting push subscription:', error)
      return null
    }
  }

  async subscribe(publicKey: string): Promise<PushSubscription | null> {
    if (!this.registration) {
      await this.register()
    }

    if (!this.registration) {
      throw new Error('Service Worker not registered')
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(publicKey)
      })

      console.log('Push subscription created:', subscription)
      return subscription
    } catch (error) {
      console.error('Error creating push subscription:', error)
      throw error
    }
  }

  async unsubscribe(): Promise<boolean> {
    const subscription = await this.getSubscription()

    if (!subscription) {
      return true
    }

    try {
      const result = await subscription.unsubscribe()
      console.log('Push subscription removed:', result)
      return result
    } catch (error) {
      console.error('Error removing push subscription:', error)
      return false
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      throw new Error('Notifications not supported')
    }

    if (Notification.permission === 'granted') {
      return 'granted'
    }

    const permission = await Notification.requestPermission()
    return permission
  }

  showLocalNotification(title: string, options?: NotificationOptions) {
    if (Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/gangrunprinting_logo_new_1448921366__42384-200x200.png',
        badge: '/favicon-100x100.png',
        ...options
      })

      // Auto close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return notification
    }
  }

  // Store pending orders in IndexedDB for offline sync
  async storePendingOrder(order: any): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('GangRunPrinting', 1)

      request.onerror = () => reject(request.error)
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains('pendingOrders')) {
          db.createObjectStore('pendingOrders', { keyPath: 'id' })
        }
      }

      request.onsuccess = () => {
        const db = request.result
        const transaction = db.transaction(['pendingOrders'], 'readwrite')
        const store = transaction.objectStore('pendingOrders')
        const addRequest = store.add(order)

        addRequest.onsuccess = () => resolve()
        addRequest.onerror = () => reject(addRequest.error)
      }
    })
  }

  async getPendingOrders(): Promise<any[]> {
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

  // Check if app is installed as PWA
  isStandalone(): boolean {
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true
  }

  // Prompt user to install PWA
  async promptInstall(): Promise<void> {
    const event = (window as any).deferredPrompt

    if (event) {
      event.prompt()
      const { outcome } = await event.userChoice
      console.log('PWA install prompt outcome:', outcome)

      if (outcome === 'accepted') {
        (window as any).deferredPrompt = null
      }
    }
  }
}