'use client'

import * as React from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function ThemeToggle() : unknown {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <Button className="h-9 w-9" size="icon" variant="ghost">
        <Sun className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="h-9 w-9" size="icon" variant="ghost">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <Sun className="mr-2 h-4 w-4" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <Moon className="mr-2 h-4 w-4" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <Monitor className="mr-2 h-4 w-4" />
          <span>System</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function MobileThemeToggle() : unknown {
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm font-medium">Theme</span>
      <div className="flex gap-1">
        <Button
          className="h-8"
          size="sm"
          variant={theme === 'light' ? 'default' : 'ghost'}
          onClick={() => setTheme('light')}
        >
          <Sun className="h-4 w-4" />
        </Button>
        <Button
          className="h-8"
          size="sm"
          variant={theme === 'dark' ? 'default' : 'ghost'}
          onClick={() => setTheme('dark')}
        >
          <Moon className="h-4 w-4" />
        </Button>
        <Button
          className="h-8"
          size="sm"
          variant={theme === 'system' ? 'default' : 'ghost'}
          onClick={() => setTheme('system')}
        >
          <Monitor className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
