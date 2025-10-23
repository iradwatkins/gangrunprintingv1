'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, UserPlus, User, Mail, Phone, Briefcase } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export interface Customer {
  id: string
  name: string
  email: string
  phoneNumber?: string | null
  isBroker: boolean
  brokerDiscounts?: Record<string, number> | null
}

export interface NewCustomerData {
  email: string
  name: string
  phone?: string
}

interface CustomerSelectorProps {
  onSelectExisting?: (customer: Customer) => void
  onCreateNew?: (customer: NewCustomerData) => void
  selectedCustomer?: Customer | null
  newCustomer?: NewCustomerData | null
}

export function CustomerSelector({
  onSelectExisting,
  onCreateNew,
  selectedCustomer,
  newCustomer,
}: CustomerSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<'existing' | 'new'>(selectedCustomer ? 'existing' : 'new')

  // New customer form state
  const [newCustomerForm, setNewCustomerForm] = useState<NewCustomerData>({
    email: newCustomer?.email || '',
    name: newCustomer?.name || '',
    phone: newCustomer?.phone || '',
  })

  // Search customers when search term changes
  useEffect(() => {
    if (searchTerm.length >= 2) {
      searchCustomers()
    } else {
      setCustomers([])
    }
  }, [searchTerm])

  const searchCustomers = async () => {
    try {
      setLoading(true)
      const response = await fetch(
        `/api/admin/customers/search?q=${encodeURIComponent(searchTerm)}`
      )
      if (response.ok) {
        const data = await response.json()
        setCustomers(data.customers || [])
      }
    } catch (error) {
      console.error('Failed to search customers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectCustomer = (customer: Customer) => {
    onSelectExisting?.(customer)
    setMode('existing')
  }

  const handleCreateNew = () => {
    if (!newCustomerForm.email || !newCustomerForm.name) {
      return
    }
    onCreateNew?.(newCustomerForm)
  }

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Customer Selection
        </CardTitle>
        <CardDescription>
          Search for an existing customer or create a new customer account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={mode} onValueChange={(v) => setMode(v as 'existing' | 'new')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="existing">Existing Customer</TabsTrigger>
            <TabsTrigger value="new">New Customer</TabsTrigger>
          </TabsList>

          {/* Existing Customer Tab */}
          <TabsContent className="space-y-4" value="existing">
            {selectedCustomer ? (
              <div className="rounded-lg border bg-muted/50 p-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{selectedCustomer.name}</h3>
                      {selectedCustomer.isBroker && (
                        <Badge variant="default">
                          <Briefcase className="h-3 w-3 mr-1" />
                          Broker
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {selectedCustomer.email}
                    </div>
                    {selectedCustomer.phoneNumber && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        {selectedCustomer.phoneNumber}
                      </div>
                    )}
                    {selectedCustomer.isBroker && selectedCustomer.brokerDiscounts && (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Broker discounts: {Object.keys(selectedCustomer.brokerDiscounts).length}{' '}
                        categories
                      </div>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onSelectExisting?.(null as any)}
                  >
                    Change
                  </Button>
                </div>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {loading && (
                  <div className="text-center py-4 text-sm text-muted-foreground">Searching...</div>
                )}

                {searchTerm.length >= 2 && !loading && filteredCustomers.length === 0 && (
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    No customers found. Try creating a new customer instead.
                  </div>
                )}

                {filteredCustomers.length > 0 && (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {filteredCustomers.map((customer) => (
                      <button
                        key={customer.id}
                        className="w-full text-left p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        onClick={() => handleSelectCustomer(customer)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{customer.name}</span>
                              {customer.isBroker && (
                                <Badge className="text-xs" variant="outline">
                                  <Briefcase className="h-2 w-2 mr-1" />
                                  Broker
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">{customer.email}</div>
                            {customer.phoneNumber && (
                              <div className="text-xs text-muted-foreground">
                                {customer.phoneNumber}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          {/* New Customer Tab */}
          <TabsContent className="space-y-4" value="new">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new-customer-email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-customer-email"
                  placeholder="customer@example.com"
                  type="email"
                  value={newCustomerForm.email}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, email: e.target.value })
                  }
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-customer-name">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-customer-name"
                  placeholder="John Smith"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="new-customer-phone">Phone (Optional)</Label>
                <Input
                  id="new-customer-phone"
                  placeholder="(555) 123-4567"
                  type="tel"
                  value={newCustomerForm.phone}
                  onChange={(e) =>
                    setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })
                  }
                />
              </div>

              <div className="rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground">
                A new customer account will be created when you submit this order. The customer will
                be able to log in and view their order history.
              </div>

              <Button
                className="w-full"
                disabled={!newCustomerForm.email || !newCustomerForm.name}
                onClick={handleCreateNew}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Use This New Customer
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
