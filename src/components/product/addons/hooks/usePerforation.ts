/**
 * Custom hook for managing perforation state
 */

import { useState, useCallback } from 'react'
import { PerforationConfig } from '../types/addon.types'

export function usePerforation(
  initialConfig?: PerforationConfig,
  onChange?: (config: PerforationConfig) => void
) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled || false)
  const [verticalCount, setVerticalCount] = useState(initialConfig?.verticalCount || '0')
  const [verticalPosition, setVerticalPosition] = useState(initialConfig?.verticalPosition || '')
  const [horizontalCount, setHorizontalCount] = useState(initialConfig?.horizontalCount || '0')
  const [horizontalPosition, setHorizontalPosition] = useState(initialConfig?.horizontalPosition || '')

  const handleToggle = useCallback((checked: boolean) => {
    setEnabled(checked)

    if (!checked) {
      setVerticalCount('0')
      setVerticalPosition('')
      setHorizontalCount('0')
      setHorizontalPosition('')
    }

    onChange?.({
      enabled: checked,
      verticalCount: checked ? verticalCount : '0',
      verticalPosition: checked ? verticalPosition : '',
      horizontalCount: checked ? horizontalCount : '0',
      horizontalPosition: checked ? horizontalPosition : '',
    })
  }, [verticalCount, verticalPosition, horizontalCount, horizontalPosition, onChange])

  const updateConfig = useCallback((field: string, value: string) => {
    const updates = {
      verticalCount,
      verticalPosition,
      horizontalCount,
      horizontalPosition,
      [field]: value,
    }

    if (field === 'verticalCount') setVerticalCount(value)
    if (field === 'verticalPosition') setVerticalPosition(value)
    if (field === 'horizontalCount') setHorizontalCount(value)
    if (field === 'horizontalPosition') setHorizontalPosition(value)

    if (enabled) {
      onChange?.({
        enabled: true,
        ...updates,
      })
    }
  }, [enabled, verticalCount, verticalPosition, horizontalCount, horizontalPosition, onChange])

  return {
    enabled,
    verticalCount,
    verticalPosition,
    horizontalCount,
    horizontalPosition,
    handleToggle,
    updateConfig,
  }
}
