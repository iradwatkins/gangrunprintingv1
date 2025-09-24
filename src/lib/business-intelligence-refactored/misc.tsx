/**
 * business-intelligence - misc definitions
 * Auto-refactored by BMAD
 */

import { businessMetrics } from '@/lib/monitoring'
import { recordMetric } from '@/lib/sentry'

// E-commerce conversion funnel tracking
export class ConversionFunnelTracker {
  private sessionData: Map<string, any> = new Map()

  // Track visitor landing
  trackLanding(source?: string, medium?: string, campaign?: string) {
    const sessionId = this.getSessionId()

    this.sessionData.set(sessionId, {
      ...this.sessionData.get(sessionId),
      landing_time: Date.now(),
      source,
      medium,
      campaign,
    })

    recordMetric('funnel.landing', 1, 'count', {
      source: source || 'direct',
      medium: medium || 'none',
      campaign: campaign || 'none',
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        event_category: 'Funnel',
        custom_map: { funnel_stage: 'landing' },
      })
    }
  }

  // Track product browsing
  trackBrowsing(productId?: string, category?: string) {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    sessionData.browsing_start = sessionData.browsing_start || Date.now()
    sessionData.products_viewed = (sessionData.products_viewed || 0) + 1

    this.sessionData.set(sessionId, sessionData)

    recordMetric('funnel.browsing', 1, 'count', {
      category: category || 'unknown',
    })

    businessMetrics.trackProductView(productId || 'unknown', 'Product', category)

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item', {
        event_category: 'Funnel',
        custom_map: {
          funnel_stage: 'browsing',
          product_id: productId,
          category,
        },
      })
    }
  }

  // Track add to cart
  trackAddToCart(productId: string, quantity: number, price: number, productName: string) {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    sessionData.cart_started = sessionData.cart_started || Date.now()
    sessionData.cart_items = (sessionData.cart_items || 0) + quantity
    sessionData.cart_value = (sessionData.cart_value || 0) + price * quantity

    this.sessionData.set(sessionId, sessionData)

    recordMetric('funnel.add_to_cart', 1, 'count')
    recordMetric('funnel.cart_value', price * quantity, 'count')

    businessMetrics.trackAddToCart(productId, quantity, price)

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_to_cart', {
        event_category: 'Funnel',
        currency: 'USD',
        value: price * quantity,
        items: [
          {
            item_id: productId,
            item_name: productName,
            quantity,
            price,
          },
        ],
      })
    }
  }

  // Track checkout initiation
  trackCheckoutStart(cartValue: number, itemCount: number) {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    sessionData.checkout_started = Date.now()
    sessionData.checkout_value = cartValue
    sessionData.checkout_items = itemCount

    this.sessionData.set(sessionId, sessionData)

    recordMetric('funnel.checkout_start', 1, 'count')
    recordMetric('funnel.checkout_value', cartValue, 'count')

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'begin_checkout', {
        event_category: 'Funnel',
        currency: 'USD',
        value: cartValue,
      })
    }
  }

  // Track payment attempt
  trackPaymentAttempt(amount: number, method: string) {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    sessionData.payment_attempted = Date.now()
    sessionData.payment_method = method

    this.sessionData.set(sessionId, sessionData)

    recordMetric('funnel.payment_attempt', 1, 'count', {
      payment_method: method,
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'add_payment_info', {
        event_category: 'Funnel',
        currency: 'USD',
        value: amount,
        custom_map: {
          payment_method: method,
        },
      })
    }
  }

  // Track successful conversion
  trackConversion(orderId: string, amount: number, itemCount: number, method: string) {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    const conversionTime = Date.now()
    const timeToConvert = conversionTime - (sessionData.landing_time || conversionTime)

    sessionData.conversion_time = conversionTime
    sessionData.order_id = orderId

    this.sessionData.set(sessionId, sessionData)

    recordMetric('funnel.conversion', 1, 'count', {
      payment_method: method,
    })
    recordMetric('funnel.conversion_value', amount, 'count')
    recordMetric('funnel.time_to_convert', timeToConvert, 'millisecond')

    businessMetrics.trackOrderCreated(orderId, amount, itemCount, method)
    businessMetrics.trackPaymentSuccess(orderId, amount, method)

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'purchase', {
        event_category: 'Funnel',
        transaction_id: orderId,
        currency: 'USD',
        value: amount,
        custom_map: {
          time_to_convert: Math.round(timeToConvert / 1000), // seconds
          session_products_viewed: sessionData.products_viewed || 0,
        },
      })
    }
  }

  // Track cart abandonment
  trackCartAbandonment() {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    if (sessionData.cart_value > 0) {
      businessMetrics.trackCartAbandonment(sessionData.cart_value, sessionData.cart_items || 0)

      recordMetric('funnel.cart_abandonment', 1, 'count')
      recordMetric('funnel.abandoned_value', sessionData.cart_value, 'count')

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'abandon_cart', {
          event_category: 'Funnel',
          currency: 'USD',
          value: sessionData.cart_value,
          custom_map: {
            items_in_cart: sessionData.cart_items || 0,
          },
        })
      }
    }
  }

  // Generate funnel report
  generateFunnelReport() {
    const sessionId = this.getSessionId()
    const sessionData = this.sessionData.get(sessionId) || {}

    return {
      sessionId,
      landingTime: sessionData.landing_time,
      productsViewed: sessionData.products_viewed || 0,
      cartValue: sessionData.cart_value || 0,
      cartItems: sessionData.cart_items || 0,
      checkoutStarted: sessionData.checkout_started,
      paymentAttempted: sessionData.payment_attempted,
      conversionTime: sessionData.conversion_time,
      orderId: sessionData.order_id,
      timeToConvert:
        sessionData.conversion_time && sessionData.landing_time
          ? sessionData.conversion_time - sessionData.landing_time
          : null,
    }
  }

  private getSessionId(): string {
    if (typeof window === 'undefined') return 'server'

    let sessionId = sessionStorage.getItem('session_id')
    if (!sessionId) {
      sessionId = Date.now().toString() + Math.random().toString(36).substr(2, 9)
      sessionStorage.setItem('session_id', sessionId)
    }
    return sessionId
  }
}

