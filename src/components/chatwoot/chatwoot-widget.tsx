'use client'

import { useEffect } from 'react'

export function ChatwootWidget() {
  useEffect(() => {
    // Add Chatwoot SDK script
    const script = document.createElement('script')
    script.src = 'https://chatwoot.agistaffers.com/packs/js/sdk.js'
    script.async = true
    script.defer = true

    script.onload = () => {
      if (window.chatwootSDK) {
        window.chatwootSDK.run({
          websiteToken: 'g7Yq9eskZibSJzofXGTUnv4r',
          baseUrl: 'https://chatwoot.agistaffers.com'
        })
      }
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  return null
}

// TypeScript declaration for window.chatwootSDK
declare global {
  interface Window {
    chatwootSDK: any
  }
}
