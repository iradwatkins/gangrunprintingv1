import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';

export interface ThemeConfig {
  id?: string;
  name: string;
  description?: string;
  cssVariables: Record<string, string>;
  darkModeVariables?: Record<string, string>;
  customCSS?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class ThemeManager {
  private static instance: ThemeManager;
  private themesDir = path.join(process.cwd(), 'public', 'themes');

  private constructor() {}

  static getInstance(): ThemeManager {
    if (!ThemeManager.instance) {
      ThemeManager.instance = new ThemeManager();
    }
    return ThemeManager.instance;
  }

  /**
   * Parse CSS file and extract CSS variables
   */
  async parseCSSFile(cssContent: string): Promise<{
    lightVariables: Record<string, string>;
    darkVariables: Record<string, string>;
    customCSS: string;
  }> {
    const lightVariables: Record<string, string> = {};
    const darkVariables: Record<string, string> = {};
    let customCSS = '';

    // Extract :root variables (light mode)
    const rootMatch = cssContent.match(/:root\s*{([^}]*)}/);
    if (rootMatch) {
      const variables = this.extractCSSVariables(rootMatch[1]);
      Object.assign(lightVariables, variables);
    }

    // Extract .dark variables (dark mode)
    const darkMatch = cssContent.match(/\.dark\s*{([^}]*)}/);
    if (darkMatch) {
      const variables = this.extractCSSVariables(darkMatch[1]);
      Object.assign(darkVariables, variables);
    }

