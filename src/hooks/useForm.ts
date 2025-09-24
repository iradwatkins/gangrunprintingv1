import { useCallback, useState } from 'react'
import { z } from 'zod'

import { formatValidationErrors } from '@/lib/forms/validation'

export interface UseFormOptions<T> {
  initialValues: T
  validationSchema?: z.ZodSchema<T>
  onSubmit?: (values: T) => Promise<void> | void
}

export interface UseFormReturn<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isSubmitting: boolean
  isValid: boolean
  setValue: (field: keyof T, value: Record<string, unknown>) => void
  setValues: (values: Partial<T>) => void
  setFieldError: (field: keyof T, error: string) => void
  clearFieldError: (field: keyof T) => void
  clearErrors: () => void
  markFieldAsTouched: (field: keyof T) => void
  validateField: (field: keyof T) => boolean
  validateForm: () => boolean
  handleSubmit: (e?: React.FormEvent) => Promise<void>
  reset: () => void
}

/**
 * Custom hook for form state management with validation
 */
export function useForm<T extends Record<string, any>>({
  initialValues,
  validationSchema,
  onSubmit,
}: UseFormOptions<T>): UseFormReturn<T> {
  const [values, setFormValues] = useState<T>(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const setValue = useCallback(
    (field: keyof T, value: Record<string, unknown>) => {
      setFormValues((prev) => ({ ...prev, [field]: value }))

      // Clear error when field is updated
      if (errors[field as string]) {
        setErrors((prev) => {
          const newErrors = { ...prev }
          delete newErrors[field as string]
          return newErrors
        })
      }
    },
    [errors]
  )

  const setValues = useCallback((newValues: Partial<T>) => {
    setFormValues((prev) => ({ ...prev, ...newValues }))
  }, [])

  const setFieldError = useCallback((field: keyof T, error: string) => {
    setErrors((prev) => ({ ...prev, [field as string]: error }))
  }, [])

  const clearFieldError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      const newErrors = { ...prev }
      delete newErrors[field as string]
      return newErrors
    })
  }, [])

  const clearErrors = useCallback(() => {
    setErrors({})
  }, [])

  const markFieldAsTouched = useCallback((field: keyof T) => {
    setTouched((prev) => ({ ...prev, [field as string]: true }))
  }, [])

  const validateField = useCallback(
    (field: keyof T): boolean => {
      if (!validationSchema) return true

      try {
        // Create a schema for just this field
        const fieldSchema = validationSchema.shape[field as string]
        if (!fieldSchema) return true

        fieldSchema.parse(values[field])
        clearFieldError(field)
        return true
      } catch (error) {
        if (error instanceof z.ZodError) {
          setFieldError(field, error.errors[0]?.message || 'Invalid value')
        }
        return false
      }
    },
    [values, validationSchema, setFieldError, clearFieldError]
  )

  const validateForm = useCallback((): boolean => {
    if (!validationSchema) return true

    try {
      validationSchema.parse(values)
      clearErrors()
      return true
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors = formatValidationErrors(error)
        setErrors(formattedErrors)
      }
      return false
    }
  }, [values, validationSchema, clearErrors])

  const handleSubmit = useCallback(
    async (e?: React.FormEvent) => {
      e?.preventDefault()

      if (!validateForm()) {
        return
      }

      if (!onSubmit) return

      setIsSubmitting(true)
      try {
        await onSubmit(values)
      } catch (error) {
        throw error
      } finally {
        setIsSubmitting(false)
      }
    },
    [validateForm, onSubmit, values]
  )

  const reset = useCallback(() => {
    setFormValues(initialValues)
    setErrors({})
    setTouched({})
    setIsSubmitting(false)
  }, [initialValues])

  const isValid = Object.keys(errors).length === 0

  return {
    values,
    errors,
    touched,
    isSubmitting,
    isValid,
    setValue,
    setValues,
    setFieldError,
    clearFieldError,
    clearErrors,
    markFieldAsTouched,
    validateField,
    validateForm,
    handleSubmit,
    reset,
  }
}
