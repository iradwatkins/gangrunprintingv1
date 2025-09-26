'use client'

import { useState, useEffect } from 'react'
import { DesignAddonSelector } from '@/components/product/addons/DesignAddonSelector'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function DesignAddonTestPage() {
  const [designAddons, setDesignAddons] = useState<any[]>([])
  const [selectedDesignOption, setSelectedDesignOption] = useState<string | null>(null)
  const [selectedSide, setSelectedSide] = useState<'oneSide' | 'twoSides' | null>(null)
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDesignAddons()
  }, [])

  const fetchDesignAddons = async () => {
    try {
      const response = await fetch('/api/addon-sets')
      const data = await response.json()

      // Find the design services addon set
      const designSet = data.addOnSets?.find((set: any) => set.name === 'Design Services')

      if (designSet && designSet.addOnSetItems) {
        const addons = designSet.addOnSetItems.map((item: any) => item.AddOn)
        setDesignAddons(addons)
      }
    } catch (error) {
      console.error('Failed to fetch design addons:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDesignOptionChange = (
    optionId: string | null,
    side?: string | null,
    files?: any[]
  ) => {
    setSelectedDesignOption(optionId)
    if (side !== undefined) {
      setSelectedSide(side as 'oneSide' | 'twoSides' | null)
    } else if (optionId !== selectedDesignOption) {
      // Reset side when changing primary option
      setSelectedSide(null)
    }
    if (files !== undefined) {
      setUploadedFiles(files)
    }
  }

  const handleFilesUploaded = (files: any[]) => {
    setUploadedFiles(files)
  }

  const getSelectedAddonInfo = () => {
    if (!selectedDesignOption) return null
    const addon = designAddons.find(a => a.id === selectedDesignOption)
    if (!addon) return null

    let price = 0
    let isValid = true

    if (addon.configuration?.requiresSideSelection && addon.configuration.sideOptions) {
      if (selectedSide) {
        price = addon.configuration.sideOptions[selectedSide].price
      } else {
        // No side selected - invalid for Standard/Rush options
        isValid = false
      }
    } else {
      price = addon.configuration?.basePrice || addon.price || 0
    }

    return {
      name: addon.name,
      side: addon.configuration?.requiresSideSelection ? selectedSide : null,
      price: price,
      files: uploadedFiles.length,
      isValid: isValid,
      requiresSideSelection: addon.configuration?.requiresSideSelection || false
    }
  }

  const selectedInfo = getSelectedAddonInfo()

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Design Add-on Test Page</h1>

      <div className="space-y-8">
        {/* Design Addon Selector */}
        <Card>
          <CardHeader>
            <CardTitle>Design Service Options</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div>Loading design options...</div>
            ) : (
              <DesignAddonSelector
                designAddons={designAddons}
                selectedDesignOption={selectedDesignOption}
                selectedSide={selectedSide}
                uploadedFiles={uploadedFiles}
                onDesignOptionChange={handleDesignOptionChange}
                onFilesUploaded={handleFilesUploaded}
                disabled={false}
              />
            )}
          </CardContent>
        </Card>

        {/* Selection Summary */}
        <Card>
          <CardHeader>
            <CardTitle>Selection Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedInfo ? (
              <div className="space-y-2">
                <p><strong>Selected Service:</strong> {selectedInfo.name}</p>
                {selectedInfo.requiresSideSelection && (
                  <>
                    {selectedInfo.side ? (
                      <p><strong>Sides:</strong> {selectedInfo.side === 'oneSide' ? 'One Side' : 'Two Sides'}</p>
                    ) : (
                      <p className="text-orange-600"><strong>⚠️ Sides:</strong> Please select sides to continue</p>
                    )}
                  </>
                )}
                <p><strong>Price:</strong> ${selectedInfo.price.toFixed(2)}</p>
                <p><strong>Files Uploaded:</strong> {selectedInfo.files}</p>
                <p><strong>Valid for Cart:</strong>
                  <span className={selectedInfo.isValid ? 'text-green-600' : 'text-red-600'}>
                    {selectedInfo.isValid ? ' ✓ Yes' : ' ✗ No (incomplete selection)'}
                  </span>
                </p>
              </div>
            ) : (
              <p className="text-muted-foreground">No design service selected</p>
            )}
          </CardContent>
        </Card>

        {/* Raw State Debug */}
        <Card>
          <CardHeader>
            <CardTitle>Debug Information</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-lg overflow-auto text-xs">
              {JSON.stringify({
                selectedDesignOption,
                selectedSide,
                uploadedFilesCount: uploadedFiles.length,
                uploadedFiles: uploadedFiles.map(f => ({
                  fileId: f.fileId,
                  name: f.originalName,
                  size: f.size
                })),
                availableAddons: designAddons.map(a => ({
                  id: a.id,
                  name: a.name,
                  configuration: a.configuration
                }))
              }, null, 2)}
            </pre>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button
              onClick={() => {
                setSelectedDesignOption(null)
                setSelectedSide(null)
                setUploadedFiles([])
              }}
              variant="outline"
            >
              Reset Selection
            </Button>
            <Button
              onClick={() => {
                const info = getSelectedAddonInfo()
                if (info?.isValid) {
                  alert(`Configuration would be submitted:\n${JSON.stringify(info, null, 2)}`)
                } else {
                  alert('Cannot submit: Please complete your selection')
                }
              }}
              variant="default"
              disabled={!selectedDesignOption || !selectedInfo?.isValid}
            >
              Submit Configuration
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}