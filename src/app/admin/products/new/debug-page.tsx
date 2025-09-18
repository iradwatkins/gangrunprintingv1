'use client'

import { useState, useEffect } from 'react'

export default function DebugNewProductPage() {
  const [status, setStatus] = useState<any>({})

  useEffect(() => {
    const checkAPIs = async () => {
      const endpoints = [
        '/api/product-categories',
        '/api/paper-stocks',
        '/api/quantities',
        '/api/sizes',
        '/api/add-ons'
      ]

      const results: any = {}

      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint)
          const data = await response.json()
          results[endpoint] = {
            status: response.status,
            ok: response.ok,
            dataLength: Array.isArray(data) ? data.length : 'not array',
            error: data.error || null
          }
        } catch (error) {
          results[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      setStatus(results)
    }

    checkAPIs()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Admin Products Page</h1>

      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Page Rendered: ✅</h2>
          <p>If you can see this, the page component is rendering.</p>
        </div>

        <div>
          <h2 className="text-lg font-semibold">API Status:</h2>
          <pre className="bg-gray-100 p-4 rounded">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>

        <div>
          <h2 className="text-lg font-semibold">Component Info:</h2>
          <ul>
            <li>Mounted: ✅</li>
            <li>Client Side: {typeof window !== 'undefined' ? '✅' : '❌'}</li>
            <li>Time: {new Date().toISOString()}</li>
          </ul>
        </div>
      </div>
    </div>
  )
}