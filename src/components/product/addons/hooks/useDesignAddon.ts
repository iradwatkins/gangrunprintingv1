import { useState, useCallback, useMemo } from 'react'

interface DesignAddonConfig {
  selectedOption: string | null
  selectedSide?: 'oneSide' | 'twoSides' | null
  uploadedFiles: any[]
}

interface DesignAddonHookProps {
  config?: DesignAddonConfig
  onChange?: (config: DesignAddonConfig) => void
  designAddons?: any[]
}

export function useDesignAddon({
  config,
  onChange,
  designAddons = []
}: DesignAddonHookProps = {}) {
  const [selectedOption, setSelectedOption] = useState<string | null>(
    config?.selectedOption ?? null
  )
  const [selectedSide, setSelectedSide] = useState<'oneSide' | 'twoSides' | null>(
    config?.selectedSide ?? null
  )
  const [uploadedFiles, setUploadedFiles] = useState<any[]>(
    config?.uploadedFiles ?? []
  )

  const handleDesignOptionChange = useCallback((
    optionId: string | null,
    side?: string | null,
    files?: any[]
  ) => {
    setSelectedOption(optionId)

    // Reset side selection when changing primary option
    if (side !== undefined) {
      setSelectedSide(side as 'oneSide' | 'twoSides' | null)
    } else if (optionId !== selectedOption) {
      // Clear side selection when primary option changes
      setSelectedSide(null)
    }

    if (files !== undefined) {
      setUploadedFiles(files)
    }

    onChange?.({
      selectedOption: optionId,
      selectedSide: side !== undefined ? (side as 'oneSide' | 'twoSides' | null) : selectedSide,
      uploadedFiles: files ?? uploadedFiles
    })
  }, [onChange, uploadedFiles, selectedOption, selectedSide])

  const handleFilesUploaded = useCallback((files: any[]) => {
    setUploadedFiles(files)

    onChange?.({
      selectedOption,
      selectedSide,
      uploadedFiles: files
    })
  }, [onChange, selectedOption, selectedSide])

  // Calculate the price for the selected design option
  const calculatePrice = useMemo(() => {
    if (!selectedOption || !designAddons.length) return 0

    const addon = designAddons.find(a => a.id === selectedOption)
    if (!addon) return 0

    // For options with side selection
    if (addon.configuration?.requiresSideSelection && addon.configuration.sideOptions) {
      return addon.configuration.sideOptions[selectedSide].price
    }

    // For flat price options
    return addon.configuration?.basePrice ?? addon.price ?? 0
  }, [selectedOption, selectedSide, designAddons])

  // Check if the current selection is valid for cart
  const isValid = useMemo(() => {
    if (!selectedOption) return true // No selection is valid

    const addon = designAddons.find(a => a.id === selectedOption)
    if (!addon) return false

    // For Standard/Rush Design options, side selection is required
    if (addon.configuration?.requiresSideSelection && !selectedSide) {
      return false
    }

    // File upload is always optional, so doesn't affect validity
    return true
  }, [selectedOption, selectedSide, designAddons])

  // Check if we can add to cart (prevent checkout with incomplete selection)
  const canAddToCart = useMemo(() => {
    return isValid
  }, [isValid])

  // Get the display text for the current selection
  const getDisplayText = useCallback(() => {
    if (!selectedOption) return 'No design service selected'

    const addon = designAddons.find(a => a.id === selectedOption)
    if (!addon) return ''

    let text = addon.name

    if (addon.configuration?.requiresSideSelection && selectedSide && addon.configuration.sideOptions) {
      text += ` - ${addon.configuration.sideOptions[selectedSide].label}`
    }

    if (calculatePrice > 0) {
      text += ` ($${calculatePrice.toFixed(2)})`
    }

    if (uploadedFiles.length > 0) {
      text += ` - ${uploadedFiles.length} file(s) uploaded`
    }

    return text
  }, [selectedOption, selectedSide, uploadedFiles, designAddons, calculatePrice])

  // Check if file upload should be shown
  const shouldShowFileUpload = useMemo(() => {
    if (!selectedOption) return false

    const addon = designAddons.find(a => a.id === selectedOption)
    return addon?.configuration?.requiresFileUpload === true
  }, [selectedOption, designAddons])

  // Get configuration for order submission
  const getOrderConfiguration = useCallback(() => {
    if (!selectedOption) return null

    return {
      designAddonId: selectedOption,
      side: selectedSide,
      uploadedFileIds: uploadedFiles.map(f => f.fileId),
      price: calculatePrice,
      requiresArtwork: shouldShowFileUpload && uploadedFiles.length === 0
    }
  }, [selectedOption, selectedSide, uploadedFiles, calculatePrice, shouldShowFileUpload])

  return {
    selectedOption,
    selectedSide,
    uploadedFiles,
    handleDesignOptionChange,
    handleFilesUploaded,
    calculatePrice,
    isValid,
    canAddToCart,
    getDisplayText,
    shouldShowFileUpload,
    getOrderConfiguration
  }
}