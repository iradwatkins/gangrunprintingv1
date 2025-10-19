'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import {
  Truck,
  Save,
  Package,
  Zap,
  Globe,
  Plane,
  Box,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react'
import { useState, useEffect } from 'react'
import toast from '@/lib/toast'

// FedEx service categories and service data
const FEDEX_SERVICE_CATEGORIES = {
  EXPRESS: 'Express Services',
  GROUND: 'Ground Services',
  SMARTPOST: 'SmartPost Economy',
  FREIGHT: 'Freight Services',
  INTERNATIONAL: 'International Services',
}

const FEDEX_SERVICES = {
  // Express (6 services)
  EXPRESS: [
    {
      code: 'FIRST_OVERNIGHT',
      name: 'First Overnight',
      description: 'Next day by 8-9 AM',
      days: '1 day',
    },
    {
      code: 'PRIORITY_OVERNIGHT',
      name: 'Priority Overnight',
      description: 'Next day by 10:30 AM',
      days: '1 day',
    },
    {
      code: 'STANDARD_OVERNIGHT',
      name: 'Standard Overnight',
      description: 'Next day by 3 PM',
      days: '1 day',
    },
    { code: 'FEDEX_2_DAY_AM', name: '2Day A.M.', description: 'Second day by 10:30 AM', days: '2 days' },
    { code: 'FEDEX_2_DAY', name: '2Day', description: 'Second day by end of day', days: '2 days' },
    { code: 'FEDEX_EXPRESS_SAVER', name: 'Express Saver', description: 'Third day by 3 PM', days: '3 days' },
  ],

  // Ground (3 services)
  GROUND: [
    { code: 'FEDEX_GROUND', name: 'Ground', description: 'Business delivery', days: '1-5 days' },
    {
      code: 'GROUND_HOME_DELIVERY',
      name: 'Home Delivery',
      description: 'Residential delivery',
      days: '1-5 days',
    },
    {
      code: 'FEDEX_REGIONAL_ECONOMY',
      name: 'Regional Economy',
      description: 'Regional ground',
      days: '2-7 days',
    },
  ],

  // SmartPost (1 service)
  SMARTPOST: [
    {
      code: 'SMART_POST',
      name: 'Ground Economy',
      description: 'Economy with USPS delivery (Cheapest)',
      days: '2-7 days',
    },
  ],

  // Freight (6 services)
  FREIGHT: [
    { code: 'FEDEX_1_DAY_FREIGHT', name: '1 Day Freight', description: 'Next day freight', days: '1 day' },
    { code: 'FEDEX_2_DAY_FREIGHT', name: '2 Day Freight', description: 'Second day freight', days: '2 days' },
    { code: 'FEDEX_3_DAY_FREIGHT', name: '3 Day Freight', description: 'Third day freight', days: '3 days' },
    {
      code: 'FEDEX_FREIGHT_ECONOMY',
      name: 'Freight Economy',
      description: 'Economy freight',
      days: '5-7 days',
    },
    {
      code: 'FEDEX_FREIGHT_PRIORITY',
      name: 'Freight Priority',
      description: 'Priority freight',
      days: '2-4 days',
    },
    {
      code: 'FEDEX_NATIONAL_FREIGHT',
      name: 'National Freight',
      description: 'Cross-country freight',
      days: '3-7 days',
    },
  ],

  // International (8 services)
  INTERNATIONAL: [
    {
      code: 'INTERNATIONAL_ECONOMY',
      name: 'International Economy',
      description: 'Economy international',
      days: '5-7 days',
    },
    {
      code: 'INTERNATIONAL_PRIORITY',
      name: 'International Priority',
      description: 'Priority international',
      days: '3-5 days',
    },
    {
      code: 'INTERNATIONAL_FIRST',
      name: 'International First',
      description: 'Fastest international',
      days: '1-3 days',
    },
    {
      code: 'INTERNATIONAL_GROUND',
      name: 'International Ground',
      description: 'Ground to Canada/Mexico',
      days: '2-7 days',
    },
    {
      code: 'FEDEX_INTERNATIONAL_CONNECT_PLUS',
      name: 'International Connect Plus',
      description: 'Economy with faster transit',
      days: '3-6 days',
    },
    {
      code: 'FEDEX_INTERNATIONAL_PRIORITY_EXPRESS',
      name: 'International Priority Express',
      description: 'Fastest delivery',
      days: '1-2 days',
    },
    {
      code: 'INTERNATIONAL_ECONOMY_FREIGHT',
      name: 'International Economy Freight',
      description: 'Economy freight international',
      days: '5-10 days',
    },
    {
      code: 'INTERNATIONAL_PRIORITY_FREIGHT',
      name: 'International Priority Freight',
      description: 'Priority freight international',
      days: '3-7 days',
    },
  ],
}

