'use client'

import { Button } from '@/components/ui/button'
import { Printer } from 'lucide-react'

export function PrintOrderButton() {
  return (
    <Button size="sm" title="Print this page" variant="outline" onClick={() => window.print()}>
      <Printer className="h-4 w-4 mr-2" />
      Print Order
    </Button>
  )
}
