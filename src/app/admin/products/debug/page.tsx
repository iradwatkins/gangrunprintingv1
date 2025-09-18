'use client'

import { useState, useEffect } from 'react'

export default function DebugPage() {
  const [status, setStatus] = useState<any>({ loading: true })

  useEffect(() => {
    const runTests = async () => {
      const results: any = {
        pageRendered: true,
        clientSide: typeof window !== 'undefined',
        timestamp: new Date().toISOString(),
        apis: {}
      }

      // Test each API endpoint
      const endpoints = [
        '/api/product-categories',
        '/api/paper-stocks',
        '/api/quantities',
        '/api/sizes',
        '/api/add-ons',
        '/api/auth/me'
      ]

      for (const endpoint of endpoints) {
        try {
          const start = Date.now()
          const response = await fetch(endpoint)
          const elapsed = Date.now() - start
          const data = await response.json()

          results.apis[endpoint] = {
            status: response.status,
            ok: response.ok,
            time: `${elapsed}ms`,
            dataLength: Array.isArray(data) ? data.length : typeof data,
            sample: Array.isArray(data) && data.length > 0 ? data[0] : data
          }
        } catch (error) {
          results.apis[endpoint] = {
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      }

      setStatus(results)
    }

    runTests()
  }, [])

  if (status.loading) {
    return <div className="p-8">Loading debug info...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 Admin Debug Page</h1>

      <div className="space-y-6">
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h2 className="text-xl font-semibold text-green-800 mb-2">✅ Page Status</h2>
          <ul className="space-y-1">
            <li>Page Rendered: {status.pageRendered ? '✅' : '❌'}</li>
            <li>Client Side: {status.clientSide ? '✅' : '❌'}</li>
            <li>Timestamp: {status.timestamp}</li>
          </ul>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded p-4">
          <h2 className="text-xl font-semibold text-blue-800 mb-2">🔌 API Endpoints</h2>
          <div className="space-y-3">
            {Object.entries(status.apis).map(([endpoint, data]: [string, any]) => (
              <div key={endpoint} className={`p-3 rounded ${data.ok ? 'bg-white' : 'bg-red-50'}`}>
                <div className="font-mono text-sm font-semibold">{endpoint}</div>
                <div className="text-sm mt-1">
                  Status: {data.status} {data.ok ? '✅' : '❌'} | Time: {data.time || 'N/A'}
                </div>
                {data.error && (
                  <div className="text-red-600 text-sm mt-1">Error: {data.error}</div>
                )}
                {data.dataLength !== undefined && (
                  <div className="text-gray-600 text-sm mt-1">
                    Data: {typeof data.dataLength === 'number' ? `${data.dataLength} items` : data.dataLength}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-50 border border-gray-200 rounded p-4">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">📋 Raw Data</h2>
          <pre className="text-xs overflow-auto bg-white p-3 rounded">
            {JSON.stringify(status, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}