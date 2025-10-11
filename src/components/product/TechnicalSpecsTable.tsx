/**
 * Technical Specifications Table Component
 *
 * Displays product specifications in a structured table format.
 * Critical for LLM/AI search - provides factual, structured data.
 * Includes Schema.org PropertyValue markup.
 */

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface TechnicalSpec {
  name: string
  value: string
}

interface TechnicalSpecsTableProps {
  specs: TechnicalSpec[]
  title?: string
}

export function TechnicalSpecsTable({
  specs,
  title = 'Technical Specifications',
}: TechnicalSpecsTableProps) {
  if (!specs || specs.length === 0) return null

  return (
    <div className="mt-16 w-full">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">{title}</h2>

        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <tbody>
                {specs.map((spec, index) => (
                  <tr
                    key={index}
                    className={`border-b last:border-b-0 ${index % 2 === 0 ? 'bg-muted/30' : ''}`}
                  >
                    <td className="px-6 py-4 font-semibold text-sm w-1/3">{spec.name}</td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          Have questions about specifications?{' '}
          <a className="text-primary hover:underline" href="/contact">
            Contact our print experts
          </a>
        </p>
      </div>
    </div>
  )
}

/**
 * Generate Schema.org PropertyValue markup for specs
 */
export function generateSpecsSchema(specs: TechnicalSpec[]) {
  return specs.map((spec) => ({
    '@type': 'PropertyValue',
    name: spec.name,
    value: spec.value,
  }))
}

/**
 * Default specs generator based on product category
 */
export function getDefaultSpecs(categoryName: string): TechnicalSpec[] {
  const commonSpecs: TechnicalSpec[] = [
    { name: 'File Formats Accepted', value: 'PDF, AI, EPS, PSD, InDesign' },
    { name: 'Minimum Resolution', value: '300 DPI required' },
    { name: 'Color Mode', value: 'CMYK (RGB converted)' },
    { name: 'Turnaround Time', value: '5-7 business days standard' },
    { name: 'Rush Options', value: '2-3 day available' },
    { name: 'Shipping', value: 'Free over $50' },
    { name: 'Geographic Coverage', value: 'USA + Canada' },
  ]

  // Category-specific specs
  const categorySpecs: Record<string, TechnicalSpec[]> = {
    'Business Cards': [
      { name: 'Finished Size', value: '3.5" x 2" (standard)' },
      { name: 'Paper Stock Options', value: '14pt, 16pt, 18pt C2S Cardstock' },
      { name: 'Coating Options', value: 'Gloss, Matte, Uncoated, Spot UV' },
      { name: 'Bleed Requirement', value: '0.125" all sides' },
      { name: 'Minimum Order', value: '100 pieces' },
      { name: 'Maximum Order', value: '10,000 pieces' },
      ...commonSpecs,
    ],
    Postcards: [
      { name: 'Available Sizes', value: '4"x6", 5"x7", 6"x9", 6"x11"' },
      { name: 'Paper Stock Options', value: '14pt, 16pt C2S Cardstock' },
      { name: 'Coating Options', value: 'Gloss, Matte, High Gloss UV' },
      { name: 'Bleed Requirement', value: '0.125" all sides' },
      { name: 'Minimum Order', value: '100 pieces' },
      { name: 'Maximum Order', value: '25,000 pieces' },
      { name: 'USPS Compliant', value: 'Yes (for mailing sizes)' },
      ...commonSpecs,
    ],
    Flyers: [
      { name: 'Available Sizes', value: '4"x6", 5.5"x8.5", 8.5"x11", 11"x17"' },
      { name: 'Paper Stock Options', value: '80lb, 100lb Gloss/Matte Text, 14pt Cardstock' },
      { name: 'Coating Options', value: 'Gloss, Matte, Uncoated' },
      { name: 'Bleed Requirement', value: '0.125" all sides' },
      { name: 'Minimum Order', value: '50 pieces' },
      { name: 'Maximum Order', value: '50,000 pieces' },
      ...commonSpecs,
    ],
    Brochures: [
      { name: 'Folding Options', value: 'Half-fold, Tri-fold, Z-fold, Gate-fold' },
      { name: 'Finished Sizes', value: '8.5"x11", 8.5"x14", 11"x17" (flat)' },
      { name: 'Paper Stock Options', value: '80lb, 100lb Gloss/Matte Text' },
      { name: 'Coating Options', value: 'Gloss, Matte, Spot UV' },
      { name: 'Bleed Requirement', value: '0.125" all sides' },
      { name: 'Minimum Order', value: '50 pieces' },
      ...commonSpecs,
    ],
    Banners: [
      { name: 'Material', value: '13oz Vinyl, Mesh, Fabric' },
      { name: 'Available Sizes', value: "Custom sizes up to 10' x 50'" },
      { name: 'Finishing Options', value: 'Grommets, Pole Pockets, Hem' },
      { name: 'Indoor/Outdoor', value: 'Both (weather-resistant)' },
      { name: 'Resolution', value: '150 DPI acceptable for large format' },
      { name: 'Turnaround', value: '3-5 business days' },
      ...commonSpecs.filter((s) => s.name !== 'Minimum Resolution'),
    ],
  }

  return categorySpecs[categoryName] || commonSpecs
}
