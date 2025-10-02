'use client'

import { PaperStockSelector } from './PaperStockSelector'
import type { PaperStockModuleProps, PaperStockModuleValue } from './types'

/**
 * PaperStockModule - A modular wrapper for paper stock, coating, and sides selection
 * Handles the interdependencies between paper, coating, and printing sides
 */
export function PaperStockModule({
  paperStocks,
  paperValue,
  coatingValue,
  sidesValue,
  onPaperChange,
  onCoatingChange,
  onSidesChange,
  disabled = false,
  className = '',
  required = false,
}: PaperStockModuleProps) {
  return (
    <div className={`paper-stock-module ${className}`}>
      <PaperStockSelector
        paperStocks={paperStocks}
        paperValue={paperValue}
        coatingValue={coatingValue}
        sidesValue={sidesValue}
        onPaperChange={onPaperChange}
        onCoatingChange={onCoatingChange}
        onSidesChange={onSidesChange}
        disabled={disabled}
      />
    </div>
  )
}

// Export standardized hook for external use
export { usePaperStockModule } from '../hooks/StandardModuleHooks'