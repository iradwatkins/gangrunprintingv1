import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Settings,
  Building,
  Bell,
  Shield,
  Palette,
  Printer,
  Mail,
  Truck,
  CreditCard,
  Webhook,
  Database,
  Save,
  RefreshCw,
  Upload,
  Download,
  Eye,
  EyeOff,
  Key,
  Zap
} from 'lucide-react'
import { GeneralSettingsForm } from '@/components/admin/settings/general-settings-form'
import { NotificationSettingsForm } from '@/components/admin/settings/notification-settings-form'
import { PrintingSettingsForm } from '@/components/admin/settings/printing-settings-form'
import { PaymentSettingsForm } from '@/components/admin/settings/payment-settings-form'
import { ShippingSettingsForm } from '@/components/admin/settings/shipping-settings-form'
import { IntegrationSettingsForm } from '@/components/admin/settings/integration-settings-form'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
          <p className="text-muted-foreground">
            Configure your printing business operations and system preferences
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          <Button>
            <Save className="mr-2 h-4 w-4" />
            Save All Changes
          </Button>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="printing" className="flex items-center gap-2">
            <Printer className="h-4 w-4" />
            Printing
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Payments
          </TabsTrigger>
          <TabsTrigger value="shipping" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Shipping
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Webhook className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general" className="space-y-4">
          <GeneralSettingsForm />
        </TabsContent>

        {/* Printing Settings Tab */}
        <TabsContent value="printing" className="space-y-4">
          <PrintingSettingsForm />
        </TabsContent>

        {/* Payment Settings Tab */}
        <TabsContent value="payments" className="space-y-4">
          <PaymentSettingsForm />
        </TabsContent>

        {/* Shipping Settings Tab */}
        <TabsContent value="shipping" className="space-y-4">
          <ShippingSettingsForm />
        </TabsContent>

        {/* Notification Settings Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <NotificationSettingsForm />
        </TabsContent>

        {/* Integration Settings Tab */}
        <TabsContent value="integrations" className="space-y-4">
          <IntegrationSettingsForm />
        </TabsContent>
      </Tabs>
    </div>
  )
}