const CATEGORY_ICONS = {
  EXPRESS: Zap,
  GROUND: Truck,
  SMARTPOST: Package,
  FREIGHT: Box,
  INTERNATIONAL: Globe,
}

export function ShippingSettingsForm() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Settings state
  const [enabledServices, setEnabledServices] = useState<Set<string>>(new Set())
  const [intelligentPacking, setIntelligentPacking] = useState(true)
  const [testMode, setTestMode] = useState(false)
  const [markupPercentage, setMarkupPercentage] = useState(0)

  // API status
  const [hasApiKeys, setHasApiKeys] = useState(false)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings/shipping')
      if (response.ok) {
        const data = await response.json()
        setEnabledServices(new Set(data.enabledServices || []))
        setIntelligentPacking(data.intelligentPacking ?? true)
        setTestMode(data.testMode ?? false)
        setMarkupPercentage(data.markupPercentage ?? 0)
        setHasApiKeys(!!process.env.FEDEX_API_KEY || !data.testMode)
      } else {
        // If settings don't exist, use defaults
        const allServiceCodes = Object.values(FEDEX_SERVICES)
          .flat()
          .map((s) => s.code)
        setEnabledServices(new Set(allServiceCodes))
      }
      setLoading(false)
    } catch (error) {
      console.error('Error loading settings:', error)
      toast.error('Failed to load settings')
      setLoading(false)
    }
  }

  const handleToggleService = (code: string) => {
    const newEnabled = new Set(enabledServices)
    if (newEnabled.has(code)) {
      newEnabled.delete(code)
    } else {
      newEnabled.add(code)
    }
    setEnabledServices(newEnabled)
  }

  const handleToggleCategory = (category: keyof typeof FEDEX_SERVICES) => {
    const categoryServices = FEDEX_SERVICES[category].map((s) => s.code)
    const allEnabled = categoryServices.every((code) => enabledServices.has(code))

    const newEnabled = new Set(enabledServices)
    if (allEnabled) {
      // Disable all in category
      categoryServices.forEach((code) => newEnabled.delete(code))
    } else {
      // Enable all in category
      categoryServices.forEach((code) => newEnabled.add(code))
    }
    setEnabledServices(newEnabled)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/settings/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          enabledServices: Array.from(enabledServices),
          intelligentPacking,
          testMode,
          markupPercentage,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(data.message || 'Shipping settings saved successfully')
      } else {
        const errorData = await response.json()
        toast.error(errorData.error || 'Failed to save settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    )
  }

  const totalServices = Object.values(FEDEX_SERVICES).flat().length
  const enabledCount = enabledServices.size

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                FedEx Ultra-Integration Settings
              </CardTitle>
              <CardDescription>
                Configure 30+ FedEx services with intelligent packing and automatic freight detection
              </CardDescription>
            </div>
            <Badge className="gap-1" variant={hasApiKeys ? 'default' : 'secondary'}>
              {hasApiKeys ? (
                <>
                  <CheckCircle className="h-3 w-3" />
                  Live API
                </>
              ) : (
                <>
                  <AlertCircle className="h-3 w-3" />
                  Test Mode
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {enabledCount} of {totalServices} services enabled
            </span>
            <Button disabled={saving} onClick={handleSave}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Saving...' : 'Save All Changes'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Configuration</CardTitle>
          <CardDescription>General FedEx integration settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Intelligent Box Packing</Label>
              <p className="text-sm text-muted-foreground">
                Automatically select optimal FedEx box types (saves 15-30%)
              </p>
            </div>
            <Switch checked={intelligentPacking} onCheckedChange={setIntelligentPacking} />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Test Mode</Label>
              <p className="text-sm text-muted-foreground">Use estimated rates instead of live API</p>
            </div>
            <Switch checked={testMode} onCheckedChange={setTestMode} />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="markup">Price Markup Percentage</Label>
            <Input
              id="markup"
              max="100"
              min="0"
              placeholder="0"
              type="number"
              value={markupPercentage}
              onChange={(e) => setMarkupPercentage(Number(e.target.value))}
            />
            <p className="text-sm text-muted-foreground">
              Add a percentage markup to all FedEx rates (default: 0%)
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Configuration Cards */}
      {Object.entries(FEDEX_SERVICE_CATEGORIES).map(([categoryKey, categoryName]) => {
        const category = categoryKey as keyof typeof FEDEX_SERVICES
        const services = FEDEX_SERVICES[category]
        const CategoryIcon = CATEGORY_ICONS[category]
        const categoryEnabledCount = services.filter((s) => enabledServices.has(s.code)).length

        return (
          <Card key={category}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2">
                    <CategoryIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{categoryName}</CardTitle>
                    <CardDescription>
                      {categoryEnabledCount} of {services.length} services enabled
                    </CardDescription>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleToggleCategory(category)}
                >
                  {categoryEnabledCount === services.length ? 'Disable All' : 'Enable All'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {services.map((service) => (
                  <div
                    key={service.code}
                    className="flex items-center justify-between rounded-lg border p-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium">{service.name}</p>
                        <Badge className="text-xs" variant="outline">
                          {service.days}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                    </div>
                    <Switch
                      checked={enabledServices.has(service.code)}
                      onCheckedChange={() => handleToggleService(service.code)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )
      })}

      {/* Southwest Cargo Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-600/10 p-2">
                <Plane className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Southwest Cargo</CardTitle>
                <CardDescription>Airport pickup shipping (82 locations)</CardDescription>
              </div>
            </div>
            <Badge className="gap-1" variant="default">
              <CheckCircle className="h-3 w-3" />
              Enabled
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted/50">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Southwest Cargo Pickup</p>
                  <p className="text-sm text-muted-foreground">Customer picks up at airport ($80-133)</p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Southwest Cargo Dash</p>
                  <p className="text-sm text-muted-foreground">Premium next-flight service ($85-133+)</p>
                </div>
                <Badge variant="outline">Enabled</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-lg border-l-4 border-blue-500 bg-blue-50/50 p-4">
            <div className="flex gap-3">
              <Plane className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="space-y-2">
                <p className="text-sm font-medium text-blue-900">82 Airport Locations Available</p>
                <p className="text-sm text-blue-800">
                  Southwest Cargo serves 82 airports across 20+ states. Customers can pick up orders at
                  any Southwest Cargo location. View all locations at{' '}
                  <a className="underline font-medium" href="/locations">
                    /locations
                  </a>
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[
                    'TX',
                    'OK',
                    'NM',
                    'AR',
                    'LA',
                    'AZ',
                    'CA',
                    'NV',
                    'CO',
                    'UT',
                    'FL',
                    'GA',
                    'AL',
                    'TN',
                    'MS',
                    'SC',
                    'NC',
                    'KY',
                    'MO',
                    'KS',
                  ].map((state) => (
                    <Badge key={state} className="text-xs" variant="secondary">
                      {state}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="pt-6">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-medium text-blue-900">Shipping Integration Status</p>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>✓ FedEx: 30+ services with automatic freight detection</li>
                <li>✓ Southwest Cargo: 82 airport locations across 20+ states</li>
                <li>✓ SmartPost automatically offered for residential addresses (20-40% cheaper)</li>
                <li>✓ Real-time rates from FedEx API with automatic fallback</li>
                <li>✓ Intelligent box packing using 14 official FedEx box types</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
