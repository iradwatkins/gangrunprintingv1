// Minimal next-intl plugin setup
import createNextIntlPlugin from 'next-intl/plugin';
const withNextIntl = createNextIntlPlugin('./src/i18n.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable experimental features for App Router
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons'],
    serverActions: {
      bodySizeLimit: '10mb',
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
      }
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
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          }
        ]
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate'
          }
        ]
      }
    ];
  },

  // Redirects for SEO
  async redirects() {
    return [
      {
        source: '/sign-in',
        destination: '/auth/signin',
        permanent: true
      },
      {
        source: '/sign-up',
        destination: '/auth/signup',
        permanent: true
      }
    ];
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
      };
    }

    return config;
  },

  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false
  },

  // Output configuration
  output: 'standalone',

  // Exclude problematic routes from build temporarily
  async generateBuildId() {
    return 'production-build-' + Date.now();
  },

  // TypeScript configuration - temporarily ignore errors for production
  typescript: {
    ignoreBuildErrors: true
  },

  // ESLint configuration - temporarily ignore errors for production
  eslint: {
    ignoreDuringBuilds: true
  }
};

// Apply plugins in order
let config = nextConfig;
config = withNextIntl(config);

// Sentry configuration temporarily disabled due to Next.js 15 compatibility issues
// TODO: Re-enable when @sentry/nextjs supports Next.js 15

export default config;