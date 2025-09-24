/**
 * Custom hook for managing variable data state
 */

import { useState, useCallback } from 'react'
import { VariableDataConfig } from '../types/addon.types'

export function useVariableData(
  initialConfig?: VariableDataConfig,
  onChange?: (config: VariableDataConfig) => void
) {
  const [enabled, setEnabled] = useState(initialConfig?.enabled || false)
  const [locationsCount, setLocationsCount] = useState(initialConfig?.locationsCount || '')
  const [locations, setLocations] = useState(initialConfig?.locations || '')

  const handleToggle = useCallback((checked: boolean) => {
    setEnabled(checked)

    if (!checked) {
      setLocationsCount('')
      setLocations('')
    }

    onChange?.({
      enabled: checked,
      locationsCount: checked ? locationsCount : '',
      locations: checked ? locations : '',
    })
  }, [locationsCount, locations, onChange])

  const handleLocationsCountChange = useCallback((value: string) => {
    setLocationsCount(value)

    if (enabled) {
      onChange?.({
        enabled: true,
        locationsCount: value,
        locations,
      })
    }
  }, [enabled, locations, onChange])

  const handleLocationsChange = useCallback((value: string) => {
    setLocations(value)

    if (enabled) {
      onChange?.({
        enabled: true,
        locationsCount,
        locations: value,
      })
    }
  }, [enabled, locationsCount, onChange])

  return {
    enabled,
    locationsCount,
    locations,
    handleToggle,
    handleLocationsCountChange,
    handleLocationsChange,
  }
}
