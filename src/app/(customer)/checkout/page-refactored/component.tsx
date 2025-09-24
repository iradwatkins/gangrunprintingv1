/**
 * page - component definitions
 * Auto-refactored by BMAD
 */

import { PageErrorBoundary } from '@/components/error-boundary'

export default function CheckoutPage() {
  return (
    <PageErrorBoundary pageName="Checkout">
      <CheckoutPageContent />
    </PageErrorBoundary>
  )
}
