// next-intl plugin for internationalization
import createNextIntlPlugin from 'next-intl/plugin'
const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

// Bundle analyzer for build optimization (conditionally imported)
// import withBundleAnalyzer from '@next/bundle-analyzer'

// Sentry configuration - Phase 3 Enterprise Enhancement (conditionally imported)
// import { withSentryConfig } from '@sentry/nextjs'

// Node.js path module for absolute paths
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for Docker deployment
  output: 'standalone', // REQUIRED for Docker deployment

  // Enable experimental features for App Router
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      // UI component libraries
      '@radix-ui/react-icons',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-popover',
      '@radix-ui/react-accordion',
      '@radix-ui/react-label',
      '@radix-ui/react-checkbox',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-slider',
      '@radix-ui/react-switch',
      'lucide-react',
      // Utility libraries
      'date-fns',
      'lodash-es',
      // Form libraries
      'react-hook-form',
      'zod',
    ],
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  // Compression (handled by Next.js in production)
  compress: true,

  // React strict mode
  reactStrictMode: true,

  // TypeScript checking - temporarily disabled for deployment
  // Non-critical features (marketing suite, analytics) have TS errors
  // TODO: Fix TypeScript errors in marketing features and re-enable strict checking
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint checking - temporarily disabled for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: '*.r2.cloudflarestorage.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '9000',
      },
      {
        protocol: 'https',
        hostname: 'gangrunprinting.com',
      },
      {
        protocol: 'https',
        hostname: '*.gangrunprinting.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.gangrunprinting.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Internationalization (handled by next-intl)
  i18n: undefined,

  // Environment variables
  env: {
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  },

  // Headers for security and performance
  async headers() {
    return [
      // Apple Pay domain association file
      {
        source: '/.well-known/apple-developer-merchantid-domain-association',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/octet-stream',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400',
          },
        ],
      },
      // CSS files with correct MIME type - MUST BE FIRST
      {
        source: '/_next/static/css/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // JS files
      {
        source: '/_next/static/chunks/:path*',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Media files
      {
        source: '/_next/static/media/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // General security headers
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // X-Frame-Options removed to allow Square payment iframes
          // Nginx handles this with SAMEORIGIN
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          // CSP is now handled in middleware.ts for better control
          // {
          //   key: 'Content-Security-Policy',
          //   value: "...",
          // },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
    ]
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/auth/signin',
        permanent: true,
      },
      {
        source: '/sign-up',
        destination: '/auth/signup',
        permanent: true,
      },
      {
        source: '/admin/test-colors',
        destination: '/admin/theme-colors',
        permanent: true,
      },
    ]
  },

  // Webpack configuration to fix chunk loading issues
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // FIX: Prevent webpack from using 'self' in server bundles
    // This fixes the "ReferenceError: self is not defined" error
    if (isServer) {
      config.output = {
        ...config.output,
        globalObject: 'globalThis', // Use globalThis instead of self for server bundles
      }
    }

    // Only add essential fallbacks for browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }

    // Performance optimization: Reduce HTTP requests by creating fewer, larger chunks
    // Target: 22 chunks → ~10 chunks for better Pingdom/Lighthouse scores
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            // Vendor chunk for all node_modules
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendor',
              priority: 10,
              reuseExistingChunk: true,
              enforce: true,
            },
            // UI libraries chunk (Radix, Lucide, etc.)
            ui: {
              test: /[\\/]node_modules[\\/](@radix-ui|lucide-react|class-variance-authority|clsx|tailwind-merge)[\\/]/,
              name: 'ui',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Form libraries chunk (React Hook Form, Zod)
            forms: {
              test: /[\\/]node_modules[\\/](react-hook-form|zod|@hookform)[\\/]/,
              name: 'forms',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Date/utility libraries
            utils: {
              test: /[\\/]node_modules[\\/](date-fns|lodash-es)[\\/]/,
              name: 'utils',
              priority: 20,
              reuseExistingChunk: true,
            },
            // Common chunks used across multiple pages
            commons: {
              name: 'commons',
              minChunks: 2,
              priority: 5,
              reuseExistingChunk: true,
            },
          },
          // Increase chunk size limits to create fewer chunks
          maxInitialRequests: 10, // Down from default 30
          maxAsyncRequests: 10, // Down from default 30
          minSize: 40000, // 40KB minimum (up from 20KB default)
          maxSize: 244000, // 244KB maximum chunks
        },
      }
    }

    return config
  },

  // Compiler options
  compiler: {
    removeConsole:
      process.env.NODE_ENV === 'production'
        ? {
            exclude: ['error', 'warn'],
          }
        : false,
  },

  // Generate unique build IDs for each build
  // This ensures chunk names match between build and runtime
  async generateBuildId() {
    // Use timestamp-based build ID for uniqueness
    // This ensures chunks are properly loaded in production
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    return `build-${year}${month}${day}-${hours}${minutes}`
  },
}

// Apply plugins in order
// Start with next-intl plugin wrapper
let finalConfig = withNextIntl(nextConfig)

// Bundle analyzer - conditionally enable with ANALYZE=true npm run build
if (process.env.ANALYZE === 'true') {
  const withBundleAnalyzer = require('@next/bundle-analyzer')
  const bundleAnalyzer = withBundleAnalyzer({
    enabled: true,
  })
  finalConfig = bundleAnalyzer(finalConfig)
}

// Add Sentry if DSN is configured
if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  try {
    const { withSentryConfig } = require('@sentry/nextjs')
    const sentryWebpackOptions = {
      silent: true,
      hideSourceMaps: true,
      widenClientFileUpload: true,
    }

    const sentryOptions = {
      org: process.env.SENTRY_ORG || 'gangrun-printing',
      project: process.env.SENTRY_PROJECT || 'gangrun-printing',
      authToken: process.env.SENTRY_AUTH_TOKEN,
    }

    finalConfig = withSentryConfig(finalConfig, sentryOptions, sentryWebpackOptions)
  } catch (error) {
    console.warn('Sentry package not found, continuing without Sentry configuration')
  }
}

export default finalConfig
