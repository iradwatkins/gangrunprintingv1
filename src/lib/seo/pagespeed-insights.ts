/**
 * PageSpeed Insights API v5 Integration
 *
 * Provides functions to analyze website performance using Google's PageSpeed Insights.
 * Returns Core Web Vitals and performance scores.
 *
 * Free tier: 25,000 requests/day
 * @see https://developers.google.com/speed/docs/insights/v5/get-started
 */

import axios from 'axios'

/**
 * Core Web Vitals metrics
 */
export interface CoreWebVitals {
  lcp: number // Largest Contentful Paint (ms)
  fid: number // First Input Delay (ms) - deprecated, use INP
  cls: number // Cumulative Layout Shift (score)
  inp: number // Interaction to Next Paint (ms)
  ttfb: number // Time to First Byte (ms)
  fcp: number // First Contentful Paint (ms)
}

/**
 * Performance scores (0-100)
 */
export interface PerformanceScores {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
}

/**
 * Complete PageSpeed analysis result
 */
export interface PageSpeedResult {
  url: string
  strategy: 'mobile' | 'desktop'
  scores: PerformanceScores
  vitals: CoreWebVitals
  loadingExperience: 'FAST' | 'AVERAGE' | 'SLOW' | null
  timestamp: string
}

/**
 * Detailed diagnostic information
 */
export interface PageSpeedDiagnostic {
  title: string
  description: string
  displayValue?: string
  score?: number
  numericValue?: number
}

/**
 * Analyze a URL using PageSpeed Insights API
 *
 * @param url - The URL to analyze
 * @param strategy - 'mobile' or 'desktop'
 * @returns PageSpeed analysis result
 */
export async function analyzeURL(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedResult | null> {
  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY
    if (!apiKey) {
      console.warn('PageSpeed Insights API key not configured')
      return null
    }

    const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    const params = {
      url,
      strategy,
      key: apiKey,
      category: ['performance', 'accessibility', 'best-practices', 'seo'],
    }

    const response = await axios.get(apiUrl, {
      params,
      timeout: 60000, // PageSpeed can take up to 60 seconds
    })

    const data = response.data

    // Extract scores
    const lighthouseResult = data.lighthouseResult
    const categories = lighthouseResult.categories

    const scores: PerformanceScores = {
      performance: Math.round((categories.performance?.score || 0) * 100),
      accessibility: Math.round((categories.accessibility?.score || 0) * 100),
      bestPractices: Math.round((categories['best-practices']?.score || 0) * 100),
      seo: Math.round((categories.seo?.score || 0) * 100),
    }

    // Extract Core Web Vitals
    const audits = lighthouseResult.audits
    const vitals: CoreWebVitals = {
      lcp: audits['largest-contentful-paint']?.numericValue || 0,
      fid: audits['max-potential-fid']?.numericValue || 0, // FID is deprecated, using max potential
      cls: audits['cumulative-layout-shift']?.numericValue || 0,
      inp:
        audits['interaction-to-next-paint']?.numericValue ||
        audits['total-blocking-time']?.numericValue ||
        0,
      ttfb: audits['server-response-time']?.numericValue || 0,
      fcp: audits['first-contentful-paint']?.numericValue || 0,
    }

    // Extract loading experience
    const loadingExperience = data.loadingExperience?.overall_category || null

    return {
      url,
      strategy,
      scores,
      vitals,
      loadingExperience,
      timestamp: new Date().toISOString(),
    }
  } catch (error) {
    console.error('Failed to analyze URL with PageSpeed Insights:', error)
    return null
  }
}

/**
 * Get Core Web Vitals for a specific URL
 *
 * @param url - The URL to analyze
 * @returns Core Web Vitals or null
 */
export async function getCoreWebVitals(url: string): Promise<CoreWebVitals | null> {
  const result = await analyzeURL(url, 'mobile')
  return result?.vitals || null
}

/**
 * Get performance score for a URL
 *
 * @param url - The URL to analyze
 * @returns Performance score (0-100) or null
 */
export async function getPerformanceScore(url: string): Promise<number | null> {
  const result = await analyzeURL(url, 'mobile')
  return result?.scores.performance || null
}

/**
 * Get detailed diagnostics and opportunities
 *
 * @param url - The URL to analyze
 * @param strategy - 'mobile' or 'desktop'
 * @returns Array of diagnostic information
 */
