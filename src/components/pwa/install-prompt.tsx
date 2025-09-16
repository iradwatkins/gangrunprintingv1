'use client'

import { useState, useEffect } from 'react'
import { X, Download, Smartphone, Bell, Wifi } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const ua = window.navigator.userAgent
    const isIOSDevice = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Check if previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedTime = dismissed ? parseInt(dismissed) : 0
    const daysSinceDismissed = (Date.now() - dismissedTime) / (1000 * 60 * 60 * 24)
    
    // Show prompt again after 7 days
    if (dismissed && daysSinceDismissed < 7) {
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      
      // Show prompt after a delay
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000) // Show after 30 seconds
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // For iOS, show custom instructions after delay
    if (isIOSDevice && !dismissed) {
      setTimeout(() => {
        setShowPrompt(true)
      }, 30000)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) {
      // For iOS, show instructions
      if (isIOS) {
        alert('To install this app on iOS:\n1. Tap the Share button\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"')
      }
      return
    }

    // Show the install prompt
    deferredPrompt.prompt()

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setIsInstalled(true)
    } else {
      console.log('User dismissed the install prompt')
    }

    // Clear the deferredPrompt
    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  if (!showPrompt || isInstalled) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="shadow-lg border-primary/20">
        <CardContent className="p-4">
          <button
            aria-label="Dismiss"
            className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
            onClick={handleDismiss}
          >
            <X className="h-4 w-4" />
          </button>
          
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-primary" />
              </div>
            </div>
            
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-sm">Install GangRun Printing App</h3>
              <p className="text-xs text-muted-foreground">
                Get instant access, work offline, and receive order updates
              </p>
              
              <div className="flex gap-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  <span>Quick access</span>
                </div>
                <div className="flex items-center gap-1">
                  <Bell className="h-3 w-3" />
                  <span>Notifications</span>
                </div>
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  <span>Offline mode</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Button
                  className="flex-1"
                  size="sm"
                  onClick={handleInstall}
                >
                  Install App
                </Button>
                <Button
                  className="flex-1"
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                >
                  Not Now
                </Button>
              </div>
              
              {isIOS && (
                <p className="text-xs text-muted-foreground pt-1">
                  Tap <span className="font-semibold">Share</span> then <span className="font-semibold">Add to Home Screen</span>
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}