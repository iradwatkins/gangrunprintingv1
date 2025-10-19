'use client'

import { useEffect, useState } from 'react'

interface DebugChecks {
  squareLoaded: boolean
  appId: string | undefined
  locationId: string | undefined
  cardContainer: boolean
  cashAppContainer: boolean
  applePayContainer: boolean
  scriptInDOM: boolean
  windowSquareType: string
}

export default function SquareDebugger() {
  const [status, setStatus] = useState('Checking...')
  const [checks, setChecks] = useState<DebugChecks | null>(null)
  const [showDetails, setShowDetails] = useState(true)

  useEffect(() => {
    // Wait a bit for everything to load
    const timer = setTimeout(() => {
      const debugChecks: DebugChecks = {
        squareLoaded: typeof window.Square !== 'undefined',
        appId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
        locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
        cardContainer: !!document.getElementById('card-container'),
        cashAppContainer: !!document.getElementById('cash-app-container'),
        applePayContainer: !!document.getElementById('apple-pay-container'),
        scriptInDOM: !!document.querySelector('script[src*="square.js"]'),
        windowSquareType: typeof window.Square,
      }

      setChecks(debugChecks)
      console.table(debugChecks)
      console.log('[Square Debug] Full check results:', debugChecks)

      // Determine status
      if (!debugChecks.scriptInDOM) {
        setStatus('❌ Square script NOT in DOM')
      } else if (!debugChecks.squareLoaded) {
        setStatus('❌ Square.js NOT loaded - check Network tab for errors')
      } else if (!debugChecks.appId) {
        setStatus('❌ Missing NEXT_PUBLIC_SQUARE_APPLICATION_ID env var')
      } else if (!debugChecks.locationId) {
        setStatus('❌ Missing NEXT_PUBLIC_SQUARE_LOCATION_ID env var')
      } else if (!debugChecks.cardContainer) {
        setStatus('⚠️ Card container DIV not found (may load later)')
      } else {
        setStatus('✅ All checks passed! Square should be working')
      }
    }, 2000) // Wait 2 seconds for everything to load

    return () => clearTimeout(timer)
  }, [])

  if (process.env.NODE_ENV === 'production' && !window.location.search.includes('debug=true')) {
    return null // Only show in dev or with ?debug=true in URL
  }

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded-lg z-[9999] shadow-2xl max-w-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="font-bold text-lg">🔍 Square Debug</div>
        <button
          className="text-xs bg-gray-700 px-2 py-1 rounded hover:bg-gray-600"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? 'Hide' : 'Show'}
        </button>
      </div>

      <div className="text-sm font-mono mb-3 pb-3 border-b border-gray-700">
        {status}
      </div>

      {showDetails && checks && (
        <div className="space-y-2 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div className="text-gray-400">Script in DOM:</div>
            <div>{checks.scriptInDOM ? '✅ Yes' : '❌ No'}</div>

            <div className="text-gray-400">Square Loaded:</div>
            <div>{checks.squareLoaded ? '✅ Yes' : '❌ No'}</div>

            <div className="text-gray-400">App ID Set:</div>
            <div>{checks.appId ? '✅ Yes' : '❌ Missing'}</div>

            <div className="text-gray-400">Location ID Set:</div>
            <div>{checks.locationId ? '✅ Yes' : '❌ Missing'}</div>

            <div className="text-gray-400">Card Container:</div>
            <div>{checks.cardContainer ? '✅ Found' : '⚠️ Missing'}</div>

            <div className="text-gray-400">Cash App Container:</div>
            <div>{checks.cashAppContainer ? '✅ Found' : '⚠️ Missing'}</div>

            <div className="text-gray-400">Apple Pay Container:</div>
            <div>{checks.applePayContainer ? '✅ Found' : '⚠️ Missing'}</div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <div className="text-gray-400 mb-1">Environment Variables:</div>
            <div className="bg-gray-800 p-2 rounded text-[10px] break-all">
              <div>App ID: {checks.appId?.substring(0, 20)}...</div>
              <div>Location: {checks.locationId}</div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-gray-700">
            <button
              className="w-full bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded text-xs"
              onClick={() => {
                console.log('[Square Debug] Manual check triggered')
                console.log('window.Square:', window.Square)
                console.log('Card container:', document.getElementById('card-container'))
                console.log('Env vars:', {
                  appId: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
                  locationId: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
                })
                alert('Check browser console for detailed logs')
              }}
            >
              📋 Log Details to Console
            </button>
          </div>
        </div>
      )}

      <div className="mt-2 text-[10px] text-gray-500">
        Add ?debug=true to URL in production
      </div>
    </div>
  )
}
