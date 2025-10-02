# Modular Architecture Dependency Analysis

## 📊 Current Cross-Module Dependencies Report

### **Summary**
The GangRun Printing product system uses a modular architecture where products can have any combination of 6 modules: Quantity, Size, Paper Stock, Add-ons, Turnaround, and Images. This analysis identifies current dependencies that prevent true module independence.

---

## 🔍 **Detailed Dependency Mapping**

### **1. Orchestration Dependencies (ModularProductConfigurationForm.tsx)**

**Cross-Module Data Passing:**
```typescript
// Current problematic data flow
<AddonsModule
  quantity={getQuantityValue(configuration)}          // ❌ DEPENDENCY
  turnaroundTimes={configData.turnaroundTimes}        // ❌ DEPENDENCY
/>

<TurnaroundModule
  quantity={getQuantityValue(configuration)}          // ❌ DEPENDENCY
  baseProductPrice={currentPrice}                     // ❌ DEPENDENCY
  currentCoating={configuration.coating}              // ❌ DEPENDENCY
/>
```

**Analysis:** The main orchestration form passes data between modules, creating tight coupling.

---

### **2. Pricing System Dependencies (usePriceCalculation.ts)**

**Centralized Calculation Logic:**
```typescript
// Current pricing dependencies
const baseProductPrice = quantity * basePrice * sizeMultiplier * coatingMultiplier * sidesMultiplier

// Add-on calculations depend on multiple modules:
case 'PER_UNIT':
  addonCosts += quantity * addon.price              // ❌ QUANTITY DEPENDENCY
case 'PERCENTAGE':
  addonCosts += baseProductPrice * addon.price      // ❌ BASE PRICE DEPENDENCY

// Turnaround calculations depend on base price:
case 'PERCENTAGE':
  return basePrice * turnaroundOption.priceMultiplier // ❌ BASE PRICE DEPENDENCY
```

**Analysis:** Pricing calculations create cascading dependencies where later modules need data from earlier modules.

---

### **3. Individual Module Dependencies**

#### **✅ Independent Modules**
- **Quantity Module**: Fully self-contained, no external dependencies
- **Size Module**: Self-contained with custom size calculations
- **Paper Stock Module**: Independent selection logic

#### **⚠️ Dependent Modules**

**Add-ons Module Dependencies:**
```typescript
// Current dependencies in AddonsModule
quantity?: number                    // ❌ For PER_UNIT pricing
turnaroundTimes?: any[]             // ❌ For compatibility checks

// In useAddonsModule hook:
case 'PER_UNIT':
  totalAddonsPrice += addon.price * quantity  // ❌ QUANTITY DEPENDENCY
```

**Turnaround Module Dependencies:**
```typescript
// Current dependencies in TurnaroundModule
baseProductPrice?: number           // ❌ For PERCENTAGE pricing
quantity?: number                   // ❌ For PER_UNIT pricing
currentCoating?: string            // ❌ For compatibility checks

// In useTurnaroundModule hook:
case 'PERCENTAGE':
  turnaroundPrice = basePrice * (priceMultiplier - 1)  // ❌ BASE PRICE DEPENDENCY
```

---

## 🎯 **Pricing Calculation Flow Analysis**

### **Current Cascade Dependencies:**
```
1. Paper Stock + Quantity + Size → Base Price
2. Base Price + Add-ons → Product Price
3. Product Price + Turnaround → Final Price
```

### **Problem:** Each step depends on the previous steps, preventing modular independence.

---

## 📋 **Module Independence Status**

| Module | Independence Status | Key Dependencies | Impact |
|--------|-------------------|------------------|---------|
| **Quantity** | ✅ Fully Independent | None | Reference implementation |
| **Size** | ✅ Fully Independent | None | Good model |
| **Paper Stock** | ✅ Fully Independent | None | Good model |
| **Add-ons** | ⚠️ Partially Dependent | Quantity (PER_UNIT) | Medium |
| **Turnaround** | ⚠️ Highly Dependent | Base price, Quantity, Coating | High |
| **Images** | ❓ Not Implemented | Unknown | To be determined |

---

## 🚨 **Critical Issues Preventing Independence**

### **1. Pricing Model Coupling**
- Add-ons PER_UNIT pricing requires quantity value
- Turnaround PERCENTAGE pricing requires base price
- Special add-on calculations hardcoded in pricing hook

### **2. Cross-Module Validation**
- Turnaround coating compatibility checks
- Add-on turnaround compatibility logic

### **3. Centralized State Management**
- All module state managed in main form
- No individual module state persistence
- Configuration changes trigger global recalculations

### **4. Missing Interface Standardization**
- Inconsistent prop patterns across modules
- Different hook signatures and return values
- Varied error handling approaches

---

## 🔧 **Required Changes for True Independence**

### **Immediate Fixes Needed:**

1. **Decouple Pricing Calculations**
   - Move pricing logic into individual modules
   - Create fallback values for missing dependencies
   - Implement progressive enhancement pricing

2. **Standardize Module Interfaces**
   - Unified props pattern: `ModuleProps<T>`
   - Consistent hook signatures: `use[Module]Module()`
   - Standard error handling and loading states

3. **Create Pricing Abstraction Layer**
   - `ModulePricingEngine` for coordinating calculations
   - Individual module pricing contributions
   - Remove hardcoded cross-dependencies

4. **Implement Missing Image Module**
   - Following established patterns
   - Independent upload and management
   - Integration with pricing system

---

## 🎯 **Success Criteria for Independence**

### **Module Independence Test:**
- ✅ Each module works in isolation
- ✅ Adding/removing modules doesn't break others
- ✅ Pricing calculations have fallbacks
- ✅ No hardcoded cross-references

### **Integration Test:**
- ✅ All module combinations work seamlessly
- ✅ Pricing calculations remain accurate
- ✅ Performance is maintained
- ✅ User experience is consistent

---

**Next Steps:** Implement standardized interfaces and decouple pricing calculations to achieve true module independence while maintaining seamless integration.