export async function getDiagnostics(
  url: string,
  strategy: 'mobile' | 'desktop' = 'mobile'
): Promise<PageSpeedDiagnostic[]> {
  try {
    const apiKey = process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY
    if (!apiKey) {
      console.warn('PageSpeed Insights API key not configured')
      return []
    }

    const apiUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed'
    const params = {
      url,
      strategy,
      key: apiKey,
      category: ['performance'],
    }

    const response = await axios.get(apiUrl, {
      params,
      timeout: 60000,
    })

    const audits = response.data.lighthouseResult.audits
    const diagnostics: PageSpeedDiagnostic[] = []

    // Extract key diagnostics
    const keyAudits = [
      'first-contentful-paint',
      'largest-contentful-paint',
      'total-blocking-time',
      'cumulative-layout-shift',
      'speed-index',
      'interactive',
      'bootup-time',
      'mainthread-work-breakdown',
      'dom-size',
      'uses-optimized-images',
      'modern-image-formats',
      'offscreen-images',
      'unminified-css',
      'unminified-javascript',
      'unused-css-rules',
      'unused-javascript',
      'uses-text-compression',
      'uses-responsive-images',
      'efficient-animated-content',
      'duplicated-javascript',
      'legacy-javascript',
      'total-byte-weight',
    ]

    keyAudits.forEach((auditKey) => {
      const audit = audits[auditKey]
      if (audit && (audit.score === null || audit.score < 0.9)) {
        diagnostics.push({
          title: audit.title,
          description: audit.description,
          displayValue: audit.displayValue,
          score: audit.score ? Math.round(audit.score * 100) : undefined,
          numericValue: audit.numericValue,
        })
      }
    })

    return diagnostics
  } catch (error) {
    console.error('Failed to get diagnostics:', error)
    return []
  }
}

/**
 * Compare mobile vs desktop performance
 *
 * @param url - The URL to analyze
 * @returns Object with mobile and desktop results
 */
export async function compareDevices(url: string): Promise<{
  mobile: PageSpeedResult | null
  desktop: PageSpeedResult | null
}> {
  const [mobile, desktop] = await Promise.all([
    analyzeURL(url, 'mobile'),
    analyzeURL(url, 'desktop'),
  ])

  return { mobile, desktop }
}

/**
 * Check if PageSpeed Insights is configured
 */
export function isPageSpeedConfigured(): boolean {
  return !!(process.env.GOOGLE_AI_STUDIO_API_KEY || process.env.GOOGLE_PAGESPEED_API_KEY)
}

/**
 * Get human-readable assessment of Core Web Vitals
 *
 * @param vitals - Core Web Vitals metrics
 * @returns Assessment object with pass/fail for each metric
 */
export function assessWebVitals(vitals: CoreWebVitals): {
  lcp: 'good' | 'needs-improvement' | 'poor'
  fid: 'good' | 'needs-improvement' | 'poor'
  cls: 'good' | 'needs-improvement' | 'poor'
  inp: 'good' | 'needs-improvement' | 'poor'
  fcp: 'good' | 'needs-improvement' | 'poor'
  ttfb: 'good' | 'needs-improvement' | 'poor'
} {
  return {
    lcp: vitals.lcp <= 2500 ? 'good' : vitals.lcp <= 4000 ? 'needs-improvement' : 'poor',
    fid: vitals.fid <= 100 ? 'good' : vitals.fid <= 300 ? 'needs-improvement' : 'poor',
    cls: vitals.cls <= 0.1 ? 'good' : vitals.cls <= 0.25 ? 'needs-improvement' : 'poor',
    inp: vitals.inp <= 200 ? 'good' : vitals.inp <= 500 ? 'needs-improvement' : 'poor',
    fcp: vitals.fcp <= 1800 ? 'good' : vitals.fcp <= 3000 ? 'needs-improvement' : 'poor',
    ttfb: vitals.ttfb <= 800 ? 'good' : vitals.ttfb <= 1800 ? 'needs-improvement' : 'poor',
  }
}

/**
 * Batch analyze multiple URLs (with rate limiting)
 *
 * @param urls - Array of URLs to analyze
 * @param strategy - 'mobile' or 'desktop'
 * @param delayMs - Delay between requests in milliseconds (default: 2000ms)
 * @returns Array of PageSpeed results
 */
export async function batchAnalyze(
  urls: string[],
  strategy: 'mobile' | 'desktop' = 'mobile',
  delayMs: number = 2000
): Promise<PageSpeedResult[]> {
  const results: PageSpeedResult[] = []

  for (const url of urls) {
    const result = await analyzeURL(url, strategy)
    if (result) {
      results.push(result)
    }

    // Rate limiting delay
    if (urls.indexOf(url) < urls.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs))
    }
  }

  return results
}
