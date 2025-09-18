'use client'

import { useState, useEffect } from 'react'

export default function ProductDebugPage({ params }: { params: { slug: string } }) {
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      console.log(`[DEBUG] Starting fetch for slug: ${params.slug}`)

      try {
        const url = `/api/products/by-slug/${params.slug}`
        console.log(`[DEBUG] Fetching from: ${url}`)

        const response = await fetch(url)
        console.log(`[DEBUG] Response status: ${response.status}`)
        console.log(`[DEBUG] Response headers:`, response.headers)

        const text = await response.text()
        console.log(`[DEBUG] Response text (first 200 chars):`, text.substring(0, 200))
        console.log(`[DEBUG] Response text length:`, text.length)

        // Try to parse as JSON
        try {
          const jsonData = JSON.parse(text)
          console.log(`[DEBUG] Successfully parsed JSON:`, jsonData)
          setData(jsonData)
        } catch (parseError) {
          console.error(`[DEBUG] JSON parse error:`, parseError)
          setError(`JSON parse failed: ${parseError}`)
          setData({ raw: text })
        }
      } catch (err) {
        console.error(`[DEBUG] Fetch error:`, err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.slug])

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Product Debug Page</h1>
      <h2>Slug: {params.slug}</h2>

      <div style={{ marginTop: '20px' }}>
        <h3>Status:</h3>
        <ul>
          <li>Loading: {loading ? 'Yes' : 'No'}</li>
          <li>Error: {error || 'None'}</li>
          <li>Data exists: {data ? 'Yes' : 'No'}</li>
        </ul>
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#ffeeee', border: '1px solid #ff0000' }}>
          <h3>Error Details:</h3>
          <pre>{error}</pre>
        </div>
      )}

      {data && (
        <div style={{ marginTop: '20px' }}>
          <h3>Data:</h3>
          <pre style={{
            backgroundColor: '#f0f0f0',
            padding: '10px',
            overflow: 'auto',
            maxHeight: '600px'
          }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}

      <div style={{ marginTop: '20px' }}>
        <p>Check browser console for detailed debug logs.</p>
      </div>
    </div>
  )
}