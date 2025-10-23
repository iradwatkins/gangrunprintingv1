/**
 * Google Analytics 4 Integration
 *
 * Provides functions to retrieve traffic data from Google Analytics 4.
 * Uses Google Analytics Data API v1 (free tier: 100,000 requests/day).
 *
 * @see https://developers.google.com/analytics/devguides/reporting/data/v1
 */

import { google } from 'googleapis'
import type { analyticsdata_v1beta } from 'googleapis'

/**
 * Traffic data structure returned by GA4
 */
export interface GA4TrafficData {
  sessions: number
  users: number
  pageviews: number
  bounceRate: number
  avgSessionDuration: number
  newUsers: number
  returningUsers: number
}

/**
 * Traffic source breakdown
 */
export interface GA4TrafficSource {
  source: string
  medium: string
  sessions: number
  users: number
  percentage: number
}

/**
 * Device breakdown data
 */
export interface GA4DeviceData {
  mobile: number
  desktop: number
  tablet: number
}

/**
 * Real-time traffic metrics
 */
export interface GA4RealtimeData {
  activeUsers: number
  activeUsers1Minute: number
  activeUsers5Minutes: number
  activeUsers30Minutes: number
}

/**
 * Get authenticated Google Analytics Data API client
 */
async function getAnalyticsClient(): Promise<analyticsdata_v1beta.Analyticsdata | null> {
  try {
    // Check if GA4 is configured
    const propertyId = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID
    if (!propertyId) {
      console.warn('Google Analytics 4 not configured (missing GOOGLE_ANALYTICS_4_PROPERTY_ID)')
      return null
    }

    // Use existing OAuth credentials
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    )

    // Check if refresh token exists (from existing Google OAuth setup)
    const refreshToken = process.env.GOOGLE_REFRESH_TOKEN
    if (!refreshToken) {
      console.warn('Google OAuth not configured (missing GOOGLE_REFRESH_TOKEN)')
      return null
    }

    oauth2Client.setCredentials({
      refresh_token: refreshToken,
    })

    return google.analyticsdata({ version: 'v1beta', auth: oauth2Client })
  } catch (error) {
    console.error('Failed to create GA4 client:', error)
    return null
  }
}

/**
 * Get real-time active users on the site
 */
export async function getRealtimeTraffic(): Promise<GA4RealtimeData | null> {
  try {
    const client = await getAnalyticsClient()
    if (!client) return null

    const propertyId = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID!

    const response = await client.properties.runRealtimeReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dimensions: [{ name: 'minutesAgo' }],
        metrics: [{ name: 'activeUsers' }],
      },
    })

    const rows = response.data.rows || []

    // Calculate active users for different time windows
    const activeUsers1Minute =
      rows.find((r) => r.dimensionValues?.[0]?.value === '0')?.metricValues?.[0]?.value || '0'
    const activeUsers5Minutes = rows
      .filter((r) => {
        const minutes = parseInt(r.dimensionValues?.[0]?.value || '999')
        return minutes <= 5
      })
      .reduce((sum, r) => sum + parseInt(r.metricValues?.[0]?.value || '0'), 0)

    const activeUsers30Minutes = rows.reduce(
      (sum, r) => sum + parseInt(r.metricValues?.[0]?.value || '0'),
      0
    )

    return {
      activeUsers: activeUsers30Minutes,
      activeUsers1Minute: parseInt(activeUsers1Minute),
      activeUsers5Minutes,
      activeUsers30Minutes,
    }
  } catch (error) {
    console.error('Failed to fetch realtime traffic:', error)
    return null
  }
}

