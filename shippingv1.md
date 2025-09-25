# Shipping System Implementation - FedEx & Southwest Cargo

## Overview

The shipping system implements a provider-based architecture supporting multiple carriers with real-time rate calculation, label generation, and package tracking. The system currently supports FedEx and Southwest Cargo, with a modular design that allows easy addition of new carriers.

## Architecture

### Core Components

1. **Provider Interface** (`/src/lib/shipping/interfaces.ts`)
2. **Provider Implementations**
   - FedEx Provider (`/src/lib/shipping/providers/fedex.ts`)
   - Southwest Cargo Provider (`/src/lib/shipping/providers/southwest-cargo.ts`)
3. **Shipping Calculator** (`/src/lib/shipping/shipping-calculator.ts`)
4. **Configuration** (`/src/lib/shipping/config.ts`)
5. **Weight Calculator** (`/src/lib/shipping/weight-calculator.ts`)

## Provider Interface

```typescript
export interface ShippingProvider {
  carrier: Carrier

  // Get available shipping rates
  getRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]>

  // Create a shipping label
  createLabel(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[],
    serviceCode: string
  ): Promise<ShippingLabel>

  // Track a shipment
  track(trackingNumber: string): Promise<TrackingInfo>

  // Validate an address
  validateAddress(address: ShippingAddress): Promise<boolean>

  // Cancel a shipment (optional)
  cancelShipment?(trackingNumber: string): Promise<boolean>
}
```

## FedEx Implementation

### Configuration

```typescript
// Environment Variables Required
FEDEX_ACCOUNT_NUMBER=your-account-number
FEDEX_API_KEY=your-api-key
FEDEX_SECRET_KEY=your-secret-key
FEDEX_API_ENDPOINT=https://apis.fedex.com  // or sandbox endpoint
FEDEX_TEST_MODE=true  // Use sandbox for testing
```

### Key Features

1. **OAuth2 Authentication**
   - Automatic token management with expiry handling
   - Token caching for performance
   - Automatic retry on authentication failure

2. **Available Services**
   - FedEx Ground (3-5 business days)
   - FedEx Home Delivery (residential ground)
   - FedEx 2Day
   - FedEx Standard Overnight

3. **Rate Calculation**
   ```typescript
   // Example usage
   const fedexProvider = new FedExProvider()
   const rates = await fedexProvider.getRates(
     fromAddress,
     toAddress,
     packages
   )
   ```

4. **Label Generation**
   - PDF format (4x6 standard shipping label)
   - Automatic tracking number generation
   - Insurance options available

5. **Package Tracking**
   - Real-time tracking events
   - Status mapping to standard statuses
   - Delivery confirmation

### API Integration Details

```typescript
class FedExProvider implements ShippingProvider {
  // OAuth2 token management
  private async authenticate(): Promise<void> {
    const response = await axios.post(
      '/oauth/token',
      {
        grant_type: 'client_credentials',
        client_id: process.env.FEDEX_API_KEY,
        client_secret: process.env.FEDEX_SECRET_KEY
      }
    )
    this.authToken = response.data
    this.tokenExpiry = new Date(Date.now() + (this.authToken.expires_in - 300) * 1000)
  }

  // Rate calculation with markup
  async getRates(...): Promise<ShippingRate[]> {
    const markup = 1 + (fedexConfig.markupPercentage || 0) / 100
    // Apply 10% markup to FedEx rates by default
  }
}
```

## Southwest Cargo Implementation

### Configuration

```typescript
// Environment Variables (Optional - uses hardcoded rates)
SOUTHWEST_CARGO_API_KEY=optional-api-key
SOUTHWEST_CARGO_RATE_PER_POUND=2.50
SOUTHWEST_CARGO_MINIMUM_CHARGE=25.00
```

### Key Features

1. **Service Types**
   - **Southwest Cargo Pickup** (Standard, 3 days)
     - Cheaper option
     - Standard delivery time
   - **Southwest Cargo Dash** (Express, 1-2 days)
     - Premium service
     - Next available flight
     - Guaranteed delivery

2. **Pricing Structure**

   **Pickup Service Rates:**
   ```typescript
   const PICKUP_TIERS = [
     { maxWeight: 50, baseRate: 85.00, handlingFee: 10.00 },
     { maxWeight: 100, baseRate: 133.00, handlingFee: 10.00 },
     { maxWeight: Infinity, baseRate: 133.00, additionalPerPound: 1.75, handlingFee: 10.00 }
   ]
   ```

   **Dash Service Rates:**
   ```typescript
   const DASH_TIERS = [
     { maxWeight: 50, baseRate: 80.00, additionalPerPound: 1.75 },
     { maxWeight: Infinity, baseRate: 102.00, additionalPerPound: 1.75 }
   ]
   ```

