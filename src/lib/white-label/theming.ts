import { type TenantInfo } from '@/lib/tenants/resolver'

export interface ThemeConfig {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Typography
  primaryFont: string
  secondaryFont: string
  fontSize: string

  // Layout
  borderRadius: string
  spacing: string

  // Branding
  logoUrl?: string
  logoText?: string
  faviconUrl?: string

  // Custom CSS
  customCss?: string
  customJs?: string

  // Email branding
  emailHeaderLogo?: string
  emailFooterText?: string
  emailColors?: Record<string, string>
}

export interface CompiledTheme {
  cssVariables: Record<string, string>
  cssClasses: string
  customCss: string
  fonts: string[]
}

export class ThemeEngine {
  private static instance: ThemeEngine

  public static getInstance(): ThemeEngine {
    if (!ThemeEngine.instance) {
      ThemeEngine.instance = new ThemeEngine()
    }
    return ThemeEngine.instance
  }

  /**
   * Generate theme from tenant branding configuration
   */
  generateTheme(tenant: TenantInfo | null): CompiledTheme {
    const branding = tenant?.branding

    if (!branding) {
      return this.getDefaultTheme()
    }

    const config: ThemeConfig = {
      primaryColor: branding.primaryColor || '#3b82f6',
      secondaryColor: branding.secondaryColor || '#64748b',
      accentColor: branding.accentColor || '#f59e0b',
      backgroundColor: branding.backgroundColor || '#ffffff',
      textColor: branding.textColor || '#1f2937',
      primaryFont: branding.primaryFont || 'Inter',
      secondaryFont: branding.secondaryFont || 'Inter',
      fontSize: branding.fontSize || '16px',
      borderRadius: branding.borderRadius || '8px',
      spacing: branding.spacing || '16px',
      logoUrl: branding.logoUrl,
      logoText: branding.logoText,
      faviconUrl: branding.faviconUrl,
      customCss: branding.customCss,
      customJs: branding.customJs,
      emailHeaderLogo: branding.emailHeaderLogo,
      emailFooterText: branding.emailFooterText,
      emailColors: branding.emailColors,
    }

    return this.compileTheme(config)
  }

  /**
   * Compile theme configuration into CSS variables and classes
   */
  compileTheme(config: ThemeConfig): CompiledTheme {
    const cssVariables = this.generateCSSVariables(config)
    const cssClasses = this.generateCSSClasses(config)
    const fonts = this.extractFonts(config)

    return {
      cssVariables,
      cssClasses,
      customCss: config.customCss || '',
      fonts,
    }
  }

