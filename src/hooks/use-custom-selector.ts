import { useState, useEffect, useCallback } from 'react'

// Generic option type that works for both quantity and size selectors
export interface SelectorOption<T = unknown> {
  id: string
  name: string
  value?: T
  isCustom: boolean
  minValue?: T
  maxValue?: T
  displayName?: string | null
}

export interface UseCustomSelectorProps<T> {
  options: SelectorOption<T>[]
  value: T | null
  onChange: (value: T) => void
  fetchUrl?: string
  validateCustomValue?: (value: T, option: SelectorOption<T>) => string | null
  formatCustomValue?: (value: string) => T
}

export interface UseCustomSelectorResult<T> {
  selectedOption: string
  showCustomInput: boolean
  customValue: string
  error: string
  loading: boolean
  effectiveOptions: SelectorOption<T>[]
  handleSelectionChange: (optionId: string) => void
  handleCustomValueChange: (value: string) => void
  validateAndUpdate: () => void
}

export function useCustomSelector<T>({
  options,
  value,
  onChange,
  fetchUrl,
  validateCustomValue,
  formatCustomValue,
}: UseCustomSelectorProps<T>): UseCustomSelectorResult<T> {
  const [selectedOption, setSelectedOption] = useState<string>('')
  const [customValue, setCustomValue] = useState<string>('')
  const [showCustomInput, setShowCustomInput] = useState(false)
  const [error, setError] = useState<string>('')
  const [defaultOptions, setDefaultOptions] = useState<SelectorOption<T>[]>([])
  const [loading, setLoading] = useState(false)

  // Fetch default options if none provided and URL is given
  useEffect(() => {
    if (options.length === 0 && fetchUrl) {
      setLoading(true)
      fetch(fetchUrl)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }
          return res.json()
        })
        .then((data) => {
          setDefaultOptions(data || [])
          setLoading(false)
        })
        .catch((err) => {
          // Silently fail and use empty array
          setDefaultOptions([])
          setLoading(false)
        })
    }
  }, [options, fetchUrl])

  const effectiveOptions = options.length > 0 ? options : defaultOptions
  const safeOptions = Array.isArray(effectiveOptions) ? effectiveOptions : []

  // Set initial selection based on value
  useEffect(() => {
    if (value && safeOptions.length > 0) {
      // Check if value matches a preset option
      const matchingOption = safeOptions.find((opt) => {
        if (opt.value === undefined) return false
        return JSON.stringify(opt.value) === JSON.stringify(value)
      })

      if (matchingOption) {
        setSelectedOption(matchingOption.id)
        setShowCustomInput(false)
        setCustomValue('')
      } else {
        // It's a custom value
        const customOption = safeOptions.find((opt) => opt.isCustom)
        if (customOption) {
          setSelectedOption(customOption.id)
          setShowCustomInput(true)
          // Convert value to string for input
          if (typeof value === 'object' && value !== null) {
            // For complex values like {width, height}, we'll handle this in the component
            setCustomValue(JSON.stringify(value))
          } else {
            setCustomValue(String(value))
          }
        }
      }
    }
  }, [value, safeOptions])

  const handleSelectionChange = useCallback(
    (optionId: string) => {
      setSelectedOption(optionId)
      setError('')

      const selected = safeOptions.find((opt) => opt.id === optionId)
      if (!selected) return

      if (selected.isCustom) {
        setShowCustomInput(true)
        // Preserve existing custom value if switching back to custom
        if (!customValue && value) {
          if (typeof value === 'object' && value !== null) {
            setCustomValue(JSON.stringify(value))
          } else {
            setCustomValue(String(value))
          }
        }
      } else {
        setShowCustomInput(false)
        setCustomValue('')
        if (selected.value !== undefined) {
          onChange(selected.value)
        }
      }
    },
    [safeOptions, customValue, value, onChange]
  )

  const handleCustomValueChange = useCallback((inputValue: string) => {
    setCustomValue(inputValue)
    setError('')
  }, [])

  const validateAndUpdate = useCallback(() => {
    if (!showCustomInput || !customValue) return

    const customOption = safeOptions.find((opt) => opt.isCustom)
    if (!customOption) return

    try {
      // Format the custom value if formatter provided
      const formattedValue = formatCustomValue
        ? formatCustomValue(customValue)
        : (customValue as unknown as T)

      // Validate the custom value if validator provided
      if (validateCustomValue) {
        const validationError = validateCustomValue(formattedValue, customOption)
        if (validationError) {
          setError(validationError)
          return
        }
      }

      // Update the value
      onChange(formattedValue)
      setError('')
    } catch (err) {
      setError('Invalid input format')
    }
  }, [showCustomInput, customValue, safeOptions, formatCustomValue, validateCustomValue, onChange])

  // Auto-validate when custom value changes
  useEffect(() => {
    if (showCustomInput && customValue) {
      const timer = setTimeout(() => {
        validateAndUpdate()
      }, 500) // Debounce validation

      return () => clearTimeout(timer)
    }
  }, [customValue, showCustomInput, validateAndUpdate])

  return {
    selectedOption,
    showCustomInput,
    customValue,
    error,
    loading,
    effectiveOptions: safeOptions,
    handleSelectionChange,
    handleCustomValueChange,
    validateAndUpdate,
  }
}
