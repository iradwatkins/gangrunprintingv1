import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface CurrencyInfo {
  code: string
  name: string
  symbol: string
  exchangeRate: number
  decimalPlaces: number
  thousandsSeparator: string
  decimalSeparator: string
  symbolPosition: 'before' | 'after'
  countries: string[]
  isActive: boolean
}

export interface FormattedPrice {
  amount: number
  currency: string
  formatted: string
  symbol: string
}

export interface ExchangeRateInfo {
  fromCurrency: string
  toCurrency: string
  rate: number
  lastUpdated: Date
  source: string
}

export class CurrencyService {
  private static instance: CurrencyService
  private currencyCache = new Map<string, CurrencyInfo>()
  private exchangeRateCache = new Map<string, ExchangeRateInfo>()
  private readonly CACHE_TTL = 30 * 60 * 1000 // 30 minutes

  public static getInstance(): CurrencyService {
    if (!CurrencyService.instance) {
      CurrencyService.instance = new CurrencyService()
    }
    return CurrencyService.instance
  }

  /**
   * Get currency information
   */
  async getCurrency(code: string): Promise<CurrencyInfo | null> {
    const cacheKey = `currency:${code}`
    const cached = this.currencyCache.get(cacheKey)

    if (cached) {
      return cached
    }

    try {
      const currency = await prisma.currency.findUnique({
        where: { code: code.toUpperCase() },
      })

      if (currency) {
        const currencyInfo: CurrencyInfo = {
          code: currency.code,
          name: currency.name,
          symbol: currency.symbol,
          exchangeRate: currency.exchangeRate,
          decimalPlaces: currency.decimalPlaces,
          thousandsSeparator: currency.thousandsSeparator,
          decimalSeparator: currency.decimalSeparator,
          symbolPosition: currency.symbolPosition as 'before' | 'after',
          countries: currency.countries,
          isActive: currency.isActive,
        }

        this.currencyCache.set(cacheKey, currencyInfo)
        return currencyInfo
      }

      return null
    } catch (error) {
      console.error('Error fetching currency:', error)
      return null
    }
  }

  /**
   * Get all active currencies
   */
  async getActiveCurrencies(): Promise<CurrencyInfo[]> {
    try {
      const currencies = await prisma.currency.findMany({
        where: { isActive: true },
        orderBy: { code: 'asc' },
      })

      return currencies.map((currency) => ({
        code: currency.code,
        name: currency.name,
        symbol: currency.symbol,
        exchangeRate: currency.exchangeRate,
        decimalPlaces: currency.decimalPlaces,
        thousandsSeparator: currency.thousandsSeparator,
        decimalSeparator: currency.decimalSeparator,
        symbolPosition: currency.symbolPosition as 'before' | 'after',
        countries: currency.countries,
        isActive: currency.isActive,
      }))
    } catch (error) {
      console.error('Error fetching currencies:', error)
      return []
    }
  }