  /**
   * Generate CSS variables from theme config
   */
  private generateCSSVariables(config: ThemeConfig): Record<string, string> {
    const { h: primaryH, s: primaryS, l: primaryL } = this.hexToHsl(config.primaryColor)
    const { h: secondaryH, s: secondaryS, l: secondaryL } = this.hexToHsl(config.secondaryColor)
    const { h: accentH, s: accentS, l: accentL } = this.hexToHsl(config.accentColor)
    const { h: bgH, s: bgS, l: bgL } = this.hexToHsl(config.backgroundColor)
    const { h: textH, s: textS, l: textL } = this.hexToHsl(config.textColor)

    return {
      // Primary color scale
      '--primary': `${primaryH} ${primaryS}% ${primaryL}%`,
      '--primary-foreground': this.getContrastColor(config.primaryColor),
      '--primary-50': `${primaryH} ${primaryS}% ${Math.min(95, primaryL + 40)}%`,
      '--primary-100': `${primaryH} ${primaryS}% ${Math.min(90, primaryL + 30)}%`,
      '--primary-500': `${primaryH} ${primaryS}% ${primaryL}%`,
      '--primary-600': `${primaryH} ${primaryS}% ${Math.max(10, primaryL - 10)}%`,
      '--primary-700': `${primaryH} ${primaryS}% ${Math.max(5, primaryL - 20)}%`,

      // Secondary color scale
      '--secondary': `${secondaryH} ${secondaryS}% ${secondaryL}%`,
      '--secondary-foreground': this.getContrastColor(config.secondaryColor),

      // Accent color scale
      '--accent': `${accentH} ${accentS}% ${accentL}%`,
      '--accent-foreground': this.getContrastColor(config.accentColor),

      // Background and text
      '--background': `${bgH} ${bgS}% ${bgL}%`,
      '--foreground': `${textH} ${textS}% ${textL}%`,

      // Derived colors
      '--muted': `${bgH} ${Math.max(5, bgS - 5)}% ${Math.max(90, bgL - 5)}%`,
      '--muted-foreground': `${textH} ${textS}% ${Math.min(70, textL + 20)}%`,
      '--card': `${bgH} ${bgS}% ${bgL}%`,
      '--card-foreground': `${textH} ${textS}% ${textL}%`,
      '--popover': `${bgH} ${bgS}% ${bgL}%`,
      '--popover-foreground': `${textH} ${textS}% ${textL}%`,
      '--border': `${bgH} ${Math.max(10, bgS)}% ${Math.max(80, bgL - 10)}%`,
      '--input': `${bgH} ${Math.max(10, bgS)}% ${Math.max(80, bgL - 10)}%`,
      '--ring': `${primaryH} ${primaryS}% ${primaryL}%`,

      // Typography
      '--font-primary': config.primaryFont,
      '--font-secondary': config.secondaryFont,
      '--font-size-base': config.fontSize,

      // Layout
      '--radius': config.borderRadius,
      '--spacing': config.spacing,

      // Status colors (maintaining accessibility)
      '--destructive': '0 84% 60%',
      '--destructive-foreground': '0 0% 98%',
      '--success': '142 76% 36%',
      '--success-foreground': '0 0% 98%',
      '--warning': '38 92% 50%',
      '--warning-foreground': '0 0% 9%',
    }
  }

  /**
   * Generate CSS classes for component overrides
   */
  private generateCSSClasses(_config: ThemeConfig): string {
    return `
      .theme-primary-bg {
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
      }

      .theme-secondary-bg {
        background-color: hsl(var(--secondary));
        color: hsl(var(--secondary-foreground));
      }

      .theme-accent-bg {
        background-color: hsl(var(--accent));
        color: hsl(var(--accent-foreground));
      }

      .theme-primary-text {
        color: hsl(var(--primary));
      }

      .theme-secondary-text {
        color: hsl(var(--secondary));
      }

      .theme-accent-text {
        color: hsl(var(--accent));
      }

      .theme-primary-border {
        border-color: hsl(var(--primary));
      }

      .theme-font-primary {
        font-family: var(--font-primary), system-ui, sans-serif;
      }

      .theme-font-secondary {
        font-family: var(--font-secondary), system-ui, sans-serif;
      }

      .theme-spacing {
        padding: var(--spacing);
      }

      .theme-radius {
        border-radius: var(--radius);
      }

      /* Button overrides */
      .btn-theme-primary {
        background-color: hsl(var(--primary));
        color: hsl(var(--primary-foreground));
        border-color: hsl(var(--primary));
      }

      .btn-theme-primary:hover {
        background-color: hsl(var(--primary-600));
        border-color: hsl(var(--primary-600));
      }

      /* Card overrides */
      .card-theme {
        background-color: hsl(var(--card));
        color: hsl(var(--card-foreground));
        border-color: hsl(var(--border));
        border-radius: var(--radius);
      }

      /* Input overrides */
      .input-theme {
        background-color: hsl(var(--background));
        color: hsl(var(--foreground));
        border-color: hsl(var(--border));
        border-radius: var(--radius);
      }

      .input-theme:focus {
        border-color: hsl(var(--ring));
        box-shadow: 0 0 0 2px hsl(var(--ring) / 0.2);
      }
    `
  }