/**
 * Get historical traffic data for a date range
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export async function getTrafficData(
  startDate: string,
  endDate: string
): Promise<GA4TrafficData | null> {
  try {
    const client = await getAnalyticsClient()
    if (!client) return null

    const propertyId = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID!

    const response = await client.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      },
    })

    const row = response.data.rows?.[0]
    if (!row || !row.metricValues) {
      return null
    }

    const sessions = parseInt(row.metricValues[0]?.value || '0')
    const users = parseInt(row.metricValues[1]?.value || '0')
    const newUsers = parseInt(row.metricValues[5]?.value || '0')

    return {
      sessions,
      users,
      pageviews: parseInt(row.metricValues[2]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[3]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues[4]?.value || '0'),
      newUsers,
      returningUsers: users - newUsers,
    }
  } catch (error) {
    console.error('Failed to fetch traffic data:', error)
    return null
  }
}

/**
 * Get traffic sources breakdown
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export async function getTrafficSources(
  startDate: string,
  endDate: string
): Promise<GA4TrafficSource[]> {
  try {
    const client = await getAnalyticsClient()
    if (!client) return []

    const propertyId = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID!

    const response = await client.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'sessionSource' }, { name: 'sessionMedium' }],
        metrics: [{ name: 'sessions' }, { name: 'totalUsers' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10,
      },
    })

    const rows = response.data.rows || []
    const totalSessions = rows.reduce(
      (sum, r) => sum + parseInt(r.metricValues?.[0]?.value || '0'),
      0
    )

    return rows.map((row) => {
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')
      return {
        source: row.dimensionValues?.[0]?.value || '(unknown)',
        medium: row.dimensionValues?.[1]?.value || '(unknown)',
        sessions,
        users: parseInt(row.metricValues?.[1]?.value || '0'),
        percentage: totalSessions > 0 ? (sessions / totalSessions) * 100 : 0,
      }
    })
  } catch (error) {
    console.error('Failed to fetch traffic sources:', error)
    return []
  }
}

/**
 * Get device breakdown (mobile vs desktop vs tablet)
 *
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export async function getDeviceBreakdown(
  startDate: string,
  endDate: string
): Promise<GA4DeviceData | null> {
  try {
    const client = await getAnalyticsClient()
    if (!client) return null

    const propertyId = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID!

    const response = await client.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'sessions' }],
      },
    })

    const rows = response.data.rows || []
    const deviceData: GA4DeviceData = {
      mobile: 0,
      desktop: 0,
      tablet: 0,
    }

    rows.forEach((row) => {
      const device = row.dimensionValues?.[0]?.value?.toLowerCase()
      const sessions = parseInt(row.metricValues?.[0]?.value || '0')

      if (device === 'mobile') {
        deviceData.mobile = sessions
      } else if (device === 'desktop') {
        deviceData.desktop = sessions
      } else if (device === 'tablet') {
        deviceData.tablet = sessions
      }
    })

    return deviceData
  } catch (error) {
    console.error('Failed to fetch device breakdown:', error)
    return null
  }
}

/**
 * Check if Google Analytics 4 is configured
 */
export function isGA4Configured(): boolean {
  return !!(
    process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID &&
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  )
}

/**
 * Get page-specific traffic data
 *
 * @param pagePath - The page path (e.g., /products/business-cards)
 * @param startDate - Start date in YYYY-MM-DD format
 * @param endDate - End date in YYYY-MM-DD format
 */
export async function getPageTraffic(
  pagePath: string,
  startDate: string,
  endDate: string
): Promise<GA4TrafficData | null> {
  try {
    const client = await getAnalyticsClient()
    if (!client) return null

    const propertyId = process.env.GOOGLE_ANALYTICS_4_PROPERTY_ID!

    const response = await client.properties.runReport({
      property: `properties/${propertyId}`,
      requestBody: {
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        dimensionFilter: {
          filter: {
            fieldName: 'pagePath',
            stringFilter: {
              matchType: 'EXACT',
              value: pagePath,
            },
          },
        },
        metrics: [
          { name: 'sessions' },
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' },
          { name: 'averageSessionDuration' },
          { name: 'newUsers' },
        ],
      },
    })

    const row = response.data.rows?.[0]
    if (!row || !row.metricValues) {
      return null
    }

    const users = parseInt(row.metricValues[1]?.value || '0')
    const newUsers = parseInt(row.metricValues[5]?.value || '0')

    return {
      sessions: parseInt(row.metricValues[0]?.value || '0'),
      users,
      pageviews: parseInt(row.metricValues[2]?.value || '0'),
      bounceRate: parseFloat(row.metricValues[3]?.value || '0'),
      avgSessionDuration: parseFloat(row.metricValues[4]?.value || '0'),
      newUsers,
      returningUsers: users - newUsers,
    }
  } catch (error) {
    console.error('Failed to fetch page traffic:', error)
    return null
  }
}
