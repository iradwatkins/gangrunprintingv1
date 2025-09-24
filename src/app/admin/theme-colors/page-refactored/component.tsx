/**
 * page - component definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sun, Moon, Copy, Check, Download, Loader2, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'

export default function ThemeColors() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importMessage, setImportMessage] = useState('')

  // Ensure component is mounted to avoid hydration issues
  useEffect(() => {
    setMounted(true)
  }, [])

  const handleImportTheme = async () => {
    if (!importUrl.trim()) {
      setImportMessage('Please enter a theme URL')
      return
    }

    setIsImporting(true)
    setImportMessage('')

    try {
      const response = await fetch('/api/themes/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: importUrl,
          applyImmediately: true,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to import theme')
      }

      setImportMessage(`Theme "${data.theme.name}" imported and applied successfully!`)
      setImportUrl('')

      // Refresh the page to show new colors
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      setImportMessage(error instanceof Error ? error.message : 'Failed to import theme')
    } finally {
      setIsImporting(false)
    }
  }

  if (!mounted) {
    return null
  }

  const currentTheme = theme || 'light'

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Theme Colors</h1>
              <p className="text-muted-foreground mt-1">
                Complete OKLCH color system with light and dark theme support
              </p>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Theme:</span>
              <Button
                className="gap-2"
                size="sm"
                variant="outline"
                onClick={() => setTheme(currentTheme === 'dark' ? 'light' : 'dark')}
              >
                {currentTheme === 'dark' ? (
                  <>
                    <Moon className="h-4 w-4" />
                    Dark
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    Light
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Theme Import */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Download className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold text-card-foreground">Import Theme</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Instantly apply themes from TweakCN, Shadcn, or any URL with CSS variables.
            </p>

            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  className="flex-1"
                  disabled={isImporting}
                  placeholder="https://tweakcn.com/r/themes/..."
                  value={importUrl}
                  onChange={(e) => setImportUrl(e.target.value)}
                />
                <Button
                  className="gap-2 min-w-[120px]"
                  disabled={isImporting || !importUrl.trim()}
                  onClick={handleImportTheme}
                >
                  {isImporting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <ExternalLink className="h-4 w-4" />
                      Import & Apply
                    </>
                  )}
                </Button>
              </div>

              {importMessage && (
                <div
                  className={`text-sm p-3 rounded-md ${
                    importMessage.includes('success')
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}
                >
                  {importMessage}
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                <p className="mb-1">
                  <strong>Supported sources:</strong>
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>TweakCN themes (tweakcn.com)</li>
                  <li>Shadcn themes (ui.shadcn.com)</li>
                  <li>Direct CSS files with CSS variables</li>
                  <li>Any URL with JSON theme data</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Color Groups */}
        {Object.entries(colorGroups).map(([groupName, colors]) => (
          <div key={groupName} className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground border-b border-border pb-2">
              {groupName}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {colors.map((color) => (
                <ColorCard key={color.cssVar} color={color} currentTheme={currentTheme} />
              ))}
            </div>
          </div>
        ))}

        {/* Footer Info */}
        <div className="mt-12 p-6 bg-card border border-border rounded-lg">
          <h3 className="text-lg font-semibold text-card-foreground mb-3">About OKLCH Colors</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              This theme uses <strong>OKLCH</strong> (Oklch: Lightness, Chroma, Hue) color space for
              consistent and perceptually uniform colors across all themes.
            </p>
            <p>
              <strong>Format:</strong> oklch(lightness chroma hue) where lightness is 0-1, chroma is
              0-0.4+, and hue is 0-360 degrees.
            </p>
            <p>
              <strong>Primary Color:</strong> Tangerine Orange - oklch(0.6397 0.1720 36.4421)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
