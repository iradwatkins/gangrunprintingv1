export interface ThemeData {
  name: string;
  description?: string;
  cssContent: string;
  variables: Record<string, string>;
  darkVariables?: Record<string, string>;
  metadata?: {
    source: string;
    author?: string;
    version?: string;
    tags?: string[];
  };
}

export interface TweakCNTheme {
  id: string;
  name: string;
  description?: string;
  author?: string;
  css: string;
  variables: Record<string, string>;
  darkVariables?: Record<string, string>;
}

export class ThemeImporter {
  private static readonly TIMEOUT = 10000; // 10 seconds
  private static readonly MAX_SIZE = 1024 * 1024; // 1MB

  /**
   * Import theme from URL
   */
  async importFromURL(url: string): Promise<ThemeData> {
    try {
      // Determine import strategy based on URL
      if (this.isTweakCNURL(url)) {
        return await this.importFromTweakCN(url);
      } else if (this.isShadcnURL(url)) {
        return await this.importFromShadcn(url);
      } else {
        return await this.importFromGenericURL(url);
      }
    } catch (error) {
      console.error('Theme import error:', error);
      throw new Error(`Failed to import theme from URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check if URL is from tweakcn.com
   */
  private isTweakCNURL(url: string): boolean {
    return url.includes('tweakcn.com');
  }

  /**
   * Check if URL is from shadcn
   */
  private isShadcnURL(url: string): boolean {
    return url.includes('ui.shadcn.com') || url.includes('shadcn');
  }

  /**
   * Import theme from tweakcn.com
   */
  private async importFromTweakCN(url: string): Promise<ThemeData> {
    try {
      // Extract theme ID from URL
      const themeId = this.extractTweakCNThemeId(url);
      if (!themeId) {
        throw new Error('Invalid TweakCN URL: Could not extract theme ID');
      }

      // Fetch theme data from TweakCN API
      const apiUrl = `https://tweakcn.com/api/themes/${themeId}`;
      const response = await this.fetchWithTimeout(apiUrl);

      if (!response.ok) {
        throw new Error(`TweakCN API error: ${response.status} ${response.statusText}`);
      }

      const themeData: TweakCNTheme = await response.json();

      // Convert to our format
      return {
        name: themeData.name || 'TweakCN Theme',
        description: themeData.description,
        cssContent: themeData.css,
        variables: themeData.variables,
        darkVariables: themeData.darkVariables,
        metadata: {
          source: 'tweakcn.com',
          author: themeData.author,
          version: '1.0.0'
        }
      };

    } catch (error) {
      // Fallback to scraping if API fails
      console.warn('TweakCN API failed, attempting to scrape:', error);
      return await this.scrapeTweakCNTheme(url);
    }
  }

  /**
   * Extract theme ID from TweakCN URL
   */
  private extractTweakCNThemeId(url: string): string | null {
    // Handle different TweakCN URL formats
    const patterns = [
      /tweakcn\.com\/r\/themes\/([a-zA-Z0-9]+)/,
      /tweakcn\.com\/themes\/([a-zA-Z0-9]+)/,
      /tweakcn\.com\/theme\/([a-zA-Z0-9]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) {
        return match[1];
      }
    }

    return null;
  }

  /**
   * Scrape theme from TweakCN page
   */
  private async scrapeTweakCNTheme(url: string): Promise<ThemeData> {
    const response = await this.fetchWithTimeout(url);
    const html = await response.text();

    // Extract theme data from HTML
    const name = this.extractFromHTML(html, /<title>([^<]+)<\/title>/) || 'TweakCN Theme';
    const cssContent = this.extractCSSFromHTML(html);

    if (!cssContent) {
      throw new Error('Could not extract CSS from TweakCN page');
    }

    return {
      name: name.replace(' - TweakCN', '').trim(),
      description: 'Imported from TweakCN',
      cssContent,
      variables: this.extractVariablesFromCSS(cssContent),
      metadata: {
        source: 'tweakcn.com',
        version: '1.0.0'
      }
    };
  }

  /**
   * Import theme from shadcn
   */
  private async importFromShadcn(url: string): Promise<ThemeData> {
    const response = await this.fetchWithTimeout(url);
    const data = await response.text();

    // Try to parse as JSON first (if it's an API endpoint)
    try {
      const jsonData = JSON.parse(data);
      return {
        name: jsonData.name || 'Shadcn Theme',
        description: jsonData.description,
        cssContent: jsonData.css || this.generateCSSFromVariables(jsonData.cssVars || {}),
        variables: jsonData.cssVars || {},
        metadata: {
          source: 'shadcn',
          version: '1.0.0'
        }
      };
    } catch {
      // Parse as HTML/CSS
      return this.parseGenericTheme(data, url);
    }
  }

  /**
   * Import theme from generic URL
   */
  private async importFromGenericURL(url: string): Promise<ThemeData> {
    const response = await this.fetchWithTimeout(url);
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      const data = await response.json();
      return this.parseJSONTheme(data, url);
    } else if (contentType.includes('text/css')) {
      const cssContent = await response.text();
      return this.parseCSSTheme(cssContent, url);
    } else {
      const content = await response.text();
      return this.parseGenericTheme(content, url);
    }
  }