3. **Service Area Coverage**
   ```typescript
   // States where Southwest Cargo is available
   const SERVICE_AREA = [
     'TX', 'OK', 'NM', 'AR', 'LA', 'AZ', 'CA', 'NV',
     'CO', 'UT', 'FL', 'GA', 'AL', 'TN', 'MS', 'SC',
     'NC', 'KY', 'MO', 'KS'
   ]
   ```

4. **Rate Calculation Logic**
   ```typescript
   private calculatePickupRate(weight: number): number {
     for (const tier of pickupTiers) {
       if (weight <= tier.maxWeight) {
         const additionalCost = weight * tier.additionalPerPound
         return tier.baseRate + additionalCost + tier.handlingFee
       }
     }
   }
   ```

### Manual Process Integration

Southwest Cargo typically uses a manual booking process. The implementation:
- Generates mock tracking numbers (format: `SWC[timestamp][random]`)
- Returns placeholder label URLs
- Provides basic tracking information
- Can be enhanced with actual API integration when available

## Shipping Calculator

The central orchestrator for all shipping operations:

```typescript
export class ShippingCalculator {
  private providers: Map<Carrier, ShippingProvider>

  constructor() {
    // Initialize enabled providers based on config
    if (fedexConfig.enabled) {
      this.providers.set(Carrier.FEDEX, new FedExProvider())
    }
    if (southwestCargoConfig.enabled) {
      this.providers.set(Carrier.SOUTHWEST_CARGO, new SouthwestCargoProvider())
    }
  }

  // Get rates from all carriers with caching
  async getAllRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[],
    useCache: boolean = true
  ): Promise<ShippingRate[]> {
    // Redis caching for 30 minutes
    const cacheKey = this.getCacheKey(fromAddress, toAddress, packages)

    // Parallel rate fetching from all providers
    const ratePromises = Array.from(this.providers.values()).map(
      provider => provider.getRates(fromAddress, toAddress, packages)
    )

    const rates = await Promise.all(ratePromises)
    return rates.flat().sort((a, b) => a.rateAmount - b.rateAmount)
  }
}
```

## API Endpoints

### 1. Calculate Shipping Rates
**Endpoint:** `POST /api/shipping/calculate`

```typescript
// Request Body
{
  toAddress: {
    street: "123 Main St",
    city: "Dallas",
    state: "TX",
    zipCode: "75201",
    country: "US",
    isResidential: true
  },
  items: [
    {
      productId: "prod_123",
      quantity: 100,
      width: 8.5,
      height: 11,
      paperStockId: "stock_456"
    }
  ]
}

// Response
{
  success: true,
  rates: [
    {
      carrier: "FEDEX",
      serviceCode: "FEDEX_GROUND",
      serviceName: "FedEx Ground",
      rateAmount: 12.99,
      currency: "USD",
      estimatedDays: 3
    },
    {
      carrier: "SOUTHWEST_CARGO",
      serviceCode: "SOUTHWEST_CARGO_DASH",
      serviceName: "Southwest Cargo Dash",
      rateAmount: 29.99,
      currency: "USD",
      estimatedDays: 1,
      isGuaranteed: true
    }
  ],
  totalWeight: "5.25"
}
```

### 2. Create Shipping Label
**Endpoint:** `POST /api/shipping/label`

```typescript
// Request Body
{
  carrier: "FEDEX",
  serviceCode: "FEDEX_GROUND",
  fromAddress: { ... },
  toAddress: { ... },
  packages: [ ... ]
}

// Response
{
  trackingNumber: "772893456789",
  labelUrl: "/api/shipping/label/download/772893456789",
  labelFormat: "PDF",
  carrier: "FEDEX"
}
```

### 3. Track Shipment
**Endpoint:** `GET /api/shipping/track/[tracking]`

```typescript
// Response
{
  trackingNumber: "772893456789",
  carrier: "FEDEX",
  status: "in_transit",
  currentLocation: "Memphis, TN",
  estimatedDelivery: "2024-01-20T15:00:00Z",
  events: [
    {
      timestamp: "2024-01-18T10:30:00Z",
      location: "Houston, TX",
      status: "picked_up",
      description: "Package picked up"
    }
  ]
}
```

## Frontend Component

### ShippingSelection Component

```tsx
<ShippingSelection
  onSelect={(provider) => handleShippingSelect(provider)}
  selectedId="fedex"
  rates={dynamicRates}  // Optional: Use API rates
  loading={isCalculating}
/>
```

