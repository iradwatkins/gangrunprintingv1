# Ultra-Independent Modular Architecture Developer Guide

## 🎯 **THE TRUTH: Ultra-Clear Requirements**

**CRITICAL UNDERSTANDING**: Modules are **independent for errors/crashes**, BUT they **DO work together for pricing calculations**. Dependencies are **REQUIRED and CORRECT**.

---

## 🏗️ **Architecture Overview**

### **What We Built**

- ✅ **Error Independence** - Module A error doesn't crash Module B
- ✅ **UI Independence** - Each module renders independently
- ✅ **Loading Independence** - Each module manages its own loading states
- ✅ **Maintenance Independence** - Can fix each module individually
- ✅ **Pricing Integration** - Modules work together seamlessly for pricing
- ✅ **Performance Optimization** - High-performance caching system

### **Pricing Flow (CORRECT Dependencies)**

```
STEP 1: Base Price = quantity × paper_stock × size × coating × sides
STEP 2: Addon Price = quantity × addon (PER_UNIT) OR base_price × addon (PERCENTAGE)
STEP 3: Final Price = base_price + addon_price × turnaround
```

---

## 📦 **Module Types & Characteristics**

### **Required Modules (Core)**

1. **Quantity** - Always required, provides quantity multiplier
2. **Paper Stock** - Always required, provides base price per unit
3. **Size** - Always required, provides size multiplier

### **Optional Modules (Enhancement)**

4. **Add-ons** - Optional, depends on quantity + base price
5. **Turnaround** - Optional, depends on base/product price
6. **Images** - ALWAYS optional, NEVER affects pricing

### **Image Module Special Rules** 🚫

- ✅ **Never required** for pricing calculations
- ✅ **Never blocks** checkout process
- ✅ **System works completely** without any uploads
- ✅ Shows **"pending file upload"** states gracefully

---

## 🔧 **Creating a New Module**

### **1. File Structure**

```
src/components/product/modules/[module-name]/
├── index.ts                 # Clean exports
├── types.ts                 # TypeScript interfaces
├── [ModuleName]Module.tsx   # Main component
├── [ModuleName]Selector.tsx # UI component (optional)
└── __tests__/               # Tests (optional)
```

### **2. Required Interfaces**

```typescript
// types.ts
import {
  StandardModuleProps,
  ModulePricingContribution,
  ModuleType,
} from '../types/StandardModuleTypes'

export interface YourModuleItem {
  id: string
  name: string
  value: number | string
  // ... module-specific properties
}

export interface YourModuleProps extends StandardModuleProps<YourModuleItem, YourValue> {
  // Module-specific props
  items: YourModuleItem[]
  onChange: (value: YourValue) => void
}

export interface YourModuleValue {
  // Module-specific value structure
  selectedItem: YourModuleItem | null
  isValid: boolean
}
```

### **3. Module Component Pattern**

