/**
 * Custom hook for managing banding state
 */

import { useState, useCallback } from 'react'
import { type BandingConfig } from '../types/addon.types'

export function useBanding(
  initialConfig?: BandingConfig,
  onChange?: (config: BandingConfig) => void
) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled || false)
  const [bandingType, setBandingType] = useState(initialConfig?.bandingType || 'paper')
  const [itemsPerBundle, setItemsPerBundle] = useState(initialConfig?.itemsPerBundle || 100)

  const handleToggle = useCallback(
    (checked: boolean) => {
      setEnabled(checked)

      if (!checked) {
        setBandingType('paper')
        setItemsPerBundle(100)
      }

      onChange?.({
        enabled: checked,
        bandingType: checked ? bandingType : 'paper',
        itemsPerBundle: checked ? itemsPerBundle : 100,
      })
    },
    [bandingType, itemsPerBundle, onChange]
  )

  const handleBandingTypeChange = useCallback(
    (value: string) => {
      setBandingType(value)

      if (enabled) {
        onChange?.({
          enabled: true,
          bandingType: value,
          itemsPerBundle,
        })
      }
    },
    [enabled, itemsPerBundle, onChange]
  )

  const handleItemsPerBundleChange = useCallback(
    (value: number) => {
      setItemsPerBundle(value)

      if (enabled) {
        onChange?.({
          enabled: true,
          bandingType,
          itemsPerBundle: value,
        })
      }
    },
    [enabled, bandingType, onChange]
  )

  return {
    enabled,
    bandingType,
    itemsPerBundle,
    handleToggle,
    handleBandingTypeChange,
    handleItemsPerBundleChange,
  }
}
