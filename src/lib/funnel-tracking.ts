/**
 * FunnelKit Tracking System
 *
 * Client-side tracking for funnel visits, UTM parameters, and customer journey.
 * Captures attribution data and stores in session for order attribution.
 */

import Cookies from 'js-cookie'

/**
 * UTM Parameters from URL
 */
interface UTMParams {
  source?: string
  medium?: string
  campaign?: string
  term?: string
  content?: string
}

/**
 * Device information
 */
interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop'
  browser: string
  os: string
}

/**
 * Funnel visit tracking data
 */
interface FunnelVisitData {
  funnelId?: string
  funnelStepId?: string
  pageUrl: string
  referrer: string
  utm: UTMParams
  device: DeviceInfo
  sessionId: string
  timestamp: string
}

/**
 * Get UTM parameters from URL
 */
function getUTMParams(): UTMParams {
  if (typeof window === 'undefined') return {}

  const params = new URLSearchParams(window.location.search)
  return {
    source: params.get('utm_source') || undefined,
    medium: params.get('utm_medium') || undefined,
    campaign: params.get('utm_campaign') || undefined,
    term: params.get('utm_term') || undefined,
    content: params.get('utm_content') || undefined,
  }
}

/**
 * Detect device type
 */
function detectDevice(): DeviceInfo {
  if (typeof window === 'undefined') {
    return { type: 'desktop', browser: 'unknown', os: 'unknown' }
  }

  const ua = navigator.userAgent
  let type: 'mobile' | 'tablet' | 'desktop' = 'desktop'

  if (/Mobile|Android|iPhone/i.test(ua)) {
    type = 'mobile'
  } else if (/iPad|Tablet/i.test(ua)) {
    type = 'tablet'
  }

  // Detect browser
  let browser = 'unknown'
  if (ua.includes('Firefox')) browser = 'Firefox'
  else if (ua.includes('Chrome')) browser = 'Chrome'
  else if (ua.includes('Safari')) browser = 'Safari'
  else if (ua.includes('Edge')) browser = 'Edge'

  // Detect OS
  let os = 'unknown'
  if (ua.includes('Windows')) os = 'Windows'
  else if (ua.includes('Mac')) os = 'macOS'
  else if (ua.includes('Linux')) os = 'Linux'
  else if (ua.includes('Android')) os = 'Android'
  else if (ua.includes('iOS')) os = 'iOS'

  return { type, browser, os }
}

/**
 * Get or create session ID
 */
function getSessionId(): string {
  let sessionId = Cookies.get('funnel_session_id')

  if (!sessionId) {
    sessionId = `fs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    // 30 day expiry
    Cookies.set('funnel_session_id', sessionId, { expires: 30 })
  }

  return sessionId
}

/**
 * Store funnel attribution in session storage
 * This will be read during checkout to attribute the order
 */
function storeFunnelAttribution(funnelId: string, funnelStepId: string) {
  if (typeof window === 'undefined') return

  try {
    const attribution = {
      funnelId,
      funnelStepId,
      timestamp: new Date().toISOString(),
    }
    sessionStorage.setItem('funnel_attribution', JSON.stringify(attribution))
  } catch (error) {
    console.error('Failed to store funnel attribution:', error)
  }
}

/**
 * Get stored funnel attribution
 */
export function getFunnelAttribution(): { funnelId: string; funnelStepId: string } | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = sessionStorage.getItem('funnel_attribution')
    if (!stored) return null

    const attribution = JSON.parse(stored)

    // Check if attribution is less than 24 hours old
    const age = Date.now() - new Date(attribution.timestamp).getTime()
    if (age > 24 * 60 * 60 * 1000) {
      sessionStorage.removeItem('funnel_attribution')
      return null
    }

    return {
      funnelId: attribution.funnelId,
      funnelStepId: attribution.funnelStepId,
    }
  } catch (error) {
    console.error('Failed to get funnel attribution:', error)
    return null
  }
}

/**
 * Track a funnel visit
 * Call this on every funnel page load
 */
export async function trackFunnelVisit(funnelId?: string, funnelStepId?: string): Promise<void> {
  if (typeof window === 'undefined') return

  try {
    const visitData: FunnelVisitData = {
      funnelId,
      funnelStepId,
      pageUrl: window.location.href,
      referrer: document.referrer,
      utm: getUTMParams(),
      device: detectDevice(),
      sessionId: getSessionId(),
      timestamp: new Date().toISOString(),
    }

    // Store attribution for order tracking
    if (funnelId && funnelStepId) {
      storeFunnelAttribution(funnelId, funnelStepId)
    }

    // Send to tracking API
    await fetch('/api/funnels/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(visitData),
    })
  } catch (error) {
    // Silent fail - don't break user experience
    console.error('Failed to track funnel visit:', error)
  }
}

/**
 * Track page view (for non-funnel pages)
 * Useful for tracking customer journey across entire site
 */
export async function trackPageView(): Promise<void> {
  await trackFunnelVisit()
}

/**
 * Initialize tracking on page load
 * Call this in your root layout or app component
 */
export function initializeFunnelTracking() {
  if (typeof window === 'undefined') return

  // Track initial page load
  trackPageView()

  // Track UTM params if present
  const utm = getUTMParams()
  if (Object.keys(utm).length > 0) {
    // Store UTM params in cookie for attribution
    Cookies.set('utm_params', JSON.stringify(utm), { expires: 30 })
  }
}

/**
 * Get stored UTM parameters
 */
export function getStoredUTMParams(): UTMParams {
  try {
    const stored = Cookies.get('utm_params')
    if (!stored) return {}
    return JSON.parse(stored)
  } catch {
    return {}
  }
}
