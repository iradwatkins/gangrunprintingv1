/**
 * Origin Tracker - Detects traffic source from referrer and UTM parameters
 */

export interface OriginData {
  source: string // Direct, Facebook, Google, etc.
  medium?: string // organic, cpc, social, etc.
  campaign?: string // UTM campaign name
  referrer?: string // Full referrer URL
}

/**
 * Detect origin from browser context (client-side)
 */
export function detectOriginClient(): OriginData {
  if (typeof window === 'undefined') {
    return { source: 'Direct' }
  }

  const params = new URLSearchParams(window.location.search)
  const referrer = document.referrer

  // Priority 1: UTM parameters (most reliable)
  const utmSource = params.get('utm_source')
  const utmMedium = params.get('utm_medium')
  const utmCampaign = params.get('utm_campaign')

  if (utmSource) {
    return {
      source: capitalizeFirst(utmSource),
      medium: utmMedium || undefined,
      campaign: utmCampaign || undefined,
      referrer: referrer || undefined,
    }
  }

  // Priority 2: Referrer domain
  if (referrer) {
    try {
      const referrerUrl = new URL(referrer)
      const hostname = referrerUrl.hostname.toLowerCase()

      // Check if referrer is from the same domain
      if (hostname === window.location.hostname) {
        return { source: 'Direct', referrer }
      }

      // Map common referrer domains to sources
      const sourceMap: Record<string, string> = {
        'facebook.com': 'Facebook',
        'fb.com': 'Facebook',
        'm.facebook.com': 'Facebook',
        'l.facebook.com': 'Facebook',
        'instagram.com': 'Instagram',
        'google.com': 'Google',
        'google.co.uk': 'Google',
        'bing.com': 'Bing',
        'yahoo.com': 'Yahoo',
        'twitter.com': 'Twitter',
        't.co': 'Twitter',
        'linkedin.com': 'LinkedIn',
        'pinterest.com': 'Pinterest',
        'reddit.com': 'Reddit',
        'youtube.com': 'YouTube',
        'tiktok.com': 'TikTok',
      }

      // Check for known sources
      for (const [domain, source] of Object.entries(sourceMap)) {
        if (hostname.includes(domain)) {
          return { source, referrer }
        }
      }

      // Unknown referrer - return domain name
      return { source: hostname, referrer }
    } catch {
      // Invalid URL
      return { source: 'Direct', referrer }
    }
  }

  // Priority 3: Direct traffic (no referrer, no UTM)
  return { source: 'Direct' }
}

/**
 * Detect origin from request headers (server-side)
 */
export function detectOriginServer(
  url: string,
  referrer?: string | null
): OriginData {
  try {
    const urlObj = new URL(url, 'https://gangrunprinting.com')
    const params = urlObj.searchParams

    // Priority 1: UTM parameters
    const utmSource = params.get('utm_source')
    const utmMedium = params.get('utm_medium')
    const utmCampaign = params.get('utm_campaign')

    if (utmSource) {
      return {
        source: capitalizeFirst(utmSource),
        medium: utmMedium || undefined,
        campaign: utmCampaign || undefined,
        referrer: referrer || undefined,
      }
    }

    // Priority 2: Referrer header
    if (referrer) {
      try {
        const referrerUrl = new URL(referrer)
        const hostname = referrerUrl.hostname.toLowerCase()

        const sourceMap: Record<string, string> = {
          'facebook.com': 'Facebook',
          'fb.com': 'Facebook',
          'm.facebook.com': 'Facebook',
          'l.facebook.com': 'Facebook',
          'instagram.com': 'Instagram',
          'google.com': 'Google',
          'bing.com': 'Bing',
          'twitter.com': 'Twitter',
          't.co': 'Twitter',
          'linkedin.com': 'LinkedIn',
        }

        for (const [domain, source] of Object.entries(sourceMap)) {
          if (hostname.includes(domain)) {
            return { source, referrer }
          }
        }

        return { source: hostname, referrer }
      } catch {
        return { source: 'Direct', referrer }
      }
    }

    return { source: 'Direct' }
  } catch {
    return { source: 'Direct' }
  }
}

/**
 * Format origin data for storage (single string)
 */
export function formatOrigin(data: OriginData): string {
  if (data.campaign) {
    return `${data.source} (${data.campaign})`
  }
  if (data.medium) {
    return `${data.source} - ${data.medium}`
  }
  return data.source
}

/**
 * Store origin in sessionStorage for later use at checkout
 */
export function saveOrigin(data: OriginData): void {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('traffic_origin', JSON.stringify(data))
    } catch {
      // Ignore storage errors
    }
  }
}

/**
 * Retrieve stored origin from sessionStorage
 */
export function getStoredOrigin(): OriginData | null {
  if (typeof window !== 'undefined') {
    try {
      const stored = sessionStorage.getItem('traffic_origin')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  }
  return null
}

function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}
