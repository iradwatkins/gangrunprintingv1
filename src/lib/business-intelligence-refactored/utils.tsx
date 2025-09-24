/**
 * business-intelligence - utils definitions
 * Auto-refactored by BMAD
 */

export const conversionFunnel = new ConversionFunnelTracker()

export const productAnalytics = new ProductAnalytics()

export const qualityMetrics = new QualityMetrics()

// Initialize page unload tracking
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    conversionFunnel.trackCartAbandonment()
    userBehavior.trackSessionSummary()
  })

  // Track scroll depth
  let maxScroll = 0
  window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
    const scrollPercent = Math.round((scrollTop / scrollHeight) * 100)

    if (scrollPercent > maxScroll) {
      maxScroll = scrollPercent
      userBehavior.trackScrollDepth(scrollPercent)
    }
  })
}
