'use client'

import { useEffect } from 'react'

// Chatwoot configuration
const CHATWOOT_BASE_URL = 'https://chatwoot.agistaffers.com'
const CHATWOOT_WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || 'YOUR_WEBSITE_TOKEN_HERE'

interface ChatwootSettings {
  hideMessageBubble?: boolean
  position?: 'left' | 'right'
  locale?: string
  type?: 'standard' | 'expanded_bubble'
  darkMode?: 'auto' | 'light' | 'dark'
  baseDomain?: string
}

interface ChatwootWidget {
  baseDomain: string
  websiteToken: string
  settings?: ChatwootSettings
}

declare global {
  interface Window {
    chatwootSettings?: ChatwootSettings
    chatwootSDK?: {
      run: (config: ChatwootWidget) => void
    }
    $chatwoot?: {
      toggle: () => void
      show: () => void
      hide: () => void
      reset: () => void
      setUser: (userId: string, userData?: any) => void
      setCustomAttributes: (attributes: any) => void
      deleteCustomAttribute: (key: string) => void
      setLabel: (label: string) => void
      removeLabel: (label: string) => void
      setLocale: (locale: string) => void
    }
  }
}

export function ChatwootWidget() {
  useEffect(() => {
    // Add Chatwoot Settings
    window.chatwootSettings = {
      hideMessageBubble: false,
      position: 'right',
      locale: 'en',
      type: 'standard',
      darkMode: 'auto'
    }

    // Create and inject Chatwoot script
    const script = document.createElement('script')
    script.innerHTML = `
      (function(d,t) {
        var BASE_URL="${CHATWOOT_BASE_URL}";
        var g=d.createElement(t),s=d.getElementsByTagName(t)[0];
        g.src=BASE_URL+"/packs/js/sdk.js";
        g.defer = true;
        g.async = true;
        s.parentNode.insertBefore(g,s);
        g.onload=function(){
          window.chatwootSDK.run({
            websiteToken: '${CHATWOOT_WEBSITE_TOKEN}',
            baseDomain: BASE_URL
          })
        }
      })(document,"script");
    `
    document.body.appendChild(script)

    // Set custom attributes for GangRun Printing
    const timer = setTimeout(() => {
      if (window.$chatwoot) {
        window.$chatwoot.setCustomAttributes({
          website: 'gangrunprinting.com',
          service: 'printing',
          source: 'web'
        })
        
        // Set label for routing
        window.$chatwoot.setLabel('gangrun-printing')
      }
    }, 2000)

    // Cleanup function
    return () => {
      clearTimeout(timer)
      // Remove the script when component unmounts
      const scripts = document.querySelectorAll('script[src*="chatwoot"]')
      scripts.forEach(script => script.remove())
      
      // Remove Chatwoot container elements
      const chatwootElements = document.querySelectorAll('[id*="chatwoot"]')
      chatwootElements.forEach(element => element.remove())
    }
  }, [])

  return null // This component doesn't render anything visible
}

// Helper functions to control Chatwoot programmatically
export const chatwootAPI = {
  show: () => window.$chatwoot?.show(),
  hide: () => window.$chatwoot?.hide(),
  toggle: () => window.$chatwoot?.toggle(),
  reset: () => window.$chatwoot?.reset(),
  
  setUser: (userId: string, userData?: { 
    email?: string
    name?: string 
    phone?: string
    custom_attributes?: any
  }) => {
    if (window.$chatwoot) {
      window.$chatwoot.setUser(userId, userData)
    }
  },
  
  setCustomAttributes: (attributes: any) => {
    if (window.$chatwoot) {
      window.$chatwoot.setCustomAttributes(attributes)
    }
  },
  
  trackEvent: (eventName: string, attributes?: any) => {
    if (window.$chatwoot) {
      window.$chatwoot.setCustomAttributes({
        last_event: eventName,
        event_timestamp: new Date().toISOString(),
        ...attributes
      })
    }
  }
}