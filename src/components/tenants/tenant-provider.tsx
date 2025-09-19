'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { type TenantContext } from '@/lib/tenants/resolver'

interface TenantProviderProps {
  children: React.ReactNode
  initialTenant: TenantContext | null
}

const TenantContextProvider = createContext<TenantContext | null>(null)

export function TenantProvider({ children, initialTenant }: TenantProviderProps) {
  const [tenantContext, setTenantContext] = useState<TenantContext | null>(initialTenant)

  // Update tenant context when initialTenant changes
  useEffect(() => {
    setTenantContext(initialTenant)
  }, [initialTenant])

  return (
    <TenantContextProvider.Provider value={tenantContext}>
      {children}
    </TenantContextProvider.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContextProvider)
  return context
}

export function useTenantInfo() {
  const context = useContext(TenantContextProvider)
  return context?.tenant || null
}

export function useTenantSettings() {
  const context = useContext(TenantContextProvider)
  return {
    tenant: context?.tenant || null,
    locale: context?.locale || 'en',
    currency: context?.tenant?.currency || 'USD',
    timezone: context?.tenant?.timezone || 'America/Chicago',
    features: context?.tenant?.settings?.features || {},
  }
}
