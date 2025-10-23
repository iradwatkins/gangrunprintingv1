'use client'

import { useState, useEffect } from 'react'

/**
 * Custom hook for responsive media queries
 * Returns true if the media query matches, false otherwise
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)

    // Set initial value
    setMatches(media.matches)

    // Create event listener
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Add event listener
    media.addEventListener('change', listener)

    // Cleanup
    return () => {
      media.removeEventListener('change', listener)
    }
  }, [query])

  return matches
}

/**
 * Predefined breakpoint hooks for common use cases
 */

// Mobile-first breakpoints (Tailwind CSS defaults)
export const useIsMobile = () => useMediaQuery('(max-width: 767px)')
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)')
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)')

// Specific viewport queries
export const useIsSmallMobile = () => useMediaQuery('(max-width: 479px)')
export const useIsLargeMobile = () => useMediaQuery('(min-width: 480px) and (max-width: 767px)')
export const useIsSmallTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 991px)')
export const useIsLargeTablet = () => useMediaQuery('(min-width: 992px) and (max-width: 1023px)')

// Orientation queries
export const useIsLandscape = () => useMediaQuery('(orientation: landscape)')
export const useIsPortrait = () => useMediaQuery('(orientation: portrait)')

// Accessibility queries
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)')

// Touch device detection
export const useIsTouch = () => useMediaQuery('(hover: none) and (pointer: coarse)')
export const useCanHover = () => useMediaQuery('(hover: hover)')

/**
 * Hook for getting current breakpoint name
 */
export function useBreakpoint(): 'mobile' | 'tablet' | 'desktop' {
  const isMobile = useIsMobile()
  const isTablet = useIsTablet()

  if (isMobile) return 'mobile'
  if (isTablet) return 'tablet'
  return 'desktop'
}

/**
 * Hook for getting detailed viewport information
 */
export function useViewport() {
  const [viewport, setViewport] = useState({
    width: 0,
    height: 0,
  })

  useEffect(() => {
    if (typeof window === 'undefined') return

    const updateViewport = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    // Set initial value
    updateViewport()

    // Add event listener
    window.addEventListener('resize', updateViewport)

    // Cleanup
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  return viewport
}
