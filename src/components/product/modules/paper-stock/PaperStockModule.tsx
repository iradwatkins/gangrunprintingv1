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
        coatingValue={coatingValue}
        disabled={disabled}
        paperStocks={paperStocks}
        paperValue={paperValue}
        sidesValue={sidesValue}
        onCoatingChange={onCoatingChange}
        onPaperChange={onPaperChange}
        onSidesChange={onSidesChange}
      />
    </div>
  )
}

// Export standardized hook for external use
export { usePaperStockModule } from '../hooks/StandardModuleHooks'
