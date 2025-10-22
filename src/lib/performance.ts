/**
 * Performance optimization utilities
 * Provides helpers for memoization, debouncing, and performance monitoring
 */

import { useEffect, useRef, useCallback, useState } from 'react'
import { DEBOUNCE_DELAY } from '@/config/constants'

/**
 * Debounces a function call by the specified delay
 * @param fn - The function to debounce
 * @param delay - Delay in milliseconds (default: DEBOUNCE_DELAY)
 * @returns Debounced function
 */
export function debounce<T extends (...args: Record<string, unknown>[]) => any>(
  fn: T,
  delay: number = DEBOUNCE_DELAY
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout | null = null

  return function debounced(...args: Parameters<T>) {
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    timeoutId = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * Throttles a function call to execute at most once per interval
 * @param fn - The function to throttle
 * @param interval - Interval in milliseconds
 * @returns Throttled function
 */
export function throttle<T extends (...args: Record<string, unknown>[]) => any>(
  fn: T,
  interval: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  let timeoutId: NodeJS.Timeout | null = null

  return function throttled(...args: Parameters<T>) {
    const now = Date.now()

    if (now - lastTime >= interval) {
      lastTime = now
      fn(...args)
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      timeoutId = setTimeout(
        () => {
          lastTime = Date.now()
          fn(...args)
        },
        interval - (now - lastTime)
      )
    }
  }
}

/**
 * React hook for debounced values
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced value
 */
export function useDebounce<T>(value: T, delay: number = DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * React hook for debounced callback
 * @param callback - The callback to debounce
 * @param delay - Delay in milliseconds
 * @returns Debounced callback
 */
export function useDebouncedCallback<T extends (...args: Record<string, unknown>[]) => any>(
  callback: T,
  delay: number = DEBOUNCE_DELAY
): T {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      timeoutRef.current = setTimeout(() => {
        callbackRef.current(...args)
      }, delay)
    }) as T,
    [delay]
  )
}

/**
 * React hook for throttled callback
 * @param callback - The callback to throttle
 * @param interval - Interval in milliseconds
 * @returns Throttled callback
 */
export function useThrottledCallback<T extends (...args: Record<string, unknown>[]) => any>(
  callback: T,
  interval: number
): T {
  const callbackRef = useRef(callback)
  const lastRunRef = useRef(0)

  // Update callback ref when it changes
  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  return useCallback(
    ((...args: Parameters<T>) => {
      const now = Date.now()

      if (now - lastRunRef.current >= interval) {
        lastRunRef.current = now
        callbackRef.current(...args)
      }
    }) as T,
    [interval]
  )
}

/**
 * React hook for intersection observer
 * @param callback - Callback when element becomes visible
 * @param options - Intersection observer options
 * @returns Ref to attach to element
 */
export function useIntersectionObserver(
  callback: (entry: IntersectionObserverEntry) => void,
  options?: IntersectionObserverInit
) {
  const observerRef = useRef<IntersectionObserver | null>(null)
  const elementRef = useRef<HTMLElement | null>(null)

  const setElement = useCallback(
    (element: HTMLElement | null) => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }

      if (element) {
        observerRef.current = new IntersectionObserver(([entry]) => {
          callback(entry)
        }, options)

        observerRef.current.observe(element)
      }

      elementRef.current = element
    },
    [callback, options]
  )

  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [])

  return setElement
}

/**
 * React hook for lazy loading images
 * @param src - Image source URL
 * @param placeholder - Placeholder image URL
 * @returns Object with loaded state and current source
 */
export function useLazyImage(src: string, placeholder?: string) {
  const [imageSrc, setImageSrc] = useState(placeholder || '')
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const img = new Image()

    img.onload = () => {
      setImageSrc(src)
      setIsLoaded(true)
      setError(null)
    }

    img.onerror = () => {
      setError('Failed to load image')
      setIsLoaded(false)
    }

    img.src = src

    return () => {
      img.onload = null
      img.onerror = null
    }
  }, [src])

  return { src: imageSrc, isLoaded, error }
}

/**
 * Memoizes a function result with custom comparison
 * @param fn - Function to memoize
 * @param deps - Dependencies array
 * @param compare - Custom comparison function
 * @returns Memoized result
 */
export function useDeepMemo<T>(
  fn: () => T,
  deps: Record<string, unknown>[],
  compare?: (prev: Record<string, unknown>[], next: Record<string, unknown>[]) => boolean
): T {
  const ref = useRef<{ deps: Record<string, unknown>[]; result: T } | null>(null)

  if (!ref.current) {
    ref.current = { deps, result: fn() }
    return ref.current.result
  }

  const shouldUpdate = compare
    ? !compare(ref.current.deps, deps)
    : !deps.every((dep, i) => dep === ref.current!.deps[i])

  if (shouldUpdate) {
    ref.current.deps = deps
    ref.current.result = fn()
  }

  return ref.current.result
}

/**
 * Batches multiple state updates to reduce re-renders
 * @param updates - Array of state update functions
 */
export function batchUpdates(updates: (() => void)[]) {
  // React 18+ automatically batches updates, but this ensures compatibility
  if ('startTransition' in React) {
    React.startTransition(() => {
      updates.forEach((update) => update())
    })
  } else {
    updates.forEach((update) => update())
  }
}

/**
 * Performance monitoring helper
 * @param name - Name of the operation
 * @param fn - Function to measure
 * @returns Function result
 */
export async function measurePerformance<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
  const start = performance.now()

  try {
    const result = await fn()
    const duration = performance.now() - start

    if (process.env.NODE_ENV === 'development') {
    }

    return result
  } catch (error) {
    const duration = performance.now() - start
    console.error(`Performance measurement failed for ${name} after ${duration}ms`, error)
    throw error
  }
}

/**
 * Creates a memoized selector for complex computations
 * @param selectors - Input selectors
 * @param combiner - Function to combine selector results
 * @returns Memoized selector
 */
export function createSelector<
  T extends readonly ((...args: Record<string, unknown>[]) => any)[],
  R,
>(
  selectors: T,
  combiner: (...results: { [K in keyof T]: ReturnType<T[K]> }) => R
): (...args: Parameters<T[0]>) => R {
  let lastArgs: Record<string, unknown>[] | null = null
  let lastResults: Record<string, unknown>[] | null = null
  let lastCombined: R | null = null

  return (...args: Parameters<T[0]>) => {
    const results = selectors.map((selector) => selector(...args))

    // Check if results have changed
    const hasChanged = !lastResults || results.some((result, i) => result !== lastResults![i])

    if (hasChanged) {
      lastArgs = args
      lastResults = results
      lastCombined = combiner(...(results as any))
    }

    return lastCombined!
  }
}

/**
 * Request idle callback polyfill for browsers that don't support it
 */
export const requestIdleCallback =
  (typeof window !== 'undefined' && window.requestIdleCallback) ||
  function (cb: IdleRequestCallback): number {
    const start = Date.now()
    return setTimeout(function () {
      cb({
        didTimeout: false,
        timeRemaining: function () {
          return Math.max(0, 50 - (Date.now() - start))
        },
      } as IdleDeadline)
    }, 1) as unknown as number
  }

/**
 * Cancels an idle callback
 */
export const cancelIdleCallback =
  (typeof window !== 'undefined' && window.cancelIdleCallback) ||
  function (id: number) {
    clearTimeout(id)
  }
