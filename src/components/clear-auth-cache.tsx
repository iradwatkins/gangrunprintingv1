'use client'

import { useEffect } from 'react'

export default function ClearAuthCache() {
  useEffect(() => {
    // Only run in browser
    if (typeof window === 'undefined') return
    
    // Check if there's an auth error in the URL
    const hasAuthError = window.location.pathname.includes('/auth/error') || 
                        window.location.search.includes('error=')
    
    if (hasAuthError && 'serviceWorker' in navigator) {
      console.log('[Auth] Clearing service worker cache due to auth error')
      
      // Clear all caches if auth error occurs
      caches.keys().then((names) => {
        names.forEach(name => {
          // Only clear auth-related caches
          if (name.includes('auth') || name.includes('gangrun')) {
            caches.delete(name)
            console.log(`[Auth] Cleared cache: ${name}`)
          }
        })
      })
      
      // Also clear problematic URLs from cache
      if ('caches' in window) {
        const authUrls = [
          '/api/auth/signin',
          '/api/auth/callback',
          '/auth/signin',
          '/auth/error'
        ]
        
        caches.keys().then(cacheNames => {
          cacheNames.forEach(cacheName => {
            caches.open(cacheName).then(cache => {
              authUrls.forEach(url => {
                cache.delete(url).then(success => {
                  if (success) {
                    console.log(`[Auth] Removed ${url} from cache ${cacheName}`)
                  }
                })
              })
            })
          })
        })
      }
    }
  }, [])
  
  return null
}