'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Workflow,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Send,
  Package,
  DollarSign,
  Truck,
  FileText,
  Bell,
  BarChart,
  Users,
  Activity
} from 'lucide-react'

interface TestResult {
  success: boolean
  message: string
  data?: any
  timestamp: Date
}

export default function N8NTestPage() {
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<TestResult[]>([])
  const [orderNumber, setOrderNumber] = useState('GRP-TEST-001')
  const [vendorId, setVendorId] = useState('')
  const [customPayload, setCustomPayload] = useState('')

  const addResult = (result: TestResult) => {
    setResults(prev => [result, ...prev].slice(0, 15))
  }

  // Test N8N webhook endpoint status
  const testWebhookStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/n8n')
      const data = await response.json()
      
      addResult({
        success: response.ok,
        message: 'N8N webhook endpoint status',
        data,
        timestamp: new Date()
      })
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

  // Test order created workflow
  const testOrderCreated = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-n8n-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY || ''
        },
        body: JSON.stringify({
          action: 'order.created',
          orderNumber,
          autoAssignVendor: true
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: 'Order created workflow triggered',
        data,
        timestamp: new Date()
      })
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

  // Test status update workflow
  const testStatusUpdate = async (newStatus: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-n8n-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY || ''
        },
        body: JSON.stringify({
          action: 'order.status.update',
          orderNumber,
          newStatus,
          notes: `Status updated to ${newStatus} via N8N test`,
          changedBy: 'Test Interface'
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: `Status update to ${newStatus}`,
        data,
        timestamp: new Date()
      })
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

  // Test vendor assignment
  const testVendorAssignment = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-n8n-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY || ''
        },
        body: JSON.stringify({
          action: 'order.vendor.assign',
          orderNumber,
          vendorName: vendorId || 'Test Vendor',
          notes: 'Assigned via N8N test interface'
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: 'Vendor assignment workflow',
        data,
        timestamp: new Date()
      })
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

  // Test tracking update
  const testTrackingUpdate = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-n8n-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY || ''
        },
        body: JSON.stringify({
          action: 'order.tracking.update',
          orderNumber,
          trackingNumber: '1Z999AA10123456784',
          carrier: 'FEDEX',
          trackingUrl: 'https://fedex.com/track/1Z999AA10123456784'
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: 'Tracking update workflow',
        data,
        timestamp: new Date()
      })
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

  // Test notification send
  const testNotificationSend = async (type: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-n8n-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY || ''
        },
        body: JSON.stringify({
          action: 'notification.send',
          orderNumber,
          type,
          force: true
        })
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: `${type} notification workflow`,
        data,
        timestamp: new Date()
      })
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

  // Test custom webhook
  const testCustomWebhook = async () => {
    if (!customPayload) {
      addResult({
        success: false,
        message: 'Please enter a custom payload',
        timestamp: new Date()
      })
      return
    }

    setLoading(true)
    try {
      const payload = JSON.parse(customPayload)
      const response = await fetch('/api/webhooks/n8n', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-n8n-api-key': process.env.NEXT_PUBLIC_N8N_API_KEY || ''
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      addResult({
        success: response.ok,
        message: 'Custom webhook payload',
        data,
        timestamp: new Date()
      })
    } catch (error) {
      addResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Invalid JSON'}`,
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
        <h1 className="text-3xl font-bold mb-2">N8N Workflow Automation Testing</h1>
        <p className="text-muted-foreground">
          Test N8N integration workflows and automation triggers
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
                <Label htmlFor="order">Order Number</Label>
                <Input
                  id="order"
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                  placeholder="GRP-XXXXX"
                />
              </div>
              <div>
                <Label htmlFor="vendor">Vendor Name (for assignment)</Label>
                <Input
                  id="vendor"
                  value={vendorId}
                  onChange={(e) => setVendorId(e.target.value)}
                  placeholder="Vendor name"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Workflow Actions</CardTitle>
              <CardDescription>Trigger N8N workflows</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="order" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="order">Order</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="notify">Notify</TabsTrigger>
                  <TabsTrigger value="custom">Custom</TabsTrigger>
                </TabsList>
                
                <TabsContent value="order" className="space-y-4">
                  <Button 
                    onClick={testWebhookStatus} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Activity className="mr-2 h-4 w-4" />
                    )}
                    Check Webhook Status
                  </Button>
                  
                  <Button 
                    onClick={testOrderCreated} 
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Package className="mr-2 h-4 w-4" />
                    )}
                    Order Created
                  </Button>
                  
                  <Button 
                    onClick={testVendorAssignment} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Users className="mr-2 h-4 w-4" />
                    )}
                    Assign Vendor
                  </Button>
                  
                  <Button 
                    onClick={testTrackingUpdate} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Truck className="mr-2 h-4 w-4" />
                    )}
                    Update Tracking
                  </Button>
                </TabsContent>
                
                <TabsContent value="status" className="space-y-4">
                  <Button 
                    onClick={() => testStatusUpdate('PAID')} 
                    disabled={loading}
                    className="w-full"
                  >
                    <DollarSign className="mr-2 h-4 w-4" />
                    Payment Received
                  </Button>
                  
                  <Button 
                    onClick={() => testStatusUpdate('PROCESSING')} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Clock className="mr-2 h-4 w-4" />
                    Processing
                  </Button>
                  
                  <Button 
                    onClick={() => testStatusUpdate('PRINTING')} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    In Production
                  </Button>
                  
                  <Button 
                    onClick={() => testStatusUpdate('SHIPPED')} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Truck className="mr-2 h-4 w-4" />
                    Shipped
                  </Button>
                </TabsContent>
                
                <TabsContent value="notify" className="space-y-4">
                  <Button 
                    onClick={() => testNotificationSend('ORDER_CONFIRMED')} 
                    disabled={loading}
                    className="w-full"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Order Confirmation
                  </Button>
                  
                  <Button 
                    onClick={() => testNotificationSend('PAYMENT_RECEIVED')} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Payment Received
                  </Button>
                  
                  <Button 
                    onClick={() => testNotificationSend('ORDER_SHIPPED')} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Shipment Notification
                  </Button>
                  
                  <Button 
                    onClick={() => testNotificationSend('ORDER_DELIVERED')} 
                    disabled={loading}
                    variant="outline"
                    className="w-full"
                  >
                    <Bell className="mr-2 h-4 w-4" />
                    Delivery Confirmation
                  </Button>
                </TabsContent>
                
                <TabsContent value="custom" className="space-y-4">
                  <div>
                    <Label htmlFor="payload">Custom JSON Payload</Label>
                    <Textarea
                      id="payload"
                      value={customPayload}
                      onChange={(e) => setCustomPayload(e.target.value)}
                      placeholder={JSON.stringify({
                        action: 'custom.action',
                        orderNumber: 'GRP-12345',
                        data: {}
                      }, null, 2)}
                      rows={8}
                      className="font-mono text-sm"
                    />
                  </div>
                  
                  <Button 
                    onClick={testCustomWebhook} 
                    disabled={loading || !customPayload}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Send Custom Webhook
                  </Button>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Workflow Information */}
          <Alert>
            <Workflow className="h-4 w-4" />
            <AlertDescription>
              <strong>N8N Workflows:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• Order Processing Automation</li>
                <li>• Email Notifications</li>
                <li>• Vendor Assignment</li>
                <li>• Status Updates</li>
                <li>• Daily Reports</li>
              </ul>
            </AlertDescription>
          </Alert>
        </div>

        {/* Test Results */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Workflow Results</CardTitle>
            <CardDescription>Recent workflow execution results</CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Workflow className="mx-auto h-8 w-8 mb-2" />
                <p>No workflows triggered yet</p>
                <p className="text-sm">Trigger a workflow to see results</p>
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