    // Extract custom CSS (everything except variable definitions)
    customCSS = cssContent
      .replace(/:root\s*{[^}]*}/g, '')
      .replace(/\.dark\s*{[^}]*}/g, '')
      .replace(/@theme[^}]*}/g, '')
      .trim();

    return {
      lightVariables,
      darkVariables,
      customCSS
    };
  }

  /**
   * Extract CSS variables from a CSS block
   */
  private extractCSSVariables(cssBlock: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const lines = cssBlock.split(';');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) {
        const [key, ...valueParts] = trimmed.split(':');
        const value = valueParts.join(':').trim();
        if (key && value) {
          variables[key.trim()] = value;
        }
      }
    }

    return variables;
  }

  /**
   * Generate CSS from theme configuration
   */
  generateCSS(theme: ThemeConfig): string {
    let css = '';

    // Generate :root variables
    if (theme.cssVariables && Object.keys(theme.cssVariables).length > 0) {
      css += ':root {\n';
      for (const [key, value] of Object.entries(theme.cssVariables)) {
        css += `  ${key}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Generate .dark variables
    if (theme.darkModeVariables && Object.keys(theme.darkModeVariables).length > 0) {
      css += '.dark {\n';
      for (const [key, value] of Object.entries(theme.darkModeVariables)) {
        css += `  ${key}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Add custom CSS
    if (theme.customCSS) {
      css += theme.customCSS;
    }

    return css;
  }

  /**
   * Save theme to database
   */
  async saveTheme(theme: ThemeConfig): Promise<ThemeConfig> {
    const data = {
      name: theme.name,
      description: theme.description || '',
      cssVariables: theme.cssVariables,
      darkModeVariables: theme.darkModeVariables || {},
      customCSS: theme.customCSS || '',
      isActive: theme.isActive
    };

    if (theme.id) {
      // Update existing theme
      const updated = await prisma.customTheme.update({
        where: { id: theme.id },
        data
      });
      return this.mapPrismaThemeToConfig(updated);
    } else {
      // Create new theme
      const created = await prisma.customTheme.create({
        data
      });
      return this.mapPrismaThemeToConfig(created);
    }
  }

  /**
   * Get all themes from database
   */
  async getThemes(): Promise<ThemeConfig[]> {
    const themes = await prisma.customTheme.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return themes.map(this.mapPrismaThemeToConfig);
  }

  /**
   * Get active theme
   */
  async getActiveTheme(): Promise<ThemeConfig | null> {
    const theme = await prisma.customTheme.findFirst({
      where: { isActive: true }
    });
    return theme ? this.mapPrismaThemeToConfig(theme) : null;
  }

  /**
   * Set active theme
   */
  async setActiveTheme(themeId: string): Promise<void> {
    // Deactivate all themes
    await prisma.customTheme.updateMany({
      data: { isActive: false }
    });

    // Activate selected theme
    await prisma.customTheme.update({
      where: { id: themeId },
      data: { isActive: true }
    });

    // Generate and save CSS file
    const theme = await prisma.customTheme.findUnique({
      where: { id: themeId }
    });

    if (theme) {
      const config = this.mapPrismaThemeToConfig(theme);
      await this.saveThemeCSS(config);
    }
  }

  /**
   * Save theme CSS to file system
   */
  async saveThemeCSS(theme: ThemeConfig): Promise<void> {
    try {
      // Ensure themes directory exists
      await fs.mkdir(this.themesDir, { recursive: true });

      // Generate CSS
      const css = this.generateCSS(theme);

      // Save to file
      const filePath = path.join(this.themesDir, 'custom-theme.css');
      await fs.writeFile(filePath, css, 'utf-8');
    } catch (error) {
      console.error('Error saving theme CSS:', error);
      throw error;
    }
  }

  /**
   * Delete theme
   */
  async deleteTheme(themeId: string): Promise<void> {
    await prisma.customTheme.delete({
      where: { id: themeId }
    });
  }

  /**
   * Apply theme from uploaded CSS file
   */
  async applyThemeFromCSS(
    cssContent: string,
    name: string,
    description?: string
  ): Promise<ThemeConfig> {
    // Parse CSS file
    const { lightVariables, darkVariables, customCSS } = await this.parseCSSFile(cssContent);

    // Create theme configuration
    const theme: ThemeConfig = {
      name,
      description,
      cssVariables: lightVariables,
      darkModeVariables: darkVariables,
      customCSS,
      isActive: false
    };

    // Save to database
    const saved = await this.saveTheme(theme);

    // If requested to be active, activate it
    if (saved.id) {
      await this.setActiveTheme(saved.id);
    }

    return saved;
  }

  /**
   * Map Prisma theme to ThemeConfig
   */
  private mapPrismaThemeToConfig(theme: any): ThemeConfig {
    return {
      id: theme.id,
      name: theme.name,
      description: theme.description,
      cssVariables: theme.cssVariables as Record<string, string>,
      darkModeVariables: theme.darkModeVariables as Record<string, string>,
      customCSS: theme.customCSS,
      isActive: theme.isActive,
      createdAt: theme.createdAt,
      updatedAt: theme.updatedAt
    };
  }

  /**
   * Update globals.css with theme variables for immediate effect
   */
  async updateGlobalCSS(theme: ThemeConfig): Promise<void> {
    try {
      const globalsPath = path.join(process.cwd(), 'src', 'app', 'globals.css');

      // Read current globals.css
      let cssContent = await fs.readFile(globalsPath, 'utf-8');

      // Generate new CSS variables
      const newCSS = this.generateCSS(theme);

      // Replace :root and .dark blocks with new theme
      cssContent = cssContent.replace(
        /:root\s*{[^}]*}/g,
        newCSS.match(/:root\s*{[^}]*/)?.[0] + '}'
      );

      if (theme.darkModeVariables && Object.keys(theme.darkModeVariables).length > 0) {
        cssContent = cssContent.replace(
          /\.dark\s*{[^}]*}/g,
          newCSS.match(/\.dark\s*{[^}]*/)?.[0] + '}'
        );
      }

      // Add custom CSS if it doesn't exist
      if (theme.customCSS && !cssContent.includes(theme.customCSS)) {
        cssContent += '\n\n' + theme.customCSS;
      }

      // Write updated globals.css
      await fs.writeFile(globalsPath, cssContent, 'utf-8');

      console.log('Updated globals.css with new theme:', theme.name);
    } catch (error) {
      console.error('Error updating globals.css:', error);
      throw error;
    }
  }

  /**
   * Get default theme configuration
   */
  getDefaultTheme(): ThemeConfig {
    return {
      name: 'Default Theme',
      description: 'The default GangRun Printing theme',
      cssVariables: {
        '--background': 'oklch(0.9383 0.0042 236.4993)',
        '--foreground': 'oklch(0.3211 0 0)',
        '--card': 'oklch(1.0000 0 0)',
        '--card-foreground': 'oklch(0.3211 0 0)',
        '--primary': 'oklch(0.6397 0.1720 36.4421)',
        '--primary-foreground': 'oklch(1.0000 0 0)',
        '--secondary': 'oklch(0.9670 0.0029 264.5419)',
        '--secondary-foreground': 'oklch(0.4461 0.0263 256.8018)',
        '--muted': 'oklch(0.9846 0.0017 247.8389)',
        '--muted-foreground': 'oklch(0.5510 0.0234 264.3637)',
        '--accent': 'oklch(0.9119 0.0222 243.8174)',
        '--accent-foreground': 'oklch(0.3791 0.1378 265.5222)',
        '--destructive': 'oklch(0.6368 0.2078 25.3313)',
        '--destructive-foreground': 'oklch(1.0000 0 0)',
        '--border': 'oklch(0.9022 0.0052 247.8822)',
        '--input': 'oklch(0.9700 0.0029 264.5420)',
        '--ring': 'oklch(0.6397 0.1720 36.4421)',
        '--radius': '0.75rem'
      },
      darkModeVariables: {
        '--background': 'oklch(0.2598 0.0306 262.6666)',
        '--foreground': 'oklch(0.9219 0 0)',
        '--card': 'oklch(0.3106 0.0301 268.6365)',
        '--card-foreground': 'oklch(0.9219 0 0)',
        '--primary': 'oklch(0.6397 0.1720 36.4421)',
        '--primary-foreground': 'oklch(1.0000 0 0)',
        '--secondary': 'oklch(0.3095 0.0266 266.7132)',
        '--secondary-foreground': 'oklch(0.9219 0 0)',
        '--muted': 'oklch(0.3095 0.0266 266.7132)',
        '--muted-foreground': 'oklch(0.7155 0 0)',
        '--accent': 'oklch(0.3380 0.0589 267.5867)',
        '--accent-foreground': 'oklch(0.8823 0.0571 254.1284)',
        '--destructive': 'oklch(0.6368 0.2078 25.3313)',
        '--destructive-foreground': 'oklch(1.0000 0 0)',
        '--border': 'oklch(0.3843 0.0301 269.7337)',
        '--input': 'oklch(0.3843 0.0301 269.7337)',
        '--ring': 'oklch(0.6397 0.1720 36.4421)'
      },
      isActive: true
    };
  }
}

export const themeManager = ThemeManager.getInstance();