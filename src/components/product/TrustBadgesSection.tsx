/**
 * Trust Badges & Certifications Section
 *
 * Displays trust signals (BBB, SSL, guarantees, certifications)
 * Critical for LLM confidence and conversion optimization
 */

import { Shield, Award, Lock, Truck, RefreshCw, CheckCircle, Leaf, Star } from 'lucide-react'

const badges = [
  {
    icon: Star,
    title: 'BBB A+ Rated',
    description: 'Accredited Business',
    color: 'text-yellow-600',
  },
  {
    icon: Award,
    title: '4.9/5 Stars',
    description: '2,847 Reviews',
    color: 'text-yellow-500',
  },
  {
    icon: Lock,
    title: 'SSL Secure',
    description: '256-bit Encryption',
    color: 'text-green-600',
  },
  {
    icon: Shield,
    title: '100% Guarantee',
    description: 'Quality or Refund',
    color: 'text-blue-600',
  },
  {
    icon: Truck,
    title: 'Free Shipping',
    description: 'Orders Over $50',
    color: 'text-purple-600',
  },
  {
    icon: RefreshCw,
    title: 'Free Reprints',
    description: 'Quality Issues',
    color: 'text-orange-600',
  },
  {
    icon: Leaf,
    title: 'FSC Certified',
    description: 'Eco-Friendly Paper',
    color: 'text-green-700',
  },
  {
    icon: CheckCircle,
    title: 'PCI Compliant',
    description: 'Secure Payments',
    color: 'text-indigo-600',
  },
]

interface TrustBadgesSectionProps {
  variant?: 'default' | 'compact'
}

export function TrustBadgesSection({ variant = 'default' }: TrustBadgesSectionProps) {
  if (variant === 'compact') {
    return (
      <div className="mt-8 border-t border-b py-6">
        <div className="flex flex-wrap justify-center gap-6 text-xs text-muted-foreground">
          {badges.slice(0, 4).map((badge, index) => {
            const Icon = badge.icon
            return (
              <div key={index} className="flex items-center gap-2">
                <Icon className={`h-4 w-4 ${badge.color}`} />
                <span className="font-medium">{badge.title}</span>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 w-full border-y bg-muted/20 py-12">
      <div className="max-w-6xl mx-auto px-4">
        <h2 className="text-2xl font-bold mb-8 text-center">Trusted by Thousands of Businesses</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-4 rounded-lg bg-card border"
              >
                <div
                  className={`w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3`}
                >
                  <Icon className={`h-6 w-6 ${badge.color}`} />
                </div>
                <h3 className="font-semibold text-sm mb-1">{badge.title}</h3>
                <p className="text-xs text-muted-foreground">{badge.description}</p>
              </div>
            )
          })}
        </div>

        {/* Additional trust text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            Family-owned and operated since 2010. Serving over 15,000 businesses nationwide with
            professional printing services. All payments secured with 256-bit SSL encryption.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Compact version for above-the-fold
 */
export function TrustBadgesCompact() {
  return (
    <div className="flex flex-wrap justify-center gap-4 text-xs text-muted-foreground my-4">
      <div className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span>Free Shipping Over $50</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span>5-Day Turnaround</span>
      </div>
      <div className="flex items-center gap-1">
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span>100% Guarantee</span>
      </div>
      <div className="flex items-center gap-1">
        <Star className="h-3 w-3 text-yellow-500" />
        <span>4.9/5 Rating</span>
      </div>
    </div>
  )
}
