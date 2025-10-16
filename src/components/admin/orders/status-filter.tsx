'use client'

import { useState, useEffect } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useRouter, useSearchParams } from 'next/navigation'

interface StatusOption {
  slug: string
  name: string
  sortOrder: number
}

export function StatusFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [statuses, setStatuses] = useState<StatusOption[]>([])
  const [loading, setLoading] = useState(true)

  const currentStatus = searchParams.get('status') || 'all'

  useEffect(() => {
    async function fetchStatuses() {
      try {
        const response = await fetch('/api/admin/order-statuses')
        if (response.ok) {
          const data = await response.json()
          // Filter only active statuses and sort by sortOrder
          const activeStatuses = data.statuses
            .filter((s: any) => s.isActive)
            .map((s: any) => ({
              slug: s.slug,
              name: s.name,
              sortOrder: s.sortOrder,
            }))
            .sort((a: any, b: any) => a.sortOrder - b.sortOrder)

          setStatuses(activeStatuses)
        }
      } catch (error) {
        console.error('Failed to fetch statuses:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStatuses()
  }, [])

  const handleStatusChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }

    // Reset to page 1 when filtering
    params.delete('page')

    router.push(`/admin/orders?${params.toString()}`)
  }

  if (loading) {
    return (
      <Select disabled value={currentStatus}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Loading..." />
        </SelectTrigger>
      </Select>
    )
  }

  return (
    <Select value={currentStatus} onValueChange={handleStatusChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Statuses</SelectItem>
        {statuses.map((status) => (
          <SelectItem key={status.slug} value={status.slug}>
            {status.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
