/**
 * FAQ Schema Component
 *
 * Generates JSON-LD structured data for FAQ pages.
 * AI crawlers (ChatGPT, Claude, Perplexity) prefer structured data.
 *
 * @see https://schema.org/FAQPage
 * @see https://developers.google.com/search/docs/appearance/structured-data/faqpage
 */

import React from 'react'

export interface FAQItem {
  question: string
  answer: string
  category?: string
}

interface FAQSchemaProps {
  faqs: FAQItem[]
  pageTitle?: string
  pageDescription?: string
}

/**
 * Generates FAQ schema markup for SEO
 *
 * Benefits:
 * - Appears in Google rich results
 * - AI bots can easily parse Q&A format
 * - Increases chances of being cited in AI answers
 */
export function FAQSchema({ faqs, pageTitle, pageDescription }: FAQSchemaProps) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    ...(pageTitle && { name: pageTitle }),
    ...(pageDescription && { description: pageDescription }),
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  )
}

/**
 * FAQ Display Component
 *
 * Renders FAQ items with clean UI
 * Pairs with FAQSchema for complete SEO + UX
 */
interface FAQDisplayProps {
  faqs: FAQItem[]
  showCategory?: boolean
  className?: string
}

export function FAQDisplay({ faqs, showCategory = false, className = '' }: FAQDisplayProps) {
  return (
    <div className={`space-y-6 ${className}`}>
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="border-b border-gray-200 pb-6 last:border-0"
        >
          {showCategory && faq.category && (
            <span className="inline-block px-3 py-1 mb-3 text-xs font-medium text-blue-600 bg-blue-50 rounded-full">
              {faq.category}
            </span>
          )}
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            {faq.question}
          </h3>
          <div className="text-gray-600 prose prose-sm max-w-none">
            {faq.answer}
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Combined FAQ Page Component
 *
 * Use this for complete FAQ pages with schema + display
 *
 * Example usage:
 * <FAQPage
 *   title="Business Card FAQ"
 *   description="Common questions about business card printing"
 *   faqs={businessCardFAQs}
 * />
 */
interface FAQPageProps {
  title: string
  description?: string
  faqs: FAQItem[]
  showCategory?: boolean
}

export function FAQPage({ title, description, faqs, showCategory }: FAQPageProps) {
  return (
    <>
      <FAQSchema
        faqs={faqs}
        pageTitle={title}
        pageDescription={description}
      />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {title}
          </h1>
          {description && (
            <p className="text-xl text-gray-600">
              {description}
            </p>
          )}
        </div>

        <FAQDisplay
          faqs={faqs}
          showCategory={showCategory}
        />
      </div>
    </>
  )
}