Features:
- Visual shipping method selection
- Dynamic rate display
- Loading states
- Provider feature comparison
- Insurance information

## Weight Calculation

The system automatically calculates package weight based on:
- Paper stock weight (per square inch)
- Product dimensions (width × height)
- Quantity
- Additional packaging weight

```typescript
export function calculateWeight(params: WeightCalculationParams): number {
  const area = params.width * params.height
  const paperWeight = area * params.paperStockWeight * params.quantity
  const packagingWeight = 0.5 // Default 0.5 lbs for packaging
  return roundWeight(paperWeight + packagingWeight)
}
```

## Caching Strategy

1. **Rate Caching**
   - Redis-based caching
   - 30-minute expiry
   - Cache key based on addresses and package details

2. **Database Storage**
   - Save rates to database for orders
   - Retrieve saved rates during checkout
   - Automatic expiry handling

## Error Handling

All providers implement graceful error handling:
- Network failures return empty rate arrays
- Authentication failures trigger retry logic
- Invalid addresses return validation errors
- Exponential backoff for API rate limiting

## Configuration Management

### Default Configuration
```typescript
export const DEFAULT_SENDER_ADDRESS = {
  street: '1234 Print Shop Way',
  city: 'Houston',
  state: 'TX',
  zipCode: '77001',
  country: 'US',
  isResidential: false
}

// Markup percentages by carrier
const CARRIER_MARKUPS = {
  FEDEX: 10,           // 10% markup
  UPS: 10,             // 10% markup
  SOUTHWEST_CARGO: 5   // 5% markup (lower for freight)
}
```

## Testing

### Test Mode Configuration
- FedEx: Use sandbox environment (`FEDEX_TEST_MODE=true`)
- UPS: Use test environment (`UPS_TEST_MODE=true`)
- Southwest Cargo: Always uses calculated rates (no external API)

### Sample Test Request
```bash
curl -X POST http://localhost:3002/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "toAddress": {
      "street": "123 Main St",
      "city": "Dallas",
      "state": "TX",
      "zipCode": "75201"
    },
    "items": [{
      "quantity": 100,
      "width": 8.5,
      "height": 11,
      "paperStockWeight": 0.0015
    }]
  }'
```

## Future Enhancements

1. **Additional Carriers**
   - USPS integration
   - DHL Express
   - Regional carriers

2. **Advanced Features**
   - Multi-package shipments
   - International shipping
   - Customs documentation
   - Return labels
   - Scheduled pickups

3. **Southwest Cargo API**
   - Replace manual process with actual API when available
   - Real-time tracking integration
   - Electronic label generation

## Security Considerations

1. **API Key Management**
   - Store in environment variables
   - Never commit to repository
   - Rotate regularly

2. **Data Privacy**
   - Encrypt sensitive address data
   - PCI compliance for shipping insurance values
   - GDPR compliance for EU addresses

3. **Rate Limiting**
   - Implement request throttling
   - Cache aggressively to reduce API calls
   - Monitor usage against carrier limits

## Monitoring & Logging

1. **Metrics to Track**
   - API response times
   - Rate calculation accuracy
   - Label generation success rate
   - Tracking update frequency

2. **Error Logging**
   - Failed API requests
   - Invalid address validations
   - Rate calculation errors
   - Label generation failures

## Southwest Cargo Airport Locations

The system includes a comprehensive database of Southwest Cargo airport locations with complete address and operating hours information. This data is stored in the database and can be accessed via API endpoints.

### Airport Data Structure

```typescript
interface Airport {
  code: string           // IATA airport code (e.g., 'DAL', 'HOU')
  name: string          // City/location name
  carrier: string       // 'Southwest Airlines Cargo'
  operator?: string     // Third-party operator if applicable
  address: string       // Street address
  city: string
  state: string
  zip: string
  hours: Record<string, string>  // Operating hours by day
}
```

### Major Hub Locations

#### Texas Hubs (Primary Service Area)
- **DAL - Dallas Love Field**
  - Address: 7510 Aviation Place Ste 110, Dallas, TX 75235
  - Hours: Mon-Fri 4:30am-1:30am, Sat 4:30am-12:00am, Sun 4:30am-1:30am

- **HOU - Houston Hobby**
  - Address: 7910 Airport Blvd, Houston, TX 77061
  - Hours: Mon 4:00am-12:00am, Tue-Fri Open 24 hours, Sat-Sun 5:00am-12:00am

- **IAH - Houston Intercontinental**
  - Address: 3340B Greens Rd Ste 600, Houston, TX 77032
  - Operator: Accelerated, Inc.
  - Hours: Mon-Fri 8:00am-10:00pm, Sat 8:00am-12:00pm, Sun Closed

