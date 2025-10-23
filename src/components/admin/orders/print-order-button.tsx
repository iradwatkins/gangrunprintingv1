'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintOrderButton() {
  return (
    <Button
      size="sm"
      variant="outline"
      onClick={() => window.print()}
      title="Print this page"
    >
      <Printer className="h-4 w-4 mr-2" />
      Print Order
    </Button>
  )
}