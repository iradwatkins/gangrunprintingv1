/**
 * Centralized Environment Configuration
 *
 * CRITICAL: This file provides type-safe access to all environment variables
 * and validates them at application startup.
 *
 * Benefits:
 * 1. Prevents missing NEXT_PUBLIC_ prefix issues (see CLAUDE.md Oct 18, 2025)
 * 2. Validates all required environment variables at startup
 * 3. Provides type-safe access throughout codebase
 * 4. Single source of truth for all environment variables
 */

import { z } from 'zod'

// ============================================================================
// SCHEMA DEFINITIONS
// ============================================================================

/**
 * Server-side only environment variables
 * These are NEVER exposed to the browser
 */
const serverEnvSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  DB_PASSWORD: z.string().min(8),

  // Authentication
  AUTH_SECRET: z.string().min(32),
  AUTH_GOOGLE_ID: z.string(),
  AUTH_GOOGLE_SECRET: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  AUTH_TRUST_HOST: z.string().optional(),

  // Email
  RESEND_API_KEY: z.string().startsWith('re_'),
  RESEND_FROM_EMAIL: z.string().email(),
  RESEND_FROM_NAME: z.string(),

  // Redis
  REDIS_URL: z.string().url(),
  REDIS_PASSWORD: z.string().optional(),

  // MinIO/S3
  MINIO_ENDPOINT: z.string(),
  MINIO_PUBLIC_ENDPOINT: z.string().url(),
  MINIO_PORT: z.string(),
  MINIO_ACCESS_KEY: z.string(),
  MINIO_SECRET_KEY: z.string(),
  MINIO_USE_SSL: z.string().transform(val => val === 'true'),
  MINIO_BUCKET_NAME: z.string(),

  // Square Payment (server-side)
  SQUARE_ACCESS_TOKEN: z.string().startsWith('EAAA'),
  SQUARE_WEBHOOK_SIGNATURE: z.string().optional(),
  SQUARE_WEBHOOK_SIGNATURE_KEY: z.string().optional(),

  // PayPal Payment
  PAYPAL_CLIENT_ID: z.string(),
  PAYPAL_CLIENT_SECRET: z.string(),
  PAYPAL_MODE: z.enum(['sandbox', 'live']),

  // Push Notifications
  VAPID_PRIVATE_KEY: z.string().optional(),
  VAPID_SUBJECT: z.string().email().optional(),

  // Security
  ENCRYPTION_KEY: z.string().min(32),

  // Shipping APIs
  FEDEX_ACCOUNT_NUMBER: z.string().optional(),
  FEDEX_API_KEY: z.string().optional(),
  FEDEX_SECRET_KEY: z.string().optional(),
  FEDEX_API_ENDPOINT: z.string().url().optional(),
  FEDEX_TEST_MODE: z.string().optional(),

  UPS_USERNAME: z.string().optional(),
  UPS_PASSWORD: z.string().optional(),
  UPS_ACCESS_LICENSE_NUMBER: z.string().optional(),
  UPS_API_ENDPOINT: z.string().url().optional(),
  UPS_TEST_MODE: z.string().optional(),

  SOUTHWEST_CARGO_API_KEY: z.string().optional(),
  SOUTHWEST_CARGO_RATE_PER_POUND: z.string().optional(),
  SOUTHWEST_CARGO_MINIMUM_CHARGE: z.string().optional(),

  // Google AI Studio
  GOOGLE_AI_STUDIO_API_KEY: z.string().optional(),

  // Google Search Console
  GOOGLE_SEARCH_CONSOLE_CLIENT_ID: z.string().optional(),
  GOOGLE_SEARCH_CONSOLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_SEARCH_CONSOLE_REFRESH_TOKEN: z.string().optional(),

  // Admin
  ADMIN_EMAIL: z.string().email().optional(),

  // MCP and AI Development Tools
  SEMGREP_APP_TOKEN: z.string().optional(),
  EXA_API_KEY: z.string().optional(),
  CONTEXT7_API_KEY: z.string().optional(),
  REF_API_KEY: z.string().optional(),
  FIRECRAWL_API_KEY: z.string().optional(),
  OLLAMA_MODEL: z.string().optional(),

  // Server Configuration
  PORT: z.string().default('3002'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('production'),

  // Build Phase
  BUILD_PHASE: z.string().optional(),
})

/**
 * Client-side (browser) environment variables
 * These MUST have NEXT_PUBLIC_ prefix to be accessible in browser
 */
const clientEnvSchema = z.object({
  // Domain
  NEXT_PUBLIC_APP_URL: z.string().url(),

  // Square Payment (CRITICAL - must have NEXT_PUBLIC_ prefix)
  NEXT_PUBLIC_SQUARE_APPLICATION_ID: z.string().startsWith('sq0idp-'),
  NEXT_PUBLIC_SQUARE_LOCATION_ID: z.string(),
  NEXT_PUBLIC_SQUARE_ENVIRONMENT: z.enum(['sandbox', 'production']),

  // PayPal
  NEXT_PUBLIC_PAYPAL_CLIENT_ID: z.string(),

  // Push Notifications
  NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().optional(),

  // Sentry Error Tracking
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),

  // Feature Flags
  NEXT_PUBLIC_GA_MEASUREMENT_ID: z.string().optional(),
  NEXT_PUBLIC_BYPASS_AUTH: z.string().optional(),
})

