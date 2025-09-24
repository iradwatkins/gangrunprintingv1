'use client'

import { useEffect, useState } from 'react'

interface ThemeConfig {
  cssVariables: Record<string, string>
  darkModeVariables?: Record<string, string>
  customCSS?: string
}

export function ThemeInjector() : unknown {
  const [theme, setTheme] = useState<ThemeConfig | null>(null)

  useEffect(() => {
    // Fetch active theme
    fetchActiveTheme()
  }, [])

  useEffect(() => {
    // Only apply custom theme if one exists and has valid variables
    const hasValidTheme = theme && theme.cssVariables && Object.keys(theme.cssVariables).length > 0

    if (!hasValidTheme) {
      // Remove any existing custom theme styles to let defaults show through
      const existingStyle = document.getElementById('custom-theme-styles')
      if (existingStyle && existingStyle.parentNode) {
        existingStyle.parentNode.removeChild(existingStyle)
      }
      return
    }

    // Create style element
    const styleId = 'custom-theme-styles'
    let styleElement = document.getElementById(styleId) as HTMLStyleElement

    if (!styleElement) {
      styleElement = document.createElement('style')
      styleElement.id = styleId
      document.head.appendChild(styleElement)
    }

    // Generate CSS
    let css = ''

    // Add :root variables
    if (theme.cssVariables && Object.keys(theme.cssVariables).length > 0) {
      css += ':root {\n'
      for (const [key, value] of Object.entries(theme.cssVariables)) {
        css += `  ${key}: ${value};\n`
      }
      css += '}\n\n'
    }

    // Add .dark variables
    if (theme.darkModeVariables && Object.keys(theme.darkModeVariables).length > 0) {
      css += '.dark {\n'
      for (const [key, value] of Object.entries(theme.darkModeVariables)) {
        css += `  ${key}: ${value};\n`
      }
      css += '}\n\n'
    }

    // Add custom CSS
    if (theme.customCSS) {
      css += theme.customCSS
    }

    // Apply CSS
    styleElement.textContent = css

    // Cleanup
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement)
      }
    }
  }, [theme])

  const fetchActiveTheme = async () => {
    try {
      const response = await fetch('/api/themes/active')
      if (response.ok) {
        const data = await response.json()
        // Only set theme if we got valid data
        if (data && data.cssVariables) {
          setTheme(data)
        }
      }
      // If response is not OK or theme is not found, leave theme as null
      // This will cause the default theme from globals.css to be used
    } catch (error) {
      // Silently fail and use default theme
    }
  }

  return null
}