- **AUS - Austin**
  - Address: 3400 Spirit of Texas Dr Ste 250, Austin, TX 78719
  - Hours: Mon-Fri 4:30am-1:30am, Sat 5:30am-9:00pm, Sun 4:30am-9:00pm

- **SAT - San Antonio**
  - Address: 10000 John Saunders, San Antonio, TX 78216
  - Hours: Mon-Fri 4:15am-12:00am, Sat-Sun 4:15am-11:00pm

#### Regional Hubs
- **PHX - Phoenix**: 1251 S 25th Place Ste 16, Phoenix, AZ 85034
- **LAS - Las Vegas**: 6055 Surrey St Ste 121, Las Vegas, NV 89119
- **DEN - Denver**: 7640 N Undergrove St (Suite E), Denver, CO 80249
- **ATL - Atlanta**: 3400 Interloop Rd Space G2-Cargo, Atlanta, GA 30354
- **BWI - Baltimore/Washington**: BWI Building C Air Cargo Drive, Linthicum, MD 21240

### API Endpoints for Airport Data

#### Get All Airports
**Endpoint:** `GET /api/airports`

```typescript
// Response
{
  airports: [
    {
      id: "airport_123",
      code: "DAL",
      name: "Dallas",
      carrier: "Southwest Airlines Cargo",
      address: "7510 Aviation Place Ste 110",
      city: "Dallas",
      state: "TX",
      zip: "75235",
      hours: {
        "Mon-Fri": "4:30am-1:30am",
        "Sat": "4:30am-12:00am",
        "Sun": "4:30am-1:30am"
      }
    }
  ]
}
```

#### Get Nearest Airport
**Endpoint:** `GET /api/airports/nearest?zip=75201`

```typescript
// Response
{
  airport: {
    code: "DAL",
    name: "Dallas",
    distance: 5.2,  // miles
    estimatedDriveTime: 15  // minutes
  }
}
```

### Airport Selection Component

```tsx
<AirportSelector
  onSelect={(airport) => handleAirportSelect(airport)}
  selectedCode="DAL"
  userZipCode="75201"
  showDistance={true}
/>
```

### Database Schema

```prisma
model Airport {
  id        String   @id @default(cuid())
  code      String   @unique  // IATA code
  name      String
  carrier   String
  operator  String?
  address   String
  city      String
  state     String
  zip       String
  hours     Json     // Operating hours
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Relations
  orders    Order[]  @relation("OrderAirport")
}
```

### Airport Coverage Map

The Southwest Cargo network covers **119 airports** across the United States, including:
- **Complete Coverage States**: Texas, Oklahoma, New Mexico, Arizona, Louisiana
- **Major Cities**: All major US metropolitan areas
- **Hawaii Locations**: Honolulu, Maui, Kona, Lihue, Hilo
- **Special Territories**: San Juan, Puerto Rico

### Operating Hours Patterns

Most Southwest Cargo locations follow these patterns:
- **Major Hubs**: Often 24-hour or near 24-hour operation
- **Regional Airports**: Typically Mon-Fri 5:00am-10:00pm
- **Smaller Locations**: May have limited weekend hours or be closed Sundays
- **Third-Party Operators**: May have restricted hours (usually Mon-Fri only)

### Integration with Shipping Calculator

The shipping calculator automatically:
1. Identifies nearest Southwest Cargo airport to destination
2. Validates service availability based on airport operating hours
3. Adjusts delivery estimates based on airport cutoff times
4. Provides pickup/drop-off location details in shipping labels

### Seeding Airport Data

To populate the database with airport data:

```bash
# Run the airport seeding script
npx tsx prisma/seed-airports.ts
```

This will insert/update all 119 Southwest Cargo locations with current address and hours information.

## Support & Documentation

- FedEx Developer Portal: https://developer.fedex.com
- UPS Developer Kit: https://www.ups.com/upsdeveloperkit
- Southwest Cargo: Contact for API access
- Airport Data Source: Southwest Airlines Cargo official locations

## Implementation Checklist

- [x] FedEx OAuth2 authentication
- [x] FedEx rate calculation
- [x] FedEx label generation
- [x] FedEx tracking
- [x] Southwest Cargo rate calculation
- [x] Southwest Cargo service area validation
- [x] Shipping calculator orchestration
- [x] Redis caching implementation
- [x] Database rate storage
- [x] Frontend component
- [x] API endpoints
- [x] Weight calculation
- [x] Error handling
- [ ] International shipping
- [ ] Multi-package optimization
- [ ] Scheduled pickups