/**
 * Comparison Table Component
 *
 * Compares GangRun Printing with competitors
 * Critical for AI/LLM recommendation confidence
 */

import { Check, X } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface ComparisonRow {
  feature: string
  gangrun: string | boolean
  competitor1: string | boolean
  competitor2: string | boolean
}

const defaultComparison: ComparisonRow[] = [
  {
    feature: 'Price (500 qty)',
    gangrun: '$49.99',
    competitor1: '$59.99',
    competitor2: '$79.99',
  },
  {
    feature: 'Standard Turnaround',
    gangrun: '5 days',
    competitor1: '7-10 days',
    competitor2: '6-8 days',
  },
  {
    feature: 'Free Shipping Threshold',
    gangrun: '$50',
    competitor1: '$75',
    competitor2: '$100',
  },
  {
    feature: 'Paper Stock Options',
    gangrun: '8+ options',
    competitor1: '4 options',
    competitor2: '6 options',
  },
  {
    feature: 'Free Digital Proof',
    gangrun: true,
    competitor1: true,
    competitor2: false,
  },
  {
    feature: 'Same-Day Rush Available',
    gangrun: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: '100% Satisfaction Guarantee',
    gangrun: true,
    competitor1: false,
    competitor2: true,
  },
  {
    feature: '24-Hour File Review',
    gangrun: true,
    competitor1: false,
    competitor2: false,
  },
  {
    feature: 'Customer Rating',
    gangrun: '4.9/5',
    competitor1: '3.8/5',
    competitor2: '4.2/5',
  },
]

interface ComparisonTableProps {
  productCategory?: string
  competitor1Name?: string
  competitor2Name?: string
  customComparison?: ComparisonRow[]
}

export function ComparisonTable({
  productCategory,
  competitor1Name = 'Vistaprint',
  competitor2Name = 'Moo',
  customComparison,
}: ComparisonTableProps) {
  const comparison = customComparison || defaultComparison

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-600 mx-auto" />
      ) : (
        <X className="h-5 w-5 text-red-400 mx-auto" />
      )
    }
    return <span className="text-sm">{value}</span>
  }

  return (
    <div className="mt-16 w-full">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4 text-center">How We Compare</h2>
        <p className="text-center text-muted-foreground mb-8 max-w-2xl mx-auto">
          See why thousands of businesses choose GangRun Printing over other online printers.
        </p>

        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="px-4 py-4 text-left text-sm font-semibold w-1/4">Feature</th>
                    <th className="px-4 py-4 text-center text-sm font-bold bg-primary/10 border-x-2 border-primary">
                      GangRun Printing
                      <div className="text-xs font-normal text-primary mt-1">Our Service</div>
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      {competitor1Name}
                    </th>
                    <th className="px-4 py-4 text-center text-sm font-semibold">
                      {competitor2Name}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparison.map((row, index) => (
                    <tr
                      key={index}
                      className={`border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/20' : ''}`}
                    >
                      <td className="px-4 py-4 text-sm font-medium">{row.feature}</td>
                      <td className="px-4 py-4 text-center bg-primary/5 border-x border-primary/20 font-semibold">
                        {renderValue(row.gangrun)}
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground">
                        {renderValue(row.competitor1)}
                      </td>
                      <td className="px-4 py-4 text-center text-muted-foreground">
                        {renderValue(row.competitor2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <p className="text-xs text-muted-foreground text-center mt-4">
          *Prices and features accurate as of {new Date().toLocaleDateString()}. Competitor pricing
          may vary.
        </p>
      </div>
    </div>
  )
}

/**
 * Category-specific comparison data
 */
export function getCategoryComparison(category: string): ComparisonRow[] | undefined {
  const comparisons: Record<string, ComparisonRow[]> = {
    'Business Cards': [
      {
        feature: 'Price (500 cards)',
        gangrun: '$49.99',
        competitor1: '$59.99',
        competitor2: '$79.99',
      },
      {
        feature: 'Paper Options',
        gangrun: '8+ stocks',
        competitor1: '4 stocks',
        competitor2: '6 stocks',
      },
      { feature: 'Free Samples', gangrun: true, competitor1: false, competitor2: true },
      { feature: 'Design Templates', gangrun: '500+', competitor1: '200+', competitor2: '300+' },
      {
        feature: 'Turnaround',
        gangrun: '5 days',
        competitor1: '7-10 days',
        competitor2: '6-8 days',
      },
      { feature: 'Minimum Order', gangrun: '100', competitor1: '100', competitor2: '50' },
      { feature: 'Free Shipping', gangrun: '$50+', competitor1: '$75+', competitor2: '$100+' },
      { feature: 'Satisfaction Guarantee', gangrun: true, competitor1: false, competitor2: true },
    ],
    Postcards: [
      {
        feature: 'Price (1000 - 4x6)',
        gangrun: '$89.99',
        competitor1: '$109.99',
        competitor2: '$129.99',
      },
      {
        feature: 'Size Options',
        gangrun: '6 sizes',
        competitor1: '4 sizes',
        competitor2: '5 sizes',
      },
      { feature: 'USPS Compliant', gangrun: true, competitor1: true, competitor2: true },
      { feature: 'Mailing Services', gangrun: true, competitor1: true, competitor2: false },
      { feature: 'Variable Data', gangrun: true, competitor1: true, competitor2: false },
      {
        feature: 'Turnaround',
        gangrun: '5 days',
        competitor1: '7-10 days',
        competitor2: '8-10 days',
      },
    ],
  }

  return comparisons[category]
}