  /**
   * Extract required fonts from configuration
   */
  private extractFonts(config: ThemeConfig): string[] {
    const fonts = new Set<string>()

    if (config.primaryFont && config.primaryFont !== 'system-ui') {
      fonts.add(config.primaryFont)
    }

    if (
      config.secondaryFont &&
      config.secondaryFont !== 'system-ui' &&
      config.secondaryFont !== config.primaryFont
    ) {
      fonts.add(config.secondaryFont)
    }

    return Array.from(fonts)
  }

  /**
   * Convert hex color to HSL
   */
  private hexToHsl(hex: string): { h: number; s: number; l: number } {
    // Remove # if present
    hex = hex.replace('#', '')

    // Convert to RGB
    const r = parseInt(hex.substr(0, 2), 16) / 255
    const g = parseInt(hex.substr(2, 2), 16) / 255
    const b = parseInt(hex.substr(4, 2), 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h = 0
    let s = 0
    const l = (max + min) / 2

    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
      }
      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    }
  }

  /**
   * Get contrasting color (black or white) for readability
   */
  private getContrastColor(hex: string): string {
    const { l } = this.hexToHsl(hex)
    return l > 50 ? '0 0% 9%' : '0 0% 98%'
  }

  /**
   * Get default theme for fallback
   */
  private getDefaultTheme(): CompiledTheme {
    const defaultConfig: ThemeConfig = {
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
      fontSize: '16px',
      borderRadius: '8px',
      spacing: '16px',
    }

    return this.compileTheme(defaultConfig)
  }

  /**
   * Validate theme configuration
   */
  validateTheme(config: ThemeConfig): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    // Validate colors
    const colorFields = [
      'primaryColor',
      'secondaryColor',
      'accentColor',
      'backgroundColor',
      'textColor',
    ]
    for (const field of colorFields) {
      const color = config[field as keyof ThemeConfig] as string
      if (!this.isValidHexColor(color)) {
        errors.push(`Invalid color format for ${field}: ${color}`)
      }
    }

    // Validate fonts
    if (!config.primaryFont) {
      errors.push('Primary font is required')
    }

    // Validate numeric values
    if (!this.isValidCSSSize(config.fontSize)) {
      errors.push(`Invalid font size: ${config.fontSize}`)
    }

    if (!this.isValidCSSSize(config.borderRadius)) {
      errors.push(`Invalid border radius: ${config.borderRadius}`)
    }

    if (!this.isValidCSSSize(config.spacing)) {
      errors.push(`Invalid spacing: ${config.spacing}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
    }
  }

  /**
   * Check if a string is a valid hex color
   */
  private isValidHexColor(color: string): boolean {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  }

  /**
   * Check if a string is a valid CSS size value
   */
  private isValidCSSSize(size: string): boolean {
    return /^\d+(\.\d+)?(px|em|rem|%|vw|vh)$/.test(size)
  }

  /**
   * Generate CSS for email templates
   */
  generateEmailCSS(config: ThemeConfig): string {
    const emailColors = config.emailColors || {}

    return `
      <style>
        .email-container {
          font-family: ${config.primaryFont}, Arial, sans-serif;
          font-size: ${config.fontSize};
          color: ${config.textColor};
          background-color: ${config.backgroundColor};
        }

        .email-header {
          background-color: ${emailColors.header || config.primaryColor};
          color: ${emailColors.headerText || this.getContrastColor(config.primaryColor)};
          padding: ${config.spacing};
        }

        .email-content {
          padding: ${config.spacing};
        }

        .email-footer {
          background-color: ${emailColors.footer || config.secondaryColor};
          color: ${emailColors.footerText || this.getContrastColor(config.secondaryColor)};
          padding: ${config.spacing};
          font-size: 14px;
        }

        .email-button {
          background-color: ${config.accentColor};
          color: ${this.getContrastColor(config.accentColor)};
          padding: 12px 24px;
          border-radius: ${config.borderRadius};
          text-decoration: none;
          display: inline-block;
          font-weight: bold;
        }

        .email-logo {
          max-height: 60px;
          width: auto;
        }
      </style>
    `
  }
}