```typescript
// YourModule.tsx
'use client'

import { ModuleLoadingBoundary } from '../loading/ModuleLoadingComponents'
import { useYourModule } from '../hooks/StandardModuleHooks'

export function YourModule({
  items,
  value,
  onChange,
  disabled = false,
  className = ''
}: YourModuleProps) {

  // Use standardized hook for ultra-independent functionality
  const {
    moduleState,
    moduleErrors,
    moduleLoading,
    // ... other hook returns
  } = useYourModule({
    moduleType: ModuleType.YOUR_MODULE,
    items,
    value,
    onChange
  })

  return (
    <ModuleLoadingBoundary
      loadingState={moduleLoading}
      hasErrors={moduleErrors.hasErrors}
      moduleName="Your Module"
    >
      <div className={`your-module ${className} ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        {/* Your module UI */}

        {/* Module-specific error display */}
        {moduleErrors.hasErrors && (
          <div className="mt-2 text-sm text-red-600">
            {moduleErrors.errors.map((error, index) => (
              <div key={index}>{error.message}</div>
            ))}
          </div>
        )}
      </div>
    </ModuleLoadingBoundary>
  )
}
```

### **4. Hook Implementation**

```typescript
// In StandardModuleHooks.ts
export function useYourModule({
  moduleType,
  items,
  value,
  onChange,
}: UseYourModuleOptions): YourModuleValue {
  // Ultra-independent error handling
  const moduleErrors = useModuleErrors({
    moduleType,
    onError: (error) => console.log(`${moduleType} Error:`, error),
  })

  // Ultra-independent loading state
  const moduleLoading = useModuleLoading({
    moduleType,
    onLoadingChange: (isLoading, state) => {
      // Loading changes don't affect other modules
    },
  })

  // Validation logic (module-specific)
  const isValid = useMemo(() => {
    moduleErrors.clearErrors()

    // Your validation logic here
    if (!value || !items.length) {
      moduleErrors.addError({
        id: 'missing_selection',
        message: 'Please select an option',
        type: 'validation',
        moduleType,
        field: 'selection',
        severity: 'error',
      })
      return false
    }

    return true
  }, [value, items, moduleErrors])

  // Pricing contribution calculation
  const pricing: ModulePricingContribution = useMemo(() => {
    if (!isValid) return { isValid: false }

    // Calculate your module's pricing impact
    return {
      basePrice: 0, // If this module provides base price
      multiplier: 1.2, // If this module provides multiplier
      addonCost: 25, // If this module provides flat addon
      isValid: true,
      calculation: {
        description: 'Your module contribution',
        breakdown: [{ type: 'your_type', item: 'Description', cost: 25 }],
      },
    }
  }, [isValid, value])

  return {
    // Standard interface
    value: {
      selectedItem: items.find((item) => item.id === value) || null,
      isValid,
    },
    pricing,
    display: {
      description: isValid ? 'Selection made' : 'No selection',
      summary: `Your module`,
      showInSummary: isValid,
    },
    isValid,
    error: moduleErrors.hasErrors ? moduleErrors.errors[0] : null,

    // Ultra-independent characteristics
    errors: moduleErrors.errors,
    hasErrors: moduleErrors.hasErrors,
    clearErrors: moduleErrors.clearErrors,
  }
}
```

---

## ⚡ **Performance Guidelines**

### **Caching Integration**

```typescript
import { ModulePricingEngine, PricingConstants, debounce } from '../pricing'

// Use caching for expensive calculations
const pricingEngine = new ModulePricingEngine({
  maxCacheSize: PricingConstants.DEFAULT_CACHE_SIZE,
  maxAge: PricingConstants.DEFAULT_CACHE_TTL_MS,
})

// Debounce frequent updates
const debouncedPriceUpdate = debounce(updatePrice, PricingConstants.DEFAULT_DEBOUNCE_MS)
```

### **Memory Management**

```typescript
// Cleanup resources when component unmounts
useEffect(() => {
  return () => {
    pricingEngine.destroy()
  }
}, [])
```

---

## 🧪 **Testing Your Module**

### **1. Independence Tests**

```typescript
// Test error isolation
test('module errors do not affect other modules', () => {
  // Add error to your module
  // Verify other modules are unaffected
})