  /**
   * Parse JSON theme data
   */
  private parseJSONTheme(data: any, url: string): ThemeData {
    return {
      name: data.name || data.title || 'Imported Theme',
      description: data.description,
      cssContent: data.css || this.generateCSSFromVariables(data.variables || data.cssVars || {}),
      variables: data.variables || data.cssVars || {},
      darkVariables: data.darkVariables || data.darkCssVars,
      metadata: {
        source: new URL(url).hostname,
        author: data.author,
        version: data.version || '1.0.0'
      }
    };
  }

  /**
   * Parse CSS theme
   */
  private parseCSSTheme(cssContent: string, url: string): ThemeData {
    const variables = this.extractVariablesFromCSS(cssContent);

    return {
      name: 'CSS Theme',
      description: 'Imported from CSS file',
      cssContent,
      variables,
      metadata: {
        source: new URL(url).hostname,
        version: '1.0.0'
      }
    };
  }

  /**
   * Parse generic theme content
   */
  private parseGenericTheme(content: string, url: string): ThemeData {
    // Try to extract CSS from HTML or other content
    let cssContent = this.extractCSSFromHTML(content);

    if (!cssContent) {
      // If no CSS found, treat entire content as CSS
      cssContent = content;
    }

    const variables = this.extractVariablesFromCSS(cssContent);

    return {
      name: 'Imported Theme',
      description: 'Imported from external source',
      cssContent,
      variables,
      metadata: {
        source: new URL(url).hostname,
        version: '1.0.0'
      }
    };
  }

  /**
   * Extract CSS variables from CSS content
   */
  private extractVariablesFromCSS(cssContent: string): Record<string, string> {
    const variables: Record<string, string> = {};

    // Extract from :root blocks
    const rootMatches = cssContent.match(/:root\s*{([^}]*)}/g);
    if (rootMatches) {
      for (const match of rootMatches) {
        const blockContent = match.match(/{([^}]*)}/)?.[1] || '';
        Object.assign(variables, this.parseVariableBlock(blockContent));
      }
    }

    return variables;
  }

  /**
   * Parse CSS variable block
   */
  private parseVariableBlock(block: string): Record<string, string> {
    const variables: Record<string, string> = {};
    const lines = block.split(';');

    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('--')) {
        const colonIndex = trimmed.indexOf(':');
        if (colonIndex > 0) {
          const key = trimmed.substring(0, colonIndex).trim();
          const value = trimmed.substring(colonIndex + 1).trim();
          if (key && value) {
            variables[key] = value;
          }
        }
      }
    }

    return variables;
  }

  /**
   * Extract CSS from HTML content
   */
  private extractCSSFromHTML(html: string): string {
    // Extract from <style> tags
    const styleMatches = html.match(/<style[^>]*>([\s\S]*?)<\/style>/gi);
    if (styleMatches) {
      return styleMatches.map(match =>
        match.replace(/<\/?style[^>]*>/gi, '')
      ).join('\n');
    }

    // Look for CSS variables in script tags (for dynamic themes)
    const scriptMatches = html.match(/<script[^>]*>([\s\S]*?)<\/script>/gi);
    if (scriptMatches) {
      for (const script of scriptMatches) {
        const cssVarMatch = script.match(/cssVars?\s*[:=]\s*({[\s\S]*?})/);
        if (cssVarMatch) {
          try {
            const vars = JSON.parse(cssVarMatch[1]);
            return this.generateCSSFromVariables(vars);
          } catch {
            // Continue if JSON parsing fails
          }
        }
      }
    }

    return '';
  }

  /**
   * Generate CSS from variables object
   */
  private generateCSSFromVariables(variables: Record<string, string>): string {
    let css = ':root {\n';
    for (const [key, value] of Object.entries(variables)) {
      const varName = key.startsWith('--') ? key : `--${key}`;
      css += `  ${varName}: ${value};\n`;
    }
    css += '}\n';
    return css;
  }

  /**
   * Extract text from HTML using regex
   */
  private extractFromHTML(html: string, pattern: RegExp): string | null {
    const match = html.match(pattern);
    return match ? match[1].trim() : null;
  }

  /**
   * Fetch with timeout and size limits
   */
  private async fetchWithTimeout(url: string): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ThemeImporter.TIMEOUT);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'GangRun-ThemeImporter/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml,text/css,application/json;q=0.9,*/*;q=0.8'
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Check content size
      const contentLength = response.headers.get('content-length');
      if (contentLength && parseInt(contentLength) > ThemeImporter.MAX_SIZE) {
        throw new Error('Content too large');
      }

      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  /**
   * Convert hex colors to OKLCH
   */
  private convertToOKLCH(color: string): string {
    // This is a simplified conversion - in a real implementation,
    // you'd want to use a proper color conversion library
    if (color.startsWith('#')) {
      // For now, return as-is and let the theme manager handle conversion
      return color;
    }
    return color;
  }
}