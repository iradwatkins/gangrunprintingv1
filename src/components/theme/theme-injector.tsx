'use client';

import { useEffect, useState } from 'react';

interface ThemeConfig {
  cssVariables: Record<string, string>;
  darkModeVariables?: Record<string, string>;
  customCSS?: string;
}

export function ThemeInjector() {
  const [theme, setTheme] = useState<ThemeConfig | null>(null);

  useEffect(() => {
    // Fetch active theme
    fetchActiveTheme();
  }, []);

  useEffect(() => {
    if (!theme) return;

    // Create style element
    const styleId = 'custom-theme-styles';
    let styleElement = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleElement) {
      styleElement = document.createElement('style');
      styleElement.id = styleId;
      document.head.appendChild(styleElement);
    }

    // Generate CSS
    let css = '';

    // Add :root variables
    if (theme.cssVariables && Object.keys(theme.cssVariables).length > 0) {
      css += ':root {\n';
      for (const [key, value] of Object.entries(theme.cssVariables)) {
        css += `  ${key}: ${value};\n`;
      }
      css += '}\n\n';
    }

    // Add .dark variables
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

    // Apply CSS
    styleElement.textContent = css;

    // Cleanup
    return () => {
      if (styleElement && styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, [theme]);

  const fetchActiveTheme = async () => {
    try {
      const response = await fetch('/api/themes/active');
      if (response.ok) {
        const data = await response.json();
        setTheme(data);
      }
    } catch (error) {
      console.error('Failed to fetch active theme:', error);
    }
  };

  return null;
}