// Test loading isolation
test('module loading states are independent', () => {
  // Start loading in your module
  // Verify other modules are unaffected
})
```

### **2. Pricing Integration Tests**

```typescript
// Test pricing contributions
test('module pricing contribution is correct', () => {
  const engine = new ModulePricingEngine()

  engine.updateModuleContribution(ModuleType.YOUR_MODULE, contribution)

  const context = engine.getPricingContext()
  expect(context.finalPrice).toBe(expectedPrice)
})
```

### **3. Dependency Tests**

```typescript
// Test required dependencies
test('module gets correct context dependencies', () => {
  // Set up required modules
  // Get context for your module
  // Verify correct dependencies are provided
})
```

---

## 🚫 **Common Mistakes to Avoid**

### **❌ WRONG: Removing Pricing Dependencies**

```typescript
// DON'T DO THIS - Breaks pricing calculations
function useAddonsModule() {
  // Missing quantity and basePrice dependencies
  return { pricing: { isValid: true } }
}
```

### **✅ CORRECT: Keeping Required Dependencies**

```typescript
// DO THIS - Preserves pricing accuracy
function useAddonsModule({ quantity, basePrice }) {
  const pricing = useMemo(
    () => ({
      addonCost: quantity * 0.02, // NEEDS quantity
      percentageCost: basePrice * 0.15, // NEEDS basePrice
      isValid: true,
    }),
    [quantity, basePrice]
  )

  return { pricing }
}
```

### **❌ WRONG: Direct Module Communication**

```typescript
// DON'T DO THIS - Breaks independence
function useModuleA() {
  const moduleBState = useModuleB() // Direct dependency
}
```

### **✅ CORRECT: Communication Through Pricing Engine**

```typescript
// DO THIS - Maintains independence
function useModuleA() {
  // Communicate through pricing context only
  const dependencies = engine.getContextForModule(ModuleType.A)
}
```

### **❌ WRONG: Making Images Required**

```typescript
// DON'T DO THIS - Images must always be optional
if (!images.length) {
  throw new Error('Images are required') // WRONG!
}
```

### **✅ CORRECT: Images Always Optional**

```typescript
// DO THIS - Images never block system
const isValid = true // Always valid, regardless of images
const pricing = { isValid: true } // Images never affect pricing
```

---

## 📋 **Module Checklist**

### **Before Submitting Your Module:**

#### **Independence Checklist** ✅

- [ ] Module errors don't crash other modules
- [ ] Module loading states don't block other modules
- [ ] Module can be fixed without touching other modules
- [ ] Module renders independently of other module states

#### **Integration Checklist** ✅

- [ ] Pricing dependencies are preserved (if required)
- [ ] Module contributes to pricing correctly
- [ ] Module gets required context from pricing engine
- [ ] Module doesn't directly access other module states

#### **Image Module Special Checklist** 📁

- [ ] Module is completely optional
- [ ] System works without any uploads
- [ ] Errors are warnings, never critical
- [ ] Never blocks pricing or checkout

#### **Performance Checklist** ⚡

- [ ] Uses caching for expensive calculations
- [ ] Debounces frequent updates
- [ ] Cleans up resources on unmount
- [ ] Handles loading states efficiently

#### **Testing Checklist** 🧪

- [ ] Tests error isolation
- [ ] Tests loading isolation
- [ ] Tests pricing integration
- [ ] Tests all module combinations

---

## 🎯 **Module Integration Points**

### **With Pricing Engine**

```typescript
// Your module contributes to pricing
engine.updateModuleContribution(ModuleType.YOUR_MODULE, contribution)

// Your module gets dependencies
const context = engine.getContextForModule(ModuleType.YOUR_MODULE)
```

### **With Error System**

```typescript
// Independent error handling
const moduleErrors = useModuleErrors({ moduleType: ModuleType.YOUR_MODULE })
```

### **With Loading System**

```typescript
// Independent loading management
const moduleLoading = useModuleLoading({ moduleType: ModuleType.YOUR_MODULE })
```

---

## 🚀 **Deployment Considerations**

### **Production Checklist**

- [ ] All modules tested in isolation
- [ ] Pricing calculations verified for accuracy
- [ ] Performance optimizations enabled
- [ ] Error boundaries configured
- [ ] Caching properly configured

### **Monitoring**

```typescript
// Monitor pricing performance
const stats = engine.getPerformanceStats()
console.log('Cache hit rate:', stats.hitRate)
console.log('Avg calculation time:', stats.averageCalculationTime)
```

---

## 💡 **Best Practices Summary**

1. **Keep Dependencies for Pricing** - Addons NEED quantity, turnaround NEEDS base price
2. **Make Errors Independent** - Use `useModuleErrors` for isolation
3. **Make Loading Independent** - Use `useModuleLoading` for isolation
4. **Images Are Always Optional** - Never required, never block system
5. **Test Module Combinations** - Ensure all combinations work
6. **Use Performance Optimization** - Enable caching for expensive operations
7. **Follow Interface Standards** - Use `StandardModuleProps` pattern
8. **Communicate Through Engine** - No direct module-to-module communication

---

Remember: **Independence for maintenance, integration for pricing!** 🎯

This architecture gives you the best of both worlds: modules that don't crash each other but work together seamlessly for accurate pricing calculations.
