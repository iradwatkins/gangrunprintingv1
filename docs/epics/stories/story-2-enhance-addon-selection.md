# Story 2: Enhance Add-On Selection Interface

## Story Title
Add Preview and Price Impact Display for Add-On Sets

## Story Type
Feature Enhancement

## Story Points
3

## Priority
P1 - High (UX Enhancement)

## Story Description

As an **admin user**, I want to see what's included in each add-on set before selecting it and understand the price impact, so that I can make informed decisions when configuring products.

## Background

The current add-on selection interface shows only the names of add-on sets without revealing their contents or pricing details. Admins must remember what each set contains or reference external documentation. This leads to:
- Configuration errors due to selecting wrong add-on sets
- Time wasted checking what's included in each set
- Uncertainty about pricing impact on final product cost

## Acceptance Criteria

### Must Have
- [ ] Hovering over an add-on set displays its contents in a tooltip/card
- [ ] Each add-on item shows its individual price
- [ ] Total price impact of the add-on set is clearly displayed
- [ ] Selected add-ons are visually distinguished from unselected ones
- [ ] Add-on details are accessible via keyboard navigation (accessibility)
- [ ] Selected add-ons display correctly on customer product pages

### Should Have
- [ ] Live price preview updates when add-ons are selected/deselected
- [ ] Visual icons for different add-on types (finishing, printing, etc.)
- [ ] Ability to expand/collapse add-on set details inline
- [ ] Search/filter functionality for add-on sets

### Could Have
- [ ] Drag-and-drop to reorder selected add-ons
- [ ] Bulk selection/deselection of add-on sets
- [ ] Add-on compatibility warnings (e.g., "UV coating not compatible with matte finish")

## Technical Details

### Component Updates

1. **Update ProductAdditionalOptions Component**:
```tsx
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { Check, Info } from 'lucide-react';

function ProductAdditionalOptions({ addOnSets, selected, onChange }) {
  const calculateSetPrice = (set) => {
    return set.addOns.reduce((sum, addon) => sum + addon.price, 0);
  };

  return (
    <div className="space-y-4">
      {addOnSets.map((set) => {
        const isSelected = selected.includes(set.id);
        const totalPrice = calculateSetPrice(set);

        return (
          <div key={set.id} className={`
            border rounded-lg p-4 cursor-pointer transition-all
            ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-gray-300'}
          `}>
            <HoverCard>
              <div className="flex items-center justify-between">
                <HoverCardTrigger asChild>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id={set.id}
                      checked={isSelected}
                      onCheckedChange={() => onChange(set.id)}
                    />
                    <Label htmlFor={set.id} className="cursor-pointer">
                      {set.name}
                      <Info className="inline ml-1 h-4 w-4 text-gray-400" />
                    </Label>
                  </div>
                </HoverCardTrigger>

                <Badge variant={isSelected ? "default" : "secondary"}>
                  +${totalPrice.toFixed(2)}
                </Badge>
              </div>

              <HoverCardContent className="w-80">
                <div className="space-y-2">
                  <h4 className="font-semibold">{set.name}</h4>
                  <p className="text-sm text-gray-600">{set.description}</p>
                  <div className="border-t pt-2">
                    <p className="text-xs font-semibold mb-1">Includes:</p>
                    {set.addOns.map((addon) => (
                      <div key={addon.id} className="flex justify-between text-sm py-1">
                        <span className="flex items-center gap-1">
                          {addon.icon && <span>{addon.icon}</span>}
                          {addon.name}
                        </span>
                        <span className="text-gray-600">+${addon.price.toFixed(2)}</span>
                      </div>
                    ))}
                    <div className="border-t mt-2 pt-2 flex justify-between font-semibold">
                      <span>Total:</span>
                      <span>+${totalPrice.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </div>
        );
      })}
    </div>
  );
}
```

2. **Add Price Impact Display**:
```tsx
function PriceImpactSummary({ basePrice, selectedAddOns }) {
  const addOnsTotal = selectedAddOns.reduce((sum, set) => {
    return sum + set.addOns.reduce((setSum, addon) => setSum + addon.price, 0);
  }, 0);

  return (
    <Card className="p-4 bg-gray-50">
      <h3 className="font-semibold mb-2">Price Breakdown</h3>
      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Base Price:</span>
          <span>${basePrice.toFixed(2)}</span>
        </div>
        {selectedAddOns.map((set) => (
          <div key={set.id} className="flex justify-between text-gray-600">
            <span className="ml-2">+ {set.name}:</span>
            <span>+${calculateSetPrice(set).toFixed(2)}</span>
          </div>
        ))}
        <div className="border-t pt-1 font-semibold flex justify-between">
          <span>Total:</span>
          <span>${(basePrice + addOnsTotal).toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
```

3. **Ensure Customer Page Display**:
```tsx
// In customer product page component
function ProductAddOnsDisplay({ product }) {
  if (!product.addOnSets?.length) return null;

  return (
    <div className="mt-6">
      <h3 className="font-semibold mb-2">Available Options:</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {product.addOnSets.map((set) => (
          <Card key={set.id} className="p-3">
            <h4 className="font-medium">{set.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {set.addOns.length} options available
            </p>
            <p className="text-sm font-semibold mt-2">
              Starting at +${Math.min(...set.addOns.map(a => a.price)).toFixed(2)}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

## Testing Requirements

### Unit Tests
- [ ] Test add-on set price calculation
- [ ] Test selection state management
- [ ] Test hover card display logic

### Integration Tests
- [ ] Verify add-on data loads from API
- [ ] Test add-on selection persistence
- [ ] Verify price updates propagate correctly

### Manual Testing Checklist
- [ ] Hover over each add-on set to see contents
- [ ] Select/deselect add-ons and verify price updates
- [ ] Test keyboard navigation (Tab, Enter, Space)
- [ ] Verify selected add-ons save with product
- [ ] Check add-ons display on customer product page
- [ ] Test on mobile devices (touch instead of hover)
- [ ] Verify accessibility with screen reader

## Dependencies
- shadcn/ui HoverCard component
- Add-on sets data structure from database
- Price calculation service
- Existing ProductAdditionalOptions component

## Definition of Done
- [ ] Add-on contents display on hover/focus
- [ ] Individual prices shown for each add-on
- [ ] Total price impact clearly visible
- [ ] Selection state persists correctly
- [ ] Accessibility requirements met
- [ ] Customer pages show selected add-ons
- [ ] Mobile experience is functional
- [ ] Code reviewed and approved
- [ ] Feature tested across browsers

## Notes
- Consider mobile UX where hover isn't available - use tap to show details
- Ensure price calculations match backend logic exactly
- Add-on preview should load quickly - consider pre-fetching
- Keep existing add-on functionality intact while enhancing UX

## Estimation Breakdown
- Update component with HoverCard: 2 hours
- Implement price calculation display: 1.5 hours
- Add selection visual feedback: 1 hour
- Update customer page display: 1 hour
- Testing and refinements: 1.5 hours
- Total: ~7 hours (3 story points)