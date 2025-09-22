/**
 * pricing-engine - misc definitions
 * Auto-refactored by BMAD
 */

import { PRICING } from '@/config/constants'


/**
 * Comprehensive Pricing Engine for Gang Run Printing
 *
 * Formula:
 * 1. Base_Paper_Print_Price = EffectiveQuantity × EffectiveArea × PaperStock_BasePrice_PerSqInch × SidesFactor
 * 2. Adjusted_Base_Price = Base_Paper_Print_Price
 *    - If Broker with discount: Adjusted_Base_Price = Base_Paper_Print_Price × (1 - BrokerDiscountPercentage)
 *    - Else if "Our Tagline" selected & visible: Adjusted_Base_Price -= (Base_Paper_Print_Price × TaglineDiscountPercentage)
 * 3. Price_After_Base_Percentage_Modifiers = Adjusted_Base_Price
 *    - If "Exact Size" selected: Price_After_Base_Percentage_Modifiers += (Adjusted_Base_Price × ExactSizeMarkupPercentage)
 * 4. Price_After_Turnaround = Price_After_Base_Percentage_Modifiers × (1 + Selected_Turnaround_Markup_Percentage)
 * 5. Calculated_Product_Subtotal_Before_Shipping_Tax = Price_After_Turnaround + Sum of all selected discrete Add-on Services
 */

