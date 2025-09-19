'use client'

import { useState } from 'react'
import SimpleConfigurationForm from '@/components/product/SimpleConfigurationForm'
import { QuantitySelector } from '@/components/ui/quantity-selector'

export default function SimpleConfigTestPage() {
  const [config, setConfig] = useState<any>(null)
  const [price, setPrice] = useState(0)
  const [quantity, setQuantity] = useState<number | null>(null)

  const handleConfigurationChange = (newConfig: any, newPrice: number) => {
    console.log('Configuration changed:', newConfig, 'Price:', newPrice)
    setConfig(newConfig)
    setPrice(newPrice)
  }

  const handleQuantityChange = (newQuantity: number) => {
    console.log('Quantity changed:', newQuantity)
    setQuantity(newQuantity)
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Custom Quantity Configuration Test</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* New Custom Quantity Component */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">🆕 Custom Quantity Selector</h2>
          <p className="text-sm text-gray-600 mb-4">
            This component demonstrates the new custom quantity functionality.
            Look for "Custom..." option in the dropdown to test custom quantity input.
          </p>

          <QuantitySelector
            value={quantity}
            onChange={handleQuantityChange}
            label="Select Quantity"
            required={true}
          />

          {quantity && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="font-medium mb-2">Selected Quantity:</h3>
              <p className="text-lg font-bold">{quantity.toLocaleString()} units</p>
            </div>
          )}
        </div>

        {/* Original Configuration Form */}
        <div className="border rounded-lg p-6">
          <h2 className="text-lg font-semibold mb-4">Original Product Configuration</h2>

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

      {/* Feature Overview */}
      <div className="mt-8 border rounded-lg p-6 bg-blue-50">
        <h2 className="text-lg font-semibold mb-4">🎯 Custom Quantity Feature Overview</h2>
        <div className="space-y-2 text-sm">
          <p><strong>✅ What's New:</strong> Customers can now select "Custom..." from quantity dropdown</p>
          <p><strong>🎛️ Functionality:</strong> When "Custom..." is selected, an input field appears for custom quantity entry</p>
          <p><strong>⚡ Validation:</strong> Min/max limits are enforced with helpful error messages</p>
          <p><strong>💰 Pricing:</strong> Custom quantities integrate seamlessly with pricing calculations</p>
          <p><strong>🔧 Admin Setup:</strong> Admins can add "Custom" to quantity values (e.g., "100,250,500,Custom")</p>
        </div>
      </div>
    </div>
  )
}
