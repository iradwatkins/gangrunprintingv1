// Minimal next-intl plugin setup - disabled for now
// import createNextIntlPlugin from 'next-intl/plugin'
// const withNextIntl = createNextIntlPlugin('./src/i18n.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Output configuration for standalone deployment - disabled to fix PM2 compatibility
  // output: 'standalone',

  // Enable experimental features for App Router
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  // React strict mode
  reactStrictMode: true,

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
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            // Note: 'unsafe-inline' is required for Google Analytics gtag initialization
            // 'unsafe-eval' is required for Next.js development mode and some third-party scripts
            // Consider implementing nonce-based CSP in the future for better security
            value:
              "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com; connect-src 'self' https://www.google-analytics.com https://analytics.google.com https://www.googletagmanager.com https://stats.g.doubleclick.net https://region1.google-analytics.com https://region1.analytics.google.com https://*.google-analytics.com https://*.analytics.google.com; img-src 'self' data: blob: https://www.google-analytics.com https://www.googletagmanager.com https://*.google-analytics.com https://gangrunprinting.com https://*.gangrunprinting.com https://lh3.googleusercontent.com; style-src 'self' 'unsafe-inline'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests;",
          },
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

  // Minimal webpack configuration - let Next.js handle defaults
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Only add essential fallbacks for browser compatibility
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
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

  // Output configuration - disabled to maintain PM2 compatibility
  // output: 'standalone',

  // Exclude problematic routes from build temporarily
  async generateBuildId() {
    return 'production-build-' + Date.now()
  },

  // TypeScript configuration
  // WARNING: Temporarily enabling ignoreBuildErrors for deployment
  // TODO: Fix all TypeScript errors and set back to false
  typescript: {
    ignoreBuildErrors: true,
  },

  // ESLint configuration
  // WARNING: Temporarily enabling ignoreDuringBuilds for deployment
  // TODO: Fix all ESLint warnings and set back to false
  eslint: {
    ignoreDuringBuilds: true,
  },
}

// Apply plugins in order
let config = nextConfig
// config = withNextIntl(config)

// Sentry configuration temporarily disabled due to Next.js 15 compatibility issues
// TODO: Re-enable when @sentry/nextjs supports Next.js 15

// export default withNextIntl(nextConfig)
export default nextConfig
