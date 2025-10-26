/**
 * Next.js Instrumentation Hook
 *
 * This file is automatically loaded when the Next.js server starts.
 * It's the perfect place to validate environment variables and initialize
 * services that need to run once at startup.
 *
 * See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnvAtStartup } = await import('./src/config/env')

    console.log('🚀 Running Next.js instrumentation hook...')
    validateEnvAtStartup()
    console.log('✅ Instrumentation complete')
  }
}
