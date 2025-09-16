'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ProductPaperStocks } from '../product-paper-stocks'
import { FileText, Info } from 'lucide-react'

interface ProductData {
  paperStocks: any[]
}

interface ProductPaperStockStepProps {
  formData: ProductData
  onUpdate: (updates: Partial<ProductData>) => void
  onValidationChange: (isValid: boolean) => void
}

export function ProductPaperStockStep({
  formData,
  onUpdate,
  onValidationChange,
}: ProductPaperStockStepProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    validateStep()
  }, [formData.paperStocks])

  const validateStep = () => {
    const newErrors: Record<string, string> = {}

    // At least one paper stock should be selected
    if (!formData.paperStocks || formData.paperStocks.length === 0) {
      newErrors.paperStocks = 'At least one paper stock option must be selected'
    }

    // Check if at least one paper stock is set as default
    const hasDefault = formData.paperStocks.some(stock => stock.isDefault)
    if (formData.paperStocks.length > 0 && !hasDefault) {
      newErrors.defaultPaper = 'One paper stock must be set as the default option'
    }

    setErrors(newErrors)
    const isValid = Object.keys(newErrors).length === 0
    onValidationChange(isValid)
  }

  const handleStocksChange = (stocks: any[]) => {
    onUpdate({ paperStocks: stocks })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Paper Stock Configuration</CardTitle>
              <CardDescription>
                Choose which paper options will be available for this product
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Paper Stock Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Available Paper Options</CardTitle>
          <CardDescription>
            Select the paper stocks customers can choose from when ordering this product
          </CardDescription>
        </CardHeader>
        <CardContent>
          {Object.keys(errors).length > 0 && (
            <Alert variant="destructive" className="mb-4">
              <Info className="h-4 w-4" />
              <AlertDescription>
                <ul className="space-y-1">
                  {Object.values(errors).map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          <ProductPaperStocks
            selectedStocks={formData.paperStocks}
            onStocksChange={handleStocksChange}
          />
        </CardContent>
      </Card>

      {/* Configuration Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Paper Stock Best Practices</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• <strong>Default Option:</strong> Choose the most popular or cost-effective option as default</li>
                <li>• <strong>Variety:</strong> Offer 2-5 options to give customers choice without overwhelming them</li>
                <li>• <strong>Pricing:</strong> Ensure paper stock pricing is properly configured in the paper stocks management</li>
                <li>• <strong>Availability:</strong> Only include paper stocks that are readily available from your suppliers</li>
              </ul>
            </div>

            {formData.paperStocks.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Current Selection Summary</h4>
                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Total Options:</span> {formData.paperStocks.length}
                  </div>
                  {formData.paperStocks.map((stock, index) => (
                    <div key={index} className="text-sm text-gray-600 flex items-center gap-2">
                      <span>• {stock.name}</span>
                      {stock.isDefault && (
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                          Default
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Next Steps Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What's Next?</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600 space-y-2">
            <p>After configuring paper stocks, you'll set up:</p>
            <ul className="space-y-1 ml-4">
              <li>• Available quantity options</li>
              <li>• Size configurations</li>
              <li>• Add-on services and options</li>
              <li>• Production turnaround times</li>
              <li>• Final pricing testing</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}