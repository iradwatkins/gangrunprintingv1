'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { ThemeEngine, type CompiledTheme } from '@/lib/white-label/theming'

interface ThemeContextType {
  theme: CompiledTheme
  tenant: TenantInfo | null
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  tenant: TenantInfo | null
}

export function ThemeProvider({ children, tenant }: ThemeProviderProps) {
  const [theme, setTheme] = useState<CompiledTheme | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const generateTheme = async () => {
      try {
        const themeEngine = ThemeEngine.getInstance()
        const compiledTheme = themeEngine.generateTheme(tenant)
        setTheme(compiledTheme)
      } catch (error) {
        // Fallback to default theme
        const themeEngine = ThemeEngine.getInstance()
        const defaultTheme = themeEngine.generateTheme(null)
        setTheme(defaultTheme)
      } finally {
        setIsLoading(false)
      }
    }

    generateTheme()
  }, [tenant])

  // Apply theme to DOM when it changes
  useEffect(() => {
    if (!theme) return

    // Apply CSS variables to root
    const root = document.documentElement
    Object.entries(theme.cssVariables).forEach(([property, value]) => {
      root.style.setProperty(property, value)
    })

    // Add/update theme CSS classes
    let themeStyleElement = document.getElementById('theme-styles')
    if (!themeStyleElement) {
      themeStyleElement = document.createElement('style')
      themeStyleElement.id = 'theme-styles'
      document.head.appendChild(themeStyleElement)
    }
    themeStyleElement.textContent = theme.cssClasses

    // Add/update custom CSS
    let customStyleElement = document.getElementById('custom-styles')
    if (theme.customCss) {
      if (!customStyleElement) {
        customStyleElement = document.createElement('style')
        customStyleElement.id = 'custom-styles'
        document.head.appendChild(customStyleElement)
      }
      customStyleElement.textContent = theme.customCss
    } else if (customStyleElement) {
      customStyleElement.remove()
    }

    // Load custom fonts
    loadCustomFonts(theme.fonts)

    return () => {
      // Cleanup is handled by the next theme application
    }
  }, [theme])

  const contextValue: ThemeContextType = {
    theme: theme!,
    tenant,
    isLoading,
  }

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>
}

export function useTheme() : unknown {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// Helper function to load custom fonts
function loadCustomFonts(fonts: string[]) {
  const loadedFonts = new Set<string>()

  fonts.forEach((fontFamily) => {
    if (loadedFonts.has(fontFamily)) return

    // Check if font is already loaded
    if (document.fonts.check(`16px "${fontFamily}"`)) {
      loadedFonts.add(fontFamily)
      return
    }

    // Load from Google Fonts
    const linkId = `font-${fontFamily.replace(/\s+/g, '-').toLowerCase()}`
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link')
      link.id = linkId
      link.rel = 'stylesheet'
      link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:wght@300;400;500;600;700&display=swap`
      document.head.appendChild(link)

      // Wait for font to load
      const fontFace = new FontFace(fontFamily, `url(${link.href})`)
      fontFace
        .load()
        .then(() => {
          document.fonts.add(fontFace)
          loadedFonts.add(fontFamily)
        })
        .catch((error) => {
          })
    }
  })
}

// Hook to get current brand information
export function useBrand() : unknown {
  const { tenant } = useTheme()
  return {
    logoUrl: tenant?.branding?.logoUrl,
    logoText: tenant?.branding?.logoText || tenant?.name || 'GangRun Printing',
    faviconUrl: tenant?.branding?.faviconUrl,
    name: tenant?.name || 'GangRun Printing',
  }
}

// Hook to get CSS variable values
export function useCSSVariable(variableName: string): string {
  const { theme } = useTheme()

  useEffect(() => {
    if (theme?.cssVariables[variableName]) {
      document.documentElement.style.setProperty(variableName, theme.cssVariables[variableName])
    }
  }, [theme, variableName])

  return theme?.cssVariables[variableName] || ''
}

// Component to inject tenant-specific metadata
export function TenantMetadata() : unknown {
  const { tenant } = useTheme()

  useEffect(() => {
    if (!tenant) return

    // Update favicon
    if (tenant.branding?.faviconUrl) {
      let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement
      if (!favicon) {
        favicon = document.createElement('link')
        favicon.rel = 'icon'
        document.head.appendChild(favicon)
      }
      favicon.href = tenant.branding.faviconUrl
    }

    // Update page title if logoText is provided
    if (tenant.branding?.logoText) {
      const titleSuffix = ' - Professional Print Services'
      if (!document.title.includes(tenant.branding.logoText)) {
        document.title = tenant.branding.logoText + titleSuffix
      }
    }
  }, [tenant])

  return null
}
