# Story 4a: Shipping UI Component

## Story Title
Create Shipping Provider Selection UI with Static Rates

## Story Type
Feature Implementation

## Story Points
2

## Priority
P1 - High (Checkout flow requirement)

## Story Description

As a **customer**, I want to see and select between FedEx and Southwest Cargo/DASH shipping options with clear branding and delivery information, so that I can choose my preferred shipping method.

## Background

This story focuses on the UI component for shipping selection without the complexity of real-time rate calculation. It provides:
- Visual shipping provider selection
- Provider branding and logos
- Static delivery timeframes
- Selection state management

This creates the foundation for dynamic rate integration in Story 4b.

## Acceptance Criteria

### Must Have
- [ ] Radio button group for shipping selection
- [ ] FedEx and Southwest Cargo/DASH options displayed
- [ ] Provider logos visible for brand recognition
- [ ] Delivery timeframe shown for each option
- [ ] Selection state persists during checkout
- [ ] One provider must be selected (validation)
- [ ] Mobile responsive design

### Should Have
- [ ] Visual highlight on selected option
- [ ] Hover states for better interactivity
- [ ] Default selection (FedEx as economical option)
- [ ] Accessible labels and ARIA attributes

## Technical Details

### Static Shipping Selection Component

```tsx
import { useState } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Clock, Shield, Package } from 'lucide-react';

export interface ShippingProvider {
  id: 'fedex' | 'southwest-dash';
  name: string;
  displayName: string;
  logo: string;
  deliveryDays: {
    min: number;
    max: number;
    text: string;
  };
  features: string[];
  baseRate: number; // Static rate for now
}

const SHIPPING_PROVIDERS: ShippingProvider[] = [
  {
    id: 'fedex',
    name: 'FedEx Ground',
    displayName: 'FedEx',
    logo: '/images/shipping/fedex-logo.svg',
    deliveryDays: {
      min: 3,
      max: 5,
      text: '3-5 business days'
    },
    features: [
      'Reliable nationwide delivery',
      'Package tracking included',
      'Up to $100 insurance'
    ],
    baseRate: 12.99
  },
  {
    id: 'southwest-dash',
    name: 'Southwest Cargo DASH',
    displayName: 'Southwest DASH',
    logo: '/images/shipping/southwest-cargo-logo.svg',
    deliveryDays: {
      min: 1,
      max: 2,
      text: '1-2 business days'
    },
    features: [
      'Express priority shipping',
      'Real-time tracking',
      'Up to $500 insurance',
      'Signature required'
    ],
    baseRate: 29.99
  }
];

interface ShippingSelectionProps {
  onSelect: (provider: ShippingProvider) => void;
  selectedId?: string;
  className?: string;
}

export function ShippingSelection({
  onSelect,
  selectedId = 'fedex',
  className = ''
}: ShippingSelectionProps) {
  const [selected, setSelected] = useState(selectedId);

  const handleSelect = (providerId: string) => {
    setSelected(providerId);
    const provider = SHIPPING_PROVIDERS.find(p => p.id === providerId);
    if (provider) {
      onSelect(provider);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Select Shipping Method</h3>
      </div>

      <RadioGroup value={selected} onValueChange={handleSelect}>
        <div className="space-y-3">
          {SHIPPING_PROVIDERS.map((provider) => {
            const isSelected = selected === provider.id;
            const isEconomy = provider.id === 'fedex';

            return (
              <Label
                key={provider.id}
                htmlFor={provider.id}
                className="cursor-pointer block"
              >
                <Card
                  className={`
                    relative p-4 transition-all hover:shadow-md
                    ${isSelected
                      ? 'border-primary ring-2 ring-primary/20 bg-primary/5'
                      : 'hover:border-gray-400'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={provider.id}
                      id={provider.id}
                      className="mt-1"
                    />

                    <div className="flex-1">
                      {/* Header with logo and badges */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={provider.logo}
                            alt={provider.displayName}
                            className="h-8 object-contain"
                          />
                          <div>
                            <p className="font-semibold">{provider.name}</p>
                            {isEconomy && (
                              <Badge variant="secondary" className="mt-1">
                                Most Popular
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Static Price Display */}
                        <div className="text-right">
                          <p className="text-2xl font-bold">
                            ${provider.baseRate.toFixed(2)}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Time */}
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                        <Clock className="h-4 w-4" />
                        <span>Delivered in {provider.deliveryDays.text}</span>
                      </div>

                      {/* Features */}
                      <div className="space-y-1">
                        {provider.features.map((feature, idx) => (
                          <div
                            key={idx}
                            className="flex items-center gap-2 text-xs text-gray-600"
                          >
                            <div className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Selected Indicator */}
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                </Card>
              </Label>
            );
          })}
        </div>
      </RadioGroup>

      {/* Information Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start gap-2">
          <Shield className="h-4 w-4 text-blue-600 mt-0.5" />
          <div className="text-sm text-blue-800">
            <p className="font-medium">Shipping Protection</p>
            <p className="text-xs mt-1">
              All shipments include basic insurance. Additional coverage available at checkout.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Usage Example in Checkout Page
export function CheckoutShippingStep() {
  const [shippingProvider, setShippingProvider] = useState<ShippingProvider | null>(null);

  return (
    <div className="max-w-3xl mx-auto p-6">
      <ShippingSelection
        onSelect={setShippingProvider}
        selectedId={shippingProvider?.id}
      />

      {shippingProvider && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <p className="text-sm">
            Selected: <strong>{shippingProvider.name}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Estimated delivery: {shippingProvider.deliveryDays.text}
          </p>
          <p className="text-sm font-medium mt-2">
            Shipping cost: ${shippingProvider.baseRate.toFixed(2)}
          </p>
        </div>
      )}
    </div>
  );
}
```

### Supporting Files

```tsx
// types/shipping.ts
export interface ShippingSelection {
  providerId: 'fedex' | 'southwest-dash';
  rate: number;
  deliveryDays: {
    min: number;
    max: number;
  };
  selectedAt: Date;
}

// hooks/useShipping.ts
export function useShipping() {
  const [selection, setSelection] = useState<ShippingSelection | null>(null);

  const selectProvider = useCallback((provider: ShippingProvider) => {
    setSelection({
      providerId: provider.id,
      rate: provider.baseRate,
      deliveryDays: provider.deliveryDays,
      selectedAt: new Date()
    });
  }, []);

  return {
    selection,
    selectProvider,
    hasSelection: !!selection,
    clearSelection: () => setSelection(null)
  };
}
```

## Testing Requirements

### Manual Testing Checklist
- [ ] Both shipping options display correctly
- [ ] Radio buttons function properly
- [ ] Selection highlights active choice
- [ ] Provider logos load and display
- [ ] Features list is readable
- [ ] Mobile responsive at 320px width
- [ ] Tablet responsive at 768px width
- [ ] Desktop layout at 1280px width
- [ ] Keyboard navigation works (Tab, Space, Arrow keys)
- [ ] Screen reader announces options correctly

## Dependencies
- shadcn/ui RadioGroup component
- Shipping provider logo assets
- Card and Badge components
- Lucide icons for visual elements

## Definition of Done
- [ ] Component renders both shipping options
- [ ] Selection state management works
- [ ] Visual design matches mockups
- [ ] Mobile responsive design verified
- [ ] Accessibility requirements met
- [ ] Component documented with examples
- [ ] Code reviewed
- [ ] Tested across browsers

## Notes
- This story uses static rates for simplicity
- Dynamic rate calculation comes in Story 4b
- Ensure logos are optimized for web (SVG preferred)
- Consider loading state for future API integration
- Component should be reusable across checkout flow

## Estimation Breakdown
- Create base component structure: 1 hour
- Style shipping cards: 1 hour
- Add selection state management: 0.5 hours
- Mobile responsive design: 0.5 hours
- Testing and refinements: 1 hour
- Total: ~4 hours (2 story points)