// Product performance analytics
export class ProductAnalytics {
  // Track product impressions
  trackProductImpression(productId: string, position: number, listName?: string) {
    recordMetric('product.impression', 1, 'count', {
      product_id: productId,
      position: position.toString(),
      list: listName || 'unknown',
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'view_item_list', {
        event_category: 'Product',
        custom_map: {
          product_id: productId,
          position,
          list_name: listName,
        },
      })
    }
  }

  // Track product clicks
  trackProductClick(productId: string, position: number, listName?: string) {
    recordMetric('product.click', 1, 'count', {
      product_id: productId,
      position: position.toString(),
      list: listName || 'unknown',
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'select_item', {
        event_category: 'Product',
        custom_map: {
          product_id: productId,
          position,
          list_name: listName,
        },
      })
    }
  }

  // Track configuration changes
  trackConfigurationChange(productId: string, optionType: string, optionValue: string) {
    recordMetric('product.configuration_change', 1, 'count', {
      product_id: productId,
      option_type: optionType,
      option_value: optionValue,
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'customize_product', {
        event_category: 'Product',
        custom_map: {
          product_id: productId,
          option_type: optionType,
          option_value: optionValue,
        },
      })
    }
  }

  // Track price calculations
  trackPriceCalculation(
    productId: string,
    basePrice: number,
    finalPrice: number,
    discounts?: number
  ) {
    recordMetric('product.price_calculation', 1, 'count', {
      product_id: productId,
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'price_calculated', {
        event_category: 'Product',
        currency: 'USD',
        value: finalPrice,
        custom_map: {
          product_id: productId,
          base_price: basePrice,
          final_price: finalPrice,
          discount_amount: discounts || 0,
        },
      })
    }
  }
}

// User behavior analytics
export class UserBehaviorAnalytics {
  private sessionStart: number = Date.now()
  private pageViews: number = 0
  private scrollDepth: number = 0

  // Track page engagement
  trackPageEngagement(pageName: string, timeSpent: number) {
    this.pageViews++

    recordMetric('user.page_engagement', timeSpent, 'millisecond', {
      page: pageName,
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_engagement', {
        event_category: 'User Behavior',
        custom_map: {
          page_name: pageName,
          time_spent: Math.round(timeSpent / 1000), // seconds
          page_views_in_session: this.pageViews,
        },
      })
    }
  }

  // Track scroll depth
  trackScrollDepth(percentage: number) {
    if (percentage > this.scrollDepth) {
      this.scrollDepth = percentage

      recordMetric('user.scroll_depth', percentage, 'count')

      if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', 'scroll_depth', {
          event_category: 'User Behavior',
          value: percentage,
        })
      }
    }
  }

  // Track form interactions
  trackFormInteraction(
    formName: string,
    action: 'start' | 'complete' | 'abandon',
    fieldCount?: number
  ) {
    recordMetric(`form.${action}`, 1, 'count', {
      form: formName,
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `form_${action}`, {
        event_category: 'User Behavior',
        custom_map: {
          form_name: formName,
          field_count: fieldCount,
        },
      })
    }
  }

  // Track search behavior
  trackSearchBehavior(query: string, resultsCount: number, selectedResult?: number) {
    businessMetrics.trackSearchQuery(query, resultsCount)

    recordMetric('user.search', 1, 'count')

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'search', {
        search_term: query,
        custom_map: {
          results_count: resultsCount,
          selected_result_position: selectedResult,
        },

      })
    }
  }

  // Track session summary
  trackSessionSummary() {
    const sessionDuration = Date.now() - this.sessionStart

    recordMetric('user.session_duration', sessionDuration, 'millisecond')
    recordMetric('user.page_views', this.pageViews, 'count')

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'session_summary', {
        event_category: 'User Behavior',
        custom_map: {
          session_duration: Math.round(sessionDuration / 1000), // seconds
          page_views: this.pageViews,
          max_scroll_depth: this.scrollDepth,
        },
      })
    }
  }
}

// Error tracking and quality metrics
export class QualityMetrics {
  // Track form errors
  trackFormError(formName: string, fieldName: string, errorMessage: string) {
    recordMetric('quality.form_error', 1, 'count', {
      form: formName,
      field: fieldName,
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'form_error', {
        event_category: 'Quality',
        custom_map: {
          form_name: formName,
          field_name: fieldName,
          error_message: errorMessage,
        },
      })
    }
  }

  // Track API errors
  trackApiError(endpoint: string, statusCode: number, errorMessage: string) {
    recordMetric('quality.api_error', 1, 'count', {
      endpoint,
      status_code: statusCode.toString(),
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'api_error', {
        event_category: 'Quality',
        custom_map: {
          endpoint,
          status_code: statusCode,
          error_message: errorMessage,
        },
      })
    }
  }

  // Track feature usage
  trackFeatureUsage(featureName: string, context?: string) {
    recordMetric('feature.usage', 1, 'count', {
      feature: featureName,
      context: context || 'unknown',
    })

    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'feature_usage', {
        event_category: 'Feature',
        custom_map: {
          feature_name: featureName,
          context,
        },
      })
    }
  }
}

// Global instances
