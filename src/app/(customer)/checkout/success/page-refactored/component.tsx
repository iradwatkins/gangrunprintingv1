/**
 * page - component definitions
 * Auto-refactored by BMAD
 */

import { Suspense, useEffect, useState } from 'react'
import Image from 'next/image'
import {
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import toast from '@/lib/toast'


export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  )
}
