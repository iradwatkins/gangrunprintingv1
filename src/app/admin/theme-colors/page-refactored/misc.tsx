/**
 * page - misc definitions
 * Auto-refactored by BMAD
 */

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sun, Moon, Copy, Check, Download, Loader2, ExternalLink } from 'lucide-react'
import { useTheme } from 'next-themes'


'use client'


interface ColorInfo {
  name: string
  cssVar: string
  lightValue: string
  darkValue: string
  description?: string
}

const colorGroups = {
  'Base Colors': [
    {
      name: 'Background',
      cssVar: '--background',
      lightValue: 'oklch(0.9383 0.0042 236.4993)',
      darkValue: 'oklch(0.2598 0.0306 262.6666)',
      description: 'Main background color',
    },
    {
      name: 'Foreground',
      cssVar: '--foreground',
      lightValue: 'oklch(0.3211 0 0)',
      darkValue: 'oklch(0.9219 0 0)',
      description: 'Primary text color',
    },
    {
      name: 'Card',
      cssVar: '--card',
      lightValue: 'oklch(1.0000 0 0)',
      darkValue: 'oklch(0.3106 0.0301 268.6365)',
      description: 'Card background',
    },
    {
      name: 'Card Foreground',
      cssVar: '--card-foreground',
      lightValue: 'oklch(0.3211 0 0)',
      darkValue: 'oklch(0.9219 0 0)',
      description: 'Text on cards',
    },
    {
      name: 'Popover',
      cssVar: '--popover',
      lightValue: 'oklch(1.0000 0 0)',
      darkValue: 'oklch(0.2900 0.0249 268.3986)',
      description: 'Popover background',
    },
    {
      name: 'Popover Foreground',
      cssVar: '--popover-foreground',
      lightValue: 'oklch(0.3211 0 0)',
      darkValue: 'oklch(0.9219 0 0)',
      description: 'Text in popovers',
    },
  ],
  'Semantic Colors': [
    {
      name: 'Primary',
      cssVar: '--primary',
      lightValue: 'oklch(0.6397 0.1720 36.4421)',
      darkValue: 'oklch(0.6397 0.1720 36.4421)',
      description: 'Main brand color - Tangerine Orange',
    },
    {
      name: 'Primary Foreground',
      cssVar: '--primary-foreground',
      lightValue: 'oklch(1.0000 0 0)',
      darkValue: 'oklch(1.0000 0 0)',
      description: 'Text on primary color',
    },
    {
      name: 'Secondary',
      cssVar: '--secondary',
      lightValue: 'oklch(0.9670 0.0029 264.5419)',
      darkValue: 'oklch(0.3095 0.0266 266.7132)',
      description: 'Secondary color',
    },
    {
      name: 'Secondary Foreground',
      cssVar: '--secondary-foreground',
      lightValue: 'oklch(0.4461 0.0263 256.8018)',
      darkValue: 'oklch(0.9219 0 0)',
      description: 'Text on secondary',
    },
    {
      name: 'Muted',
      cssVar: '--muted',
      lightValue: 'oklch(0.9846 0.0017 247.8389)',
      darkValue: 'oklch(0.3095 0.0266 266.7132)',
      description: 'Muted background',
    },
    {
      name: 'Muted Foreground',
      cssVar: '--muted-foreground',
      lightValue: 'oklch(0.5510 0.0234 264.3637)',
      darkValue: 'oklch(0.7155 0 0)',
      description: 'Muted text',
    },
    {
      name: 'Accent',
      cssVar: '--accent',
      lightValue: 'oklch(0.9119 0.0222 243.8174)',
      darkValue: 'oklch(0.3380 0.0589 267.5867)',
      description: 'Accent color',
    },
    {
      name: 'Accent Foreground',
      cssVar: '--accent-foreground',
      lightValue: 'oklch(0.3791 0.1378 265.5222)',
      darkValue: 'oklch(0.8823 0.0571 254.1284)',
      description: 'Text on accent',
    },
    {
      name: 'Destructive',
      cssVar: '--destructive',
      lightValue: 'oklch(0.6368 0.2078 25.3313)',
      darkValue: 'oklch(0.6368 0.2078 25.3313)',
      description: 'Destructive/error color',
    },
    {
      name: 'Destructive Foreground',
      cssVar: '--destructive-foreground',
      lightValue: 'oklch(1.0000 0 0)',
      darkValue: 'oklch(1.0000 0 0)',
      description: 'Text on destructive',
    },
  ],
  'Interactive Elements': [
    {
      name: 'Border',
      cssVar: '--border',
      lightValue: 'oklch(0.9022 0.0052 247.8822)',
      darkValue: 'oklch(0.3843 0.0301 269.7337)',
      description: 'Border color',
    },
    {
      name: 'Input',
      cssVar: '--input',
      lightValue: 'oklch(0.9700 0.0029 264.5420)',
      darkValue: 'oklch(0.3843 0.0301 269.7337)',
      description: 'Input background',
    },
    {
      name: 'Ring',
      cssVar: '--ring',
      lightValue: 'oklch(0.6397 0.1720 36.4421)',
      darkValue: 'oklch(0.6397 0.1720 36.4421)',
      description: 'Focus ring color',
    },
  ],
  'Chart Colors': [
    {
      name: 'Chart 1',
      cssVar: '--chart-1',
      lightValue: 'oklch(0.7156 0.0605 248.6845)',
      darkValue: 'oklch(0.7156 0.0605 248.6845)',
      description: 'Chart color 1',
    },
    {
      name: 'Chart 2',
      cssVar: '--chart-2',
      lightValue: 'oklch(0.7875 0.0917 35.9616)',
      darkValue: 'oklch(0.7693 0.0876 34.1875)',
      description: 'Chart color 2',
    },
    {
      name: 'Chart 3',
      cssVar: '--chart-3',
      lightValue: 'oklch(0.5778 0.0759 254.1573)',
      darkValue: 'oklch(0.5778 0.0759 254.1573)',
      description: 'Chart color 3',
    },
    {
      name: 'Chart 4',
      cssVar: '--chart-4',
      lightValue: 'oklch(0.5016 0.0849 259.4902)',
      darkValue: 'oklch(0.5016 0.0849 259.4902)',
      description: 'Chart color 4',
    },
    {
      name: 'Chart 5',
      cssVar: '--chart-5',
      lightValue: 'oklch(0.4241 0.0952 264.0306)',
      darkValue: 'oklch(0.4241 0.0952 264.0306)',
      description: 'Chart color 5',
    },
  ],
  'Sidebar Colors': [
    {
      name: 'Sidebar',
      cssVar: '--sidebar',
      lightValue: 'oklch(0.9030 0.0046 258.3257)',
      darkValue: 'oklch(0.3100 0.0283 267.7408)',
      description: 'Sidebar background',
    },
    {
      name: 'Sidebar Foreground',
      cssVar: '--sidebar-foreground',
      lightValue: 'oklch(0.3211 0 0)',

      darkValue: 'oklch(0.9219 0 0)',
      description: 'Sidebar text',
    },
    {
      name: 'Sidebar Primary',
      cssVar: '--sidebar-primary',
      lightValue: 'oklch(0.6397 0.1720 36.4421)',
      darkValue: 'oklch(0.6397 0.1720 36.4421)',
      description: 'Sidebar primary',
    },
    {
      name: 'Sidebar Primary Foreground',
      cssVar: '--sidebar-primary-foreground',
      lightValue: 'oklch(1.0000 0 0)',
      darkValue: 'oklch(1.0000 0 0)',
      description: 'Text on sidebar primary',
    },
    {
      name: 'Sidebar Accent',
      cssVar: '--sidebar-accent',
      lightValue: 'oklch(0.9119 0.0222 243.8174)',
      darkValue: 'oklch(0.3380 0.0589 267.5867)',
      description: 'Sidebar accent',
    },
    {
      name: 'Sidebar Accent Foreground',
      cssVar: '--sidebar-accent-foreground',
      lightValue: 'oklch(0.3791 0.1378 265.5222)',
      darkValue: 'oklch(0.8823 0.0571 254.1284)',
      description: 'Text on sidebar accent',
    },
    {
      name: 'Sidebar Border',
      cssVar: '--sidebar-border',
      lightValue: 'oklch(0.9276 0.0058 264.5313)',
      darkValue: 'oklch(0.3843 0.0301 269.7337)',
      description: 'Sidebar border',
    },
    {
      name: 'Sidebar Ring',
      cssVar: '--sidebar-ring',
      lightValue: 'oklch(0.6397 0.1720 36.4421)',
      darkValue: 'oklch(0.6397 0.1720 36.4421)',
      description: 'Sidebar focus ring',
    },
  ],
}

function ColorCard({ color, currentTheme }: { color: ColorInfo; currentTheme: string }) {
  const [copied, setCopied] = useState(false)
  const currentValue = currentTheme === 'dark' ? color.darkValue : color.lightValue

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      }
  }

  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-3 hover:shadow-md transition-all duration-200">
      <div
        className="w-full h-20 rounded-md border border-border shadow-sm"
        style={{ backgroundColor: `var(${color.cssVar})` }}
      />

      <div className="space-y-2">
        <h3 className="font-medium text-card-foreground text-sm">{color.name}</h3>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground">
              {color.cssVar}
            </code>
            <Button
              className="h-6 w-6 p-0"
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(color.cssVar)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <code className="text-xs bg-muted px-2 py-1 rounded font-mono text-muted-foreground break-all">
              {currentValue}
            </code>
            <Button
              className="h-6 w-6 p-0"
              size="sm"
              variant="ghost"
              onClick={() => copyToClipboard(currentValue)}
            >
              {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            </Button>
          </div>
        </div>
        {color.description && <p className="text-xs text-muted-foreground">{color.description}</p>}
      </div>
    </div>
  )
}
