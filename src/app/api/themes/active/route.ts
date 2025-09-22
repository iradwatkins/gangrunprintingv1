import { NextResponse } from 'next/server'
import { themeManager } from '@/lib/theme-manager'

export async function GET() {
  try {
    const activeTheme = await themeManager.getActiveTheme()

    if (!activeTheme) {
      // Return default theme if no active theme
      return NextResponse.json(themeManager.getDefaultTheme())
    }

    return NextResponse.json(activeTheme)
  } catch (error) {
    // Return default theme on error
    return NextResponse.json(themeManager.getDefaultTheme())
  }
}
