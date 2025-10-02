'use client'

import { useEffect, useState } from 'react'

export default function TestQuantityOnly() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const productId = 'cmg56rdeg0001n072z3r9txs9'

  useEffect(() => {
    fetch(`/api/products/${productId}/configuration`)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  const isQuantityOnly = data &&
    data.quantities?.length > 0 &&
    data.sizes?.length === 1 &&
    data.sizes[0]?.id === 'default_size' &&
    data.paperStocks?.length === 1 &&
    data.paperStocks[0]?.id === 'default_paper'

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Quantity-Only Product Test</h1>

      <div className="bg-gray-100 p-4 rounded mb-4">
        <h2 className="font-semibold mb-2">Configuration Data:</h2>
        <ul className="text-sm space-y-1">
          <li>✅ Data loaded: {data ? 'Yes' : 'No'}</li>
          <li>Quantities: {data?.quantities?.length || 0}</li>
          <li>Sizes: {data?.sizes?.length || 0} (First: {data?.sizes?.[0]?.id})</li>
          <li>Paper Stocks: {data?.paperStocks?.length || 0} (First: {data?.paperStocks?.[0]?.id})</li>
          <li className="font-bold text-lg mt-2">
            Is Quantity-Only: {isQuantityOnly ? '✅ YES' : '❌ NO'}
          </li>
        </ul>
      </div>

      {isQuantityOnly ? (
        <div className="bg-green-100 p-4 rounded">
          <h2 className="font-semibold mb-4">✅ Quantity-Only Product UI</h2>
          <label className="block mb-2 font-medium">SELECT QUANTITY:</label>
          <select className="w-full p-2 border rounded">
            {data.quantities.map((q: any) => (
              <option key={q.id} value={q.id}>{q.label}</option>
            ))}
          </select>
        </div>
      ) : (
        <div className="bg-red-100 p-4 rounded">
          <h2 className="font-semibold">❌ Full Configuration UI Would Show</h2>
          <p>This would show the complete configuration form with all modules.</p>
        </div>
      )}

      <div className="mt-4 p-4 bg-blue-100 rounded">
        <h3 className="font-semibold mb-2">Raw Configuration Data:</h3>
        <pre className="text-xs overflow-x-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  )
}