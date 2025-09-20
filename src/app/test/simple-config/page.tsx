'use client'

import { useState } from 'react'
import SimpleConfigurationForm from '@/components/product/SimpleConfigurationForm'

export default function SimpleConfigTestPage() {
  const [config, setConfig] = useState<any>(null)
  const [price, setPrice] = useState(0)

  const handleConfigurationChange = (newConfig: any, newPrice: number) => {
    console.log('Configuration changed:', newConfig, 'Price:', newPrice)
    setConfig(newConfig)
    setPrice(newPrice)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Simple Product Configuration Test</h1>

      <div className="max-w-2xl mx-auto">
        {/* Original Configuration Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Product Configuration</h2>

          <SimpleConfigurationForm
            productId="cmfqxnjz80001ul2lpacblzuf"
            onConfigurationChange={handleConfigurationChange}
          />

          {config && (
            <div className="mt-6 p-4 bg-gray-50 rounded">
              <h3 className="font-medium mb-2">Current Configuration:</h3>
              <pre className="text-xs">{JSON.stringify(config, null, 2)}</pre>
              <p className="mt-2 font-medium">Price: ${price.toFixed(2)}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
