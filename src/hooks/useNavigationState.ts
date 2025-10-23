'use client'

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'gangrun_admin_navigation_state'

export interface NavigationState {
  [key: string]: boolean
}

export function useNavigationState(initialState: NavigationState = {}) {
  const [openSections, setOpenSections] = useState<NavigationState>(initialState)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          setOpenSections((prev) => ({ ...initialState, ...parsed }))
        }
        setIsLoaded(true)
      } catch (error) {
        console.error('Failed to load navigation state:', error)
        setIsLoaded(true)
      }
    }
  }, []) // Only run once on mount

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(openSections))
      } catch (error) {
        console.error('Failed to save navigation state:', error)
      }
    }
  }, [openSections, isLoaded])

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const expandAll = (keys: string[]) => {
    const newState: NavigationState = {}
    keys.forEach((key) => {
      newState[key] = true
    })
    setOpenSections(newState)
  }

  const collapseAll = () => {
    setOpenSections({})
  }

  return {
    openSections,
    toggleSection,
    expandAll,
    collapseAll,
    isLoaded,
  }
}