/**
 * Feature flags (can be read on both server and client)
 */
const featureFlagsSchema = z.object({
  ENABLE_PUSH_NOTIFICATIONS: z.string().default('true').transform(val => val === 'true'),
  ENABLE_EMAIL_NOTIFICATIONS: z.string().default('true').transform(val => val === 'true'),
  ENABLE_SMS_NOTIFICATIONS: z.string().default('false').transform(val => val === 'true'),
  ENABLE_ANALYTICS: z.string().default('true').transform(val => val === 'true'),
  ENABLE_SEARCH: z.string().default('true').transform(val => val === 'true'),
  ENABLE_REDIS_CACHE: z.string().default('true').transform(val => val === 'true'),
})

// ============================================================================
// VALIDATION & EXPORT
// ============================================================================

/**
 * Validates and parses server environment variables
 * Only accessible on server-side (API routes, server components)
 */
export function getServerEnv() {
  if (typeof window !== 'undefined') {
    throw new Error('getServerEnv() can only be called on the server')
  }

  try {
    return serverEnvSchema.parse(process.env)
  } catch (error) {
    console.error('❌ Invalid server environment variables:', error)
    throw new Error('Server environment validation failed')
  }
}

/**
 * Validates and parses client environment variables
 * Accessible on both server and client
 */
export function getClientEnv() {
  try {
    return clientEnvSchema.parse({
      NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SQUARE_APPLICATION_ID: process.env.NEXT_PUBLIC_SQUARE_APPLICATION_ID,
      NEXT_PUBLIC_SQUARE_LOCATION_ID: process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID,
      NEXT_PUBLIC_SQUARE_ENVIRONMENT: process.env.NEXT_PUBLIC_SQUARE_ENVIRONMENT,
      NEXT_PUBLIC_PAYPAL_CLIENT_ID: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
      NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_GA_MEASUREMENT_ID: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      NEXT_PUBLIC_BYPASS_AUTH: process.env.NEXT_PUBLIC_BYPASS_AUTH,
    })
  } catch (error) {
    console.error('❌ Invalid client environment variables:', error)
    throw new Error('Client environment validation failed')
  }
}

/**
 * Validates and parses feature flags
 * Accessible on both server and client
 */
export function getFeatureFlags() {
  try {
    return featureFlagsSchema.parse({
      ENABLE_PUSH_NOTIFICATIONS: process.env.ENABLE_PUSH_NOTIFICATIONS,
      ENABLE_EMAIL_NOTIFICATIONS: process.env.ENABLE_EMAIL_NOTIFICATIONS,
      ENABLE_SMS_NOTIFICATIONS: process.env.ENABLE_SMS_NOTIFICATIONS,
      ENABLE_ANALYTICS: process.env.ENABLE_ANALYTICS,
      ENABLE_SEARCH: process.env.ENABLE_SEARCH,
      ENABLE_REDIS_CACHE: process.env.ENABLE_REDIS_CACHE,
    })
  } catch (error) {
    console.error('❌ Invalid feature flags:', error)
    throw new Error('Feature flags validation failed')
  }
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type ServerEnv = z.infer<typeof serverEnvSchema>
export type ClientEnv = z.infer<typeof clientEnvSchema>
export type FeatureFlags = z.infer<typeof featureFlagsSchema>

// ============================================================================
// VALIDATION AT STARTUP (Server-side only)
// ============================================================================

/**
 * Validates all environment variables at application startup
 * Call this in instrumentation.ts or root layout
 */
export function validateEnvAtStartup() {
  if (typeof window !== 'undefined') {
    // Only validate on server
    return
  }

  console.log('🔍 Validating environment variables...')

  try {
    const serverEnv = getServerEnv()
    const clientEnv = getClientEnv()
    const featureFlags = getFeatureFlags()

    console.log('✅ Server environment validated')
    console.log('✅ Client environment validated')
    console.log('✅ Feature flags validated')

    // Check for common misconfigurations
    if (serverEnv.SQUARE_ACCESS_TOKEN && !clientEnv.NEXT_PUBLIC_SQUARE_APPLICATION_ID) {
      throw new Error(
        'CRITICAL: NEXT_PUBLIC_SQUARE_APPLICATION_ID is missing. ' +
        'Square Payment will not work in browser. ' +
        'See CLAUDE.md October 18, 2025'
      )
    }

    if (serverEnv.SQUARE_ACCESS_TOKEN && !clientEnv.NEXT_PUBLIC_SQUARE_LOCATION_ID) {
      throw new Error(
        'CRITICAL: NEXT_PUBLIC_SQUARE_LOCATION_ID is missing. ' +
        'Square Payment will not work in browser. ' +
        'See CLAUDE.md October 18, 2025'
      )
    }

    console.log('✅ All environment variables validated successfully')
  } catch (error) {
    console.error('❌ Environment validation failed:', error)
    throw error
  }
}
