/**
 * Custom hook for managing corner rounding state
 */

import { useState, useCallback } from 'react'
import { type CornerRoundingConfig } from '../types/addon.types'

export function useCornerRounding(
  initialConfig?: CornerRoundingConfig,
  onChange?: (config: CornerRoundingConfig) => void
) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled || false)
  const [cornerType, setCornerType] = useState(initialConfig?.cornerType || 'All Four')

  const handleToggle = useCallback(
    (checked: boolean) => {
      setEnabled(checked)

      if (!checked) {
        setCornerType('All Four')
      }

      onChange?.({
        enabled: checked,
        cornerType: checked ? cornerType : 'All Four',
      })
    },
    [cornerType, onChange]
  )

  const handleCornerTypeChange = useCallback(
    (value: string) => {
      setCornerType(value)

      if (enabled) {
        onChange?.({
          enabled: true,
          cornerType: value,
        })
      }
    },
    [enabled, onChange]
  )

  return {
    enabled,
    cornerType,
    handleToggle,
    handleCornerTypeChange,
  }
}