  /**
   * Format price according to currency rules
   */
  async formatPrice(
    amount: number,
    currencyCode: string,
    options: {
      showSymbol?: boolean
      locale?: string
    } = {}
  ): Promise<FormattedPrice> {
    const { showSymbol = true, locale = 'en-US' } = options

    const currency = await this.getCurrency(currencyCode)
    if (!currency) {
      // Fallback formatting
      return {
        amount,
        currency: currencyCode,
        formatted: new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: currencyCode,
        }).format(amount),
        symbol: '$', // Default fallback
      }
    }

    const formattedNumber = this.formatNumber(
      amount,
      currency.decimalPlaces,
      currency.thousandsSeparator,
      currency.decimalSeparator
    )

    let formatted: string
    if (showSymbol) {
      if (currency.symbolPosition === 'before') {
        formatted = `${currency.symbol}${formattedNumber}`
      } else {
        formatted = `${formattedNumber} ${currency.symbol}`
      }
    } else {
      formatted = formattedNumber
    }

    return {
      amount,
      currency: currency.code,
      formatted,
      symbol: currency.symbol,
    }
  }

  /**
   * Convert between currencies
   */
  async convertCurrency(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    if (fromCurrency === toCurrency) {
      return amount
    }

    const exchangeRate = await this.getExchangeRate(fromCurrency, toCurrency)
    return amount * exchangeRate
  }

  /**
   * Get exchange rate between two currencies
   */
  async getExchangeRate(fromCurrency: string, toCurrency: string): Promise<number> {
    const cacheKey = `${fromCurrency}-${toCurrency}`
    const cached = this.exchangeRateCache.get(cacheKey)

    if (cached && Date.now() - cached.lastUpdated.getTime() < this.CACHE_TTL) {
      return cached.rate
    }

    try {
      // First try direct rate
      let exchangeRate = await prisma.exchangeRate.findFirst({
        where: {
          fromCurrency: fromCurrency.toUpperCase(),
          toCurrency: toCurrency.toUpperCase(),
          validTo: {
            gte: new Date(),
          },
        },
        orderBy: {
          validFrom: 'desc',
        },
      })

      // If no direct rate, try reverse rate
      if (!exchangeRate) {
        exchangeRate = await prisma.exchangeRate.findFirst({
          where: {
            fromCurrency: toCurrency.toUpperCase(),
            toCurrency: fromCurrency.toUpperCase(),
            validTo: {
              gte: new Date(),
            },
          },
          orderBy: {
            validFrom: 'desc',
          },
        })

        if (exchangeRate) {
          const rateInfo: ExchangeRateInfo = {
            fromCurrency,
            toCurrency,
            rate: 1 / exchangeRate.rate,
            lastUpdated: new Date(),
            source: exchangeRate.source,
          }
          this.exchangeRateCache.set(cacheKey, rateInfo)
          return rateInfo.rate
        }
      } else {
        const rateInfo: ExchangeRateInfo = {
          fromCurrency,
          toCurrency,
          rate: exchangeRate.rate,
          lastUpdated: new Date(),
          source: exchangeRate.source,
        }
        this.exchangeRateCache.set(cacheKey, rateInfo)
        return rateInfo.rate
      }

      // If no rate found, try via USD
      if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
        const fromUsdRate = await this.getExchangeRate(fromCurrency, 'USD')
        const toUsdRate = await this.getExchangeRate('USD', toCurrency)
        const calculatedRate = fromUsdRate * toUsdRate

        const rateInfo: ExchangeRateInfo = {
          fromCurrency,
          toCurrency,
          rate: calculatedRate,
          lastUpdated: new Date(),
          source: 'calculated',
        }
        this.exchangeRateCache.set(cacheKey, rateInfo)
        return calculatedRate
      }

      // Fallback to 1:1 rate
      return 1
    } catch (error) {
      console.error('Error getting exchange rate:', error)
      return 1
    }
  }

  /**
   * Update exchange rates from external API
   */
  async updateExchangeRates(baseCurrency: string = 'USD'): Promise<void> {
    try {
      // This would typically fetch from an external API like ExchangeRate-API, Fixer.io, etc.
      // For demo purposes, we'll use static rates
      const rates = await this.fetchExchangeRatesFromAPI(baseCurrency)

      const now = new Date()
      const validTo = new Date(now.getTime() + 24 * 60 * 60 * 1000) // Valid for 24 hours

      for (const [currency, rate] of Object.entries(rates)) {
        await prisma.exchangeRate.create({
          data: {
            fromCurrency: baseCurrency,
            toCurrency: currency,
            rate: rate as number,
            source: 'api',
            validFrom: now,
            validTo,
          },
        })
      }

      // Clear cache to force refresh
      this.exchangeRateCache.clear()
    } catch (error) {
      console.error('Error updating exchange rates:', error)
    }
  }

  /**
   * Get currency for a specific country/locale
   */
  async getCurrencyForLocale(locale: string): Promise<string> {
    const countryMappings: Record<string, string> = {
      'en-US': 'USD',
      'en-GB': 'GBP',
      'en-CA': 'CAD',
      'en-AU': 'AUD',
      'es-ES': 'EUR',
      'es-MX': 'MXN',
      'es-AR': 'ARS',
      'fr-FR': 'EUR',
      'de-DE': 'EUR',
      'it-IT': 'EUR',
      'pt-BR': 'BRL',
      'ja-JP': 'JPY',
      'ko-KR': 'KRW',
      'zh-CN': 'CNY',
      'ru-RU': 'RUB',
    }

    return countryMappings[locale] || 'USD'
  }

  /**
   * Format number according to currency rules
   */
  private formatNumber(
    number: number,
    decimalPlaces: number,
    thousandsSeparator: string,
    decimalSeparator: string
  ): string {
    const fixed = number.toFixed(decimalPlaces)
    const [integer, decimal] = fixed.split('.')

    // Add thousands separators
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSeparator)

    if (decimalPlaces > 0 && decimal) {
      return `${formattedInteger}${decimalSeparator}${decimal}`
    }

    return formattedInteger
  }

  /**
   * Fetch exchange rates from external API
   */
  private async fetchExchangeRatesFromAPI(baseCurrency: string): Promise<Record<string, number>> {
    // This is a placeholder for actual API integration
    // You would typically use a service like:
    // - ExchangeRate-API (free tier available)
    // - Fixer.io
    // - CurrencyAPI
    // - Open Exchange Rates

    if (process.env.EXCHANGE_RATE_API_KEY) {
      try {
        const response = await fetch(
          `https://v6.exchangerate-api.com/v6/${process.env.EXCHANGE_RATE_API_KEY}/latest/${baseCurrency}`
        )
        const data = await response.json()
        return data.conversion_rates
      } catch (error) {
        console.error('Error fetching from exchange rate API:', error)
      }
    }

    // Fallback static rates (for development)
    return {
      USD: 1.0,
      EUR: 0.85,
      GBP: 0.73,
      CAD: 1.25,
      AUD: 1.35,
      JPY: 110.0,
      CHF: 0.92,
      CNY: 6.45,
      INR: 74.0,
      BRL: 5.2,
      MXN: 20.0,
      KRW: 1180.0,
      SGD: 1.35,
      NZD: 1.42,
      ZAR: 14.5,
    }
  }

  /**
   * Get pricing rules for different regions
   */
  async getPricingRules(region: string): Promise<{
    taxRate: number
    currency: string
    minimumPrice: number
    roundingRules: string
  }> {
    const rules: Record<string, any> = {
      US: {
        taxRate: 0.08, // 8% average sales tax
        currency: 'USD',
        minimumPrice: 1.0,
        roundingRules: 'nearest_cent',
      },
      EU: {
        taxRate: 0.2, // 20% VAT
        currency: 'EUR',
        minimumPrice: 1.0,
        roundingRules: 'nearest_cent',
      },
      GB: {
        taxRate: 0.2, // 20% VAT
        currency: 'GBP',
        minimumPrice: 1.0,
        roundingRules: 'nearest_penny',
      },
      CA: {
        taxRate: 0.13, // HST
        currency: 'CAD',
        minimumPrice: 1.0,
        roundingRules: 'nearest_cent',
      },
      AU: {
        taxRate: 0.1, // GST
        currency: 'AUD',
        minimumPrice: 1.0,
        roundingRules: 'nearest_cent',
      },
    }

    return rules[region] || rules['US']
  }

  /**
   * Clear currency cache
   */
  clearCache(): void {
    this.currencyCache.clear()
    this.exchangeRateCache.clear()
  }
}
