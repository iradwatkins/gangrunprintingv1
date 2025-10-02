'use client'

import { useEffect, useState } from 'react'

export default function ProductConfigurationFormDebug({ productId }: { productId: string }) {
  const [configData, setConfigData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchConfig() {
      try {
        const response = await fetch(`/api/products/${productId}/configuration`)
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`)
        }
        const data = await response.json()
        setConfigData(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load')
      } finally {
        setLoading(false)
      }
    }

    fetchConfig()
  }, [productId])

  if (loading) {
    return <div>Loading debug info...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  const isQuantityOnlyProduct = configData &&
    configData.quantities?.length > 0 &&
    configData.sizes?.length === 1 &&
    configData.sizes[0]?.id === 'default_size' &&
    configData.paperStocks?.length === 1 &&
    configData.paperStocks[0]?.id === 'default_paper'

  return (
    <div className="p-4 bg-gray-100 rounded">
      <h3 className="font-bold mb-2">Debug Info:</h3>
      <div className="text-sm space-y-1">
        <div>Product ID: {productId}</div>
        <div>Config Data Loaded: {configData ? '✅' : '❌'}</div>
        <div>Quantities Count: {configData?.quantities?.length || 0}</div>
        <div>Sizes Count: {configData?.sizes?.length || 0}</div>
        <div>First Size ID: {configData?.sizes?.[0]?.id || 'none'}</div>
        <div>Paper Stocks Count: {configData?.paperStocks?.length || 0}</div>
        <div>First Paper ID: {configData?.paperStocks?.[0]?.id || 'none'}</div>
        <div className="font-bold mt-2">
          Is Quantity-Only Product: {isQuantityOnlyProduct ? '✅ YES' : '❌ NO'}
        </div>
        <div className="mt-2">
          {isQuantityOnlyProduct ? (
            <div className="text-green-600 font-semibold">
              ✅ Should show simplified quantity selector!
            </div>
          ) : (
            <div className="text-red-600">
              ❌ Will show full configuration form
            </div>
          )}
        </div>
      </div>
    </div>
  )
}