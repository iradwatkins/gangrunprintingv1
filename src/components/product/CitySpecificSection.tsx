/**
 * City-Specific Content Section
 *
 * Displays location-specific content for city-based products
 * Critical for local SEO and AI search recommendations
 */

import { MapPin, Truck, Clock, Building } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface CityData {
  name: string
  stateCode: string
  population?: number | null
  topIndustries?: string[]
  neighborhoods?: string[]
  shippingNotes?: string
}

interface CitySpecificSectionProps {
  city: CityData
  productName: string
}

export function CitySpecificSection({ city, productName }: CitySpecificSectionProps) {
  return (
    <div className="mt-16 w-full bg-primary/5 py-16">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">
            {productName} in {city.name}, {city.stateCode}
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Professional printing services proudly serving {city.name} businesses. Fast local
            delivery, exceptional quality, and personalized service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Local Delivery */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Truck className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Fast Local Delivery</h3>
              <p className="text-sm text-muted-foreground">
                1-2 day delivery to {city.name} metro area
              </p>
            </CardContent>
          </Card>

          {/* Rush Service */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Clock className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Same-Day Printing</h3>
              <p className="text-sm text-muted-foreground">
                Orders before 10am (local pickup available)
              </p>
            </CardContent>
          </Card>

          {/* Local Service */}
          <Card>
            <CardContent className="pt-6 text-center">
              <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Serving {city.name}</h3>
              <p className="text-sm text-muted-foreground">
                {city.population
                  ? `${(city.population / 1000000).toFixed(1)}M+ residents`
                  : 'Since 2010'}
              </p>
            </CardContent>
          </Card>

          {/* Business Focus */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Building className="h-10 w-10 text-primary mx-auto mb-3" />
              <h3 className="font-semibold mb-2">Local Businesses</h3>
              <p className="text-sm text-muted-foreground">500+ {city.name} companies trust us</p>
            </CardContent>
          </Card>
        </div>

        {/* Neighborhoods served */}
        {city.neighborhoods && city.neighborhoods.length > 0 && (
          <div className="mb-12">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Neighborhoods We Serve in {city.name}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {city.neighborhoods.map((neighborhood, index) => (
                <span key={index} className="px-4 py-2 bg-card border rounded-full text-sm">
                  {neighborhood}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Industries served */}
        {city.topIndustries && city.topIndustries.length > 0 && (
          <div className="mb-8">
            <h3 className="text-xl font-semibold mb-4 text-center">
              Industries We Serve in {city.name}
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {city.topIndustries.map((industry, index) => (
                <span
                  key={index}
                  className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-lg text-sm font-medium"
                >
                  {industry}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Shipping notes */}
        {city.shippingNotes && (
          <div className="text-center">
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              <strong>Shipping to {city.name}:</strong> {city.shippingNotes}
            </p>
          </div>
        )}

        {/* City-specific CTA */}
        <div className="text-center mt-8">
          <p className="text-lg font-medium mb-4">
            Ready to get started with your {productName} order in {city.name}?
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Get instant pricing and place your order online in minutes. Or call us at{' '}
            <a className="text-primary hover:underline" href="tel:1-877-426-4786">
              1-877-426-4786
            </a>{' '}
            to speak with a {city.name} print specialist.
          </p>
        </div>
      </div>
    </div>
  )
}

/**
 * Default city data generator
 */
export function getDefaultCityData(cityName: string, stateCode: string): CityData {
  // Popular neighborhoods for major cities
  const neighborhoodMap: Record<string, string[]> = {
    Chicago: ['Loop', 'Lincoln Park', 'Wicker Park', 'River North', 'Hyde Park', 'West Loop'],
    'New York': ['Manhattan', 'Brooklyn', 'Queens', 'Bronx', 'Staten Island'],
    'Los Angeles': ['Downtown', 'Hollywood', 'Santa Monica', 'Venice', 'Beverly Hills'],
    Houston: ['Downtown', 'Midtown', 'Montrose', 'Heights', 'Medical Center'],
    Phoenix: ['Downtown', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler'],
    Dallas: ['Downtown', 'Uptown', 'Deep Ellum', 'Oak Lawn', 'Bishop Arts'],
  }

  // Common industries actually served by GangRun Printing
  const defaultIndustries = [
    'Small Businesses',
    'Club Promoters',
    'Event Planners',
    'Painters & Contractors',
    'Cleaning Services',
    'Real Estate Agents',
    'Restaurants & Bars',
    'Local Events',
  ]

  return {
    name: cityName,
    stateCode,
    topIndustries: defaultIndustries,
    neighborhoods: neighborhoodMap[cityName] || [],
    shippingNotes: `Standard delivery is 3-5 business days. Expedited shipping available for next-day or 2-day delivery to ${cityName}.`,
  }
}
