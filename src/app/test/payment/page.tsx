'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CreditCard, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  ShoppingCart,
  Package,
  DollarSign,
  RefreshCw
} from 'lucide-react'

interface TestResult {
  success: boolean
  message: string
  data?: any
  timestamp: Date
}

export default function PaymentTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [orderNumber, setOrderNumber] = useState('')
  const [testEmail, setTestEmail] = useState('test@gangrunprinting.com')
  const [testAmount, setTestAmount] = useState('99.99')

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev].slice(0, 10))
  }

  // Test creating a checkout session
  const testCheckout = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: [
            {
              name: 'Test Product - Flyers',
              productName: 'Premium Flyers',
              sku: 'TEST-001',
              quantity: 100,
              price: Math.round(parseFloat(testAmount) * 100),
              options: {
                size: '4x6',
                paper: '16pt Gloss',
                coating: 'UV Coating',
                sides: 'Double Sided'
              }
            }
          ],
          email: testEmail,
          name: 'Test Customer',
          phone: '555-0123',
          shippingAddress: {
            street: '123 Test Street',
            city: 'Test City',
            state: 'TX',
            zip: '12345',
            country: 'US'
          },
          shippingMethod: 'standard'
        })
      })

      const data = await response.json()
      
      if (data.checkoutUrl) {
        addResult({
          success: true,
          message: 'Checkout session created successfully',
          data: {
            orderNumber: data.order?.orderNumber,
            checkoutUrl: data.checkoutUrl,
            total: data.order?.total
          },
          timestamp: new Date()
        })
        
        // Open Square checkout in new tab
        window.open(data.checkoutUrl, '_blank')
      } else {
        addResult({
          success: false,
          message: 'Checkout creation failed',
          data: data,
          timestamp: new Date()
        })
      }
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      })
    } finally {
      setLoading(false)
    }
  }

  // Test webhook endpoint
  const testWebhook = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/square', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'payment.created',
          data: {
            object: {
              id: 'test_payment_' + Date.now(),
              status: 'COMPLETED',
              amount_money: { amount: 10000, currency: 'USD' },
              order_id: 'test_order_' + Date.now(),
              created_at: new Date().toISOString()
            }
          }
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: response.ok ? 'Webhook test successful' : 'Webhook test failed',
        data,
        timestamp: new Date()
      })
    } catch (error) {
      addResult({
        success: false,
        message: `Webhook error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      })
    } finally {
      setLoading(false)
    }
  }

  // Test order status check
  const checkOrderStatus = async () => {
    if (!orderNumber) {
      addResult({
        success: false,
        message: 'Please enter an order number',
        timestamp: new Date()
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/orders?orderNumber=${orderNumber}`)
      const data = await response.json()
      
      addResult({
        success: response.ok,
        message: response.ok ? 'Order found' : 'Order not found',
        data,
        timestamp: new Date()
      })
    } catch (error) {
      addResult({
        success: false,
        message: `Error checking order: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      })
    } finally {
      setLoading(false)
    }
  }

  // Test email notification
  const testEmailNotification = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: testEmail,
          orderNumber: 'TEST-' + Date.now(),
          type: 'order_confirmation'
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: response.ok ? `Email sent to ${testEmail}` : 'Email sending failed',
        data,
        timestamp: new Date()
      })
    } catch (error) {
      addResult({
        success: false,
        message: `Email error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      })
    } finally {
      setLoading(false)
    }
  }

  // Test health check
  const testHealthCheck = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/health')
      const data = await response.json()
      
      addResult({
        success: data.status === 'healthy',
        message: `System status: ${data.status}`,
        data,
        timestamp: new Date()
      })
    } catch (error) {
      addResult({
        success: false,
        message: `Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        timestamp: new Date()
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (success: boolean) => {
    return success ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Payment Integration Testing</h1>
        <p className="text-muted-foreground">
          Test Square payment integration, webhooks, and order processing
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Test Controls */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Test Configuration</CardTitle>
              <CardDescription>Configure test parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">Test Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                />
              </div>
              <div>
                <Label htmlFor="amount">Test Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testAmount}
                  onChange={(e) => setTestAmount(e.target.value)}
                  placeholder="99.99"
                />
              </div>
              <div>
                <Label htmlFor="order">Order Number (for status check)</Label>
                <Input
                  id="order"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="GRP-XXXXX"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test Actions</CardTitle>
              <CardDescription>Run integration tests</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="payment" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                  <TabsTrigger value="webhook">Webhooks</TabsTrigger>
                  <TabsTrigger value="system">System</TabsTrigger>
                </TabsList>
                
                <TabsContent value="payment" className="space-y-4">
                  <Button 
                    onClick={testCheckout} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CreditCard className="mr-2 h-4 w-4" />
                    )}
                    Create Test Checkout
                  </Button>
                  
                  <Button 
                    onClick={checkOrderStatus} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="mr-2 h-4 w-4" />
                    )}
                    Check Order Status
                  </Button>
                </TabsContent>
                
                <TabsContent value="webhook" className="space-y-4">
                  <Button 
                    onClick={testWebhook} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="mr-2 h-4 w-4" />
                    )}
                    Test Webhook Endpoint
                  </Button>
                  
                  <Button 
                    onClick={testEmailNotification} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <AlertCircle className="mr-2 h-4 w-4" />
                    )}
                    Test Email Notification
                  </Button>
                </TabsContent>
                
                <TabsContent value="system" className="space-y-4">
                  <Button 
                    onClick={testHealthCheck} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="mr-2 h-4 w-4" />
                    )}
                    Health Check
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Test Information */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Square Test Cards:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Success: 4111 1111 1111 1111</li>
                <li>• Decline: 4000 0000 0000 0002</li>
                <li>• CVV: Any 3 digits</li>
                <li>• Exp: Any future date</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Test Results */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Test Results</CardTitle>
            <CardDescription>Recent test execution results</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="mx-auto h-8 w-8 mb-2" />
                <p>No tests run yet</p>
                <p className="text-sm">Run a test to see results here</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={index} 
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.success)}
                        <span className="font-medium">
                          {result.message}
                        </span>
                      </div>
                      <Badge variant={result.success ? 'default' : 'destructive'}>
                        {result.success ? 'Success' : 'Failed'}
                      </Badge>
                    </div>
                    
                    {result.data && (
                      <pre className="text-xs bg-muted p-2 rounded overflow-x-auto">
                        {JSON.stringify(result.data, null, 2)}
                      </pre>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      {result.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}