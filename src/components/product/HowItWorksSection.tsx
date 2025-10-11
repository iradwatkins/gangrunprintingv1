/**
 * How It Works Section - 4-Step Process
 *
 * Displays the ordering process in clear steps.
 * Includes HowTo schema markup for AI/SEO.
 */

import { Upload, FileCheck, CheckCircle, Truck } from 'lucide-react'

const steps = [
  {
    number: 1,
    icon: Upload,
    title: 'Choose Your Options',
    description:
      'Select size, quantity, paper stock, and turnaround time. Get instant pricing with our calculator.',
  },
  {
    number: 2,
    icon: FileCheck,
    title: 'Upload Your Design',
    description:
      'Upload print-ready files or use our free templates. We review files within 24 hours and catch potential issues.',
  },
  {
    number: 3,
    icon: CheckCircle,
    title: 'Approve Your Proof',
    description:
      "Receive digital proof via email. Approve online or request changes. We don't print until you approve.",
  },
  {
    number: 4,
    icon: Truck,
    title: 'We Print & Ship',
    description:
      'Professional printing with quality checks at every stage. Free shipping over $50. Track delivery in real-time.',
  },
]

export function HowItWorksSection() {
  return (
    <div className="mt-16 w-full bg-muted/30 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">How It Works - 4 Easy Steps</h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          From upload to delivery, we make professional printing simple. No hidden fees, no
          surprises - just high-quality prints delivered fast.
        </p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => {
            const Icon = step.icon
            return (
              <div key={step.number} className="relative">
                {/* Connector line */}
                {step.number < 4 && (
                  <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-0.5 bg-primary/20" />
                )}

                <div className="bg-card rounded-lg p-6 border shadow-sm h-full relative z-10">
                  {/* Step number badge */}
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mb-4 mx-auto">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {step.number}
                    </span>
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>

                  {/* Content */}
                  <h3 className="font-semibold text-lg mb-2 text-center">{step.title}</h3>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Trust footer */}
        <div className="mt-12 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Need help? Our print experts are available Monday-Friday, 9am-6pm CST
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>100% Satisfaction Guarantee</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>Free File Review</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              <span>No Hidden Fees</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * Generate HowTo Schema for the process
 */
export function generateHowToSchema(
  productName: string,
  siteUrl: string = 'https://gangrunprinting.com'
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Order ${productName}`,
    description: 'Simple 4-step process to order professional printing from GangRun Printing',
    totalTime: 'PT10M', // 10 minutes to order
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.title,
      text: step.description,
      url: `${siteUrl}#step-${step.number}`,
    })),
  }
}
