'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/components/white-label/theme-provider'
import { useTenantInfo } from '@/components/tenants/tenant-provider'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { Tabs, TabsContent, TabsList } from '@/components/ui/tabs'
import { ColorPicker } from '@/components/ui/color-picker'
import { ImageUpload } from '@/components/ui/image-upload'
import { CodeEditor } from '@/components/ui/code-editor'
import { useToast } from '@/hooks/use-toast'
import { Save, RefreshCw, Eye, Download, Upload } from 'lucide-react'

interface BrandEditorProps {
  section: 'colors' | 'typography' | 'logos' | 'layout' | 'custom' | 'email'
}

interface BrandConfig {
  // Colors
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string

  // Typography
  primaryFont: string
  secondaryFont: string
  fontSize: string
  fontWeight: string
  lineHeight: string

  // Layout
  borderRadius: string
  spacing: string
  containerWidth: string
  headerHeight: string

  // Branding
  logoUrl: string
  logoText: string
  faviconUrl: string
  brandName: string

  // Custom
  customCss: string
  customJs: string

  // Email
  emailHeaderLogo: string
  emailFooterText: string
  emailColors: {
    header: string
    headerText: string
    footer: string
    footerText: string
    button: string
    buttonText: string
  }
}

export function BrandEditor({ section }: BrandEditorProps) {
  const { theme } = useTheme()
  const tenant = useTenantInfo()
  const { toast } = useToast()

  const [config, setConfig] = useState<BrandConfig>({
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    accentColor: '#f59e0b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    primaryFont: 'Inter',
    secondaryFont: 'Inter',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '1.6',
    borderRadius: '8px',
    spacing: '16px',
    containerWidth: '1200px',
    headerHeight: '64px',
    logoUrl: '',
    logoText: tenant?.name || 'GangRun Printing',
    faviconUrl: '',
    brandName: tenant?.name || 'GangRun Printing',
    customCss: '',
    customJs: '',
    emailHeaderLogo: '',
    emailFooterText: '',
    emailColors: {
      header: '#3b82f6',
      headerText: '#ffffff',
      footer: '#64748b',
      footerText: '#ffffff',
      button: '#f59e0b',
      buttonText: '#ffffff',
    },
  })

  const [isLoading, setIsLoading] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  // Load existing configuration
  useEffect(() => {
    loadBrandConfig()
  }, [tenant])

  const loadBrandConfig = async () => {
    if (!tenant) return

    try {
      const response = await fetch(`/api/admin/brand-config/${tenant.id}`)
      if (response.ok) {
        const data = await response.json()
        setConfig((prev) => ({ ...prev, ...data.config }))
      }
    } catch (error) {
      }
  }

  const saveBrandConfig = async () => {
    if (!tenant) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/admin/brand-config/${tenant.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ config }),
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Brand configuration saved successfully',
        })
      } else {
        throw new Error('Failed to save configuration')
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save brand configuration',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const resetToDefaults = () => {
    setConfig({
      primaryColor: '#3b82f6',
      secondaryColor: '#64748b',
      accentColor: '#f59e0b',
      backgroundColor: '#ffffff',
      textColor: '#1f2937',
      primaryFont: 'Inter',
      secondaryFont: 'Inter',
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.6',
      borderRadius: '8px',
      spacing: '16px',
      containerWidth: '1200px',
      headerHeight: '64px',
      logoUrl: '',
      logoText: tenant?.name || 'GangRun Printing',
      faviconUrl: '',
      brandName: tenant?.name || 'GangRun Printing',
      customCss: '',
      customJs: '',
      emailHeaderLogo: '',
      emailFooterText: '',
      emailColors: {
        header: '#3b82f6',
        headerText: '#ffffff',
        footer: '#64748b',
        footerText: '#ffffff',
        button: '#f59e0b',
        buttonText: '#ffffff',
      },
    })
  }

  const exportConfig = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr)

    const exportFileDefaultName = `${tenant?.slug || 'brand'}-theme-config.json`

    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const importConfig = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedConfig = JSON.parse(e.target?.result as string)
        setConfig((prev) => ({ ...prev, ...importedConfig }))
        toast({
          title: 'Success',
          description: 'Configuration imported successfully',
        })
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to import configuration',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }

  const updateConfig = (key: keyof BrandConfig, value: any) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const updateEmailColor = (key: keyof BrandConfig['emailColors'], value: string) => {
    setConfig((prev) => ({
      ...prev,
      emailColors: { ...prev.emailColors, [key]: value },
    }))
  }

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button disabled={isLoading} onClick={saveBrandConfig}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
          <Button variant="outline" onClick={resetToDefaults}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset
          </Button>
          <Button variant="outline" onClick={() => setPreviewMode(!previewMode)}>
            <Eye className="mr-2 h-4 w-4" />
            {previewMode ? 'Edit' : 'Preview'}
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportConfig}>
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
          <div className="relative">
            <Button asChild variant="outline">
              <label>
                <Upload className="mr-2 h-4 w-4" />
                Import
                <input
                  accept=".json"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  name="importConfig"
                  type="file"
                  onChange={importConfig}
                />
              </label>
            </Button>
          </div>
        </div>
      </div>

      {/* Section Content */}
      {section === 'colors' && <ColorsSection config={config} updateConfig={updateConfig} />}

      {section === 'typography' && (
        <TypographySection config={config} updateConfig={updateConfig} />
      )}

      {section === 'logos' && <LogosSection config={config} updateConfig={updateConfig} />}

      {section === 'layout' && <LayoutSection config={config} updateConfig={updateConfig} />}

      {section === 'custom' && <CustomSection config={config} updateConfig={updateConfig} />}

      {section === 'email' && (
        <EmailSection
          config={config}
          updateConfig={updateConfig}
          updateEmailColor={updateEmailColor}
        />
      )}
    </div>
  )
}

// Colors Section
function ColorsSection({
  config,
  updateConfig,
}: {
  config: BrandConfig
  updateConfig: (key: keyof BrandConfig, value: any) => void
}) {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Primary Colors</CardTitle>
          <CardDescription>Main brand colors used throughout the application</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="primaryColor">Primary Color</Label>
            <ColorPicker
              value={config.primaryColor}
              onChange={(color) => updateConfig('primaryColor', color)}
            />
          </div>
          <div>
            <Label htmlFor="secondaryColor">Secondary Color</Label>
            <ColorPicker
              value={config.secondaryColor}
              onChange={(color) => updateConfig('secondaryColor', color)}
            />
          </div>
          <div>
            <Label htmlFor="accentColor">Accent Color</Label>
            <ColorPicker
              value={config.accentColor}
              onChange={(color) => updateConfig('accentColor', color)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Background & Text</CardTitle>
          <CardDescription>Background and text color settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="backgroundColor">Background Color</Label>
            <ColorPicker
              value={config.backgroundColor}
              onChange={(color) => updateConfig('backgroundColor', color)}
            />
          </div>
          <div>
            <Label htmlFor="textColor">Text Color</Label>
            <ColorPicker
              value={config.textColor}
              onChange={(color) => updateConfig('textColor', color)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Typography Section
function TypographySection({
  config,
  updateConfig,
}: {
  config: BrandConfig
  updateConfig: (key: keyof BrandConfig, value: any) => void
}) {
  const fontOptions = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Montserrat',
    'Poppins',
    'Source Sans Pro',
    'Nunito',
    'Raleway',
    'Ubuntu',
    'Work Sans',
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Font Families</CardTitle>
          <CardDescription>Choose fonts for your brand</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="primaryFont">Primary Font</Label>
            <Select
              value={config.primaryFont}
              onValueChange={(value) => updateConfig('primaryFont', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="secondaryFont">Secondary Font</Label>
            <Select
              value={config.secondaryFont}
              onValueChange={(value) => updateConfig('secondaryFont', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fontOptions.map((font) => (
                  <SelectItem key={font} value={font}>
                    {font}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Typography Settings</CardTitle>
          <CardDescription>Configure text size and spacing</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="fontSize">Base Font Size</Label>
            <Input
              placeholder="16px"
              value={config.fontSize}
              onChange={(e) => updateConfig('fontSize', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="fontWeight">Font Weight</Label>
            <Select
              value={config.fontWeight}
              onValueChange={(value) => updateConfig('fontWeight', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="300">Light (300)</SelectItem>
                <SelectItem value="400">Regular (400)</SelectItem>
                <SelectItem value="500">Medium (500)</SelectItem>
                <SelectItem value="600">Semi-bold (600)</SelectItem>
                <SelectItem value="700">Bold (700)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="lineHeight">Line Height</Label>
            <Input
              placeholder="1.6"
              value={config.lineHeight}
              onChange={(e) => updateConfig('lineHeight', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Logos Section
function LogosSection({
  config,
  updateConfig,
}: {
  config: BrandConfig
  updateConfig: (key: keyof BrandConfig, value: any) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Brand Assets</CardTitle>
          <CardDescription>Upload and manage your brand logos and images</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="logoUrl">Main Logo</Label>
            <ImageUpload
              className="mt-2"
              value={config.logoUrl}
              onChange={(url) => updateConfig('logoUrl', url)}
            />
          </div>
          <div>
            <Label htmlFor="faviconUrl">Favicon</Label>
            <ImageUpload
              accept="image/x-icon,image/png"
              className="mt-2"
              value={config.faviconUrl}
              onChange={(url) => updateConfig('faviconUrl', url)}
            />
          </div>
          <div>
            <Label htmlFor="logoText">Logo Text</Label>
            <Input
              placeholder="Brand Name"
              value={config.logoText}
              onChange={(e) => updateConfig('logoText', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="brandName">Brand Name</Label>
            <Input
              placeholder="Your Company Name"
              value={config.brandName}
              onChange={(e) => updateConfig('brandName', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Layout Section
function LayoutSection({
  config,
  updateConfig,
}: {
  config: BrandConfig
  updateConfig: (key: keyof BrandConfig, value: any) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Layout Properties</CardTitle>
          <CardDescription>Configure spacing and layout dimensions</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="borderRadius">Border Radius</Label>
            <Input
              placeholder="8px"
              value={config.borderRadius}
              onChange={(e) => updateConfig('borderRadius', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="spacing">Base Spacing</Label>
            <Input
              placeholder="16px"
              value={config.spacing}
              onChange={(e) => updateConfig('spacing', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="containerWidth">Container Width</Label>
            <Input
              placeholder="1200px"
              value={config.containerWidth}
              onChange={(e) => updateConfig('containerWidth', e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="headerHeight">Header Height</Label>
            <Input
              placeholder="64px"
              value={config.headerHeight}
              onChange={(e) => updateConfig('headerHeight', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Custom Section
function CustomSection({
  config,
  updateConfig,
}: {
  config: BrandConfig
  updateConfig: (key: keyof BrandConfig, value: any) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Custom CSS</CardTitle>
          <CardDescription>Add custom CSS for advanced styling</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeEditor
            height="300px"
            language="css"
            value={config.customCss}
            onChange={(value) => updateConfig('customCss', value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom JavaScript</CardTitle>
          <CardDescription>Add custom JavaScript for additional functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <CodeEditor
            height="200px"
            language="javascript"
            value={config.customJs}
            onChange={(value) => updateConfig('customJs', value)}
          />
        </CardContent>
      </Card>
    </div>
  )
}

// Email Section
function EmailSection({
  config,
  updateConfig,
  updateEmailColor,
}: {
  config: BrandConfig
  updateConfig: (key: keyof BrandConfig, value: any) => void
  updateEmailColor: (key: keyof BrandConfig['emailColors'], value: string) => void
}) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Branding</CardTitle>
          <CardDescription>Customize email template appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="emailHeaderLogo">Email Header Logo</Label>
            <ImageUpload
              className="mt-2"
              value={config.emailHeaderLogo}
              onChange={(url) => updateConfig('emailHeaderLogo', url)}
            />
          </div>
          <div>
            <Label htmlFor="emailFooterText">Email Footer Text</Label>
            <Textarea
              placeholder="Copyright © 2024 Your Company. All rights reserved."
              value={config.emailFooterText}
              onChange={(e) => updateConfig('emailFooterText', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email Colors</CardTitle>
          <CardDescription>Configure colors for email templates</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label>Header Background</Label>
            <ColorPicker
              value={config.emailColors.header}
              onChange={(color) => updateEmailColor('header', color)}
            />
          </div>
          <div>
            <Label>Header Text</Label>
            <ColorPicker
              value={config.emailColors.headerText}
              onChange={(color) => updateEmailColor('headerText', color)}
            />
          </div>
          <div>
            <Label>Footer Background</Label>
            <ColorPicker
              value={config.emailColors.footer}
              onChange={(color) => updateEmailColor('footer', color)}
            />
          </div>
          <div>
            <Label>Footer Text</Label>
            <ColorPicker
              value={config.emailColors.footerText}
              onChange={(color) => updateEmailColor('footerText', color)}
            />
          </div>
          <div>
            <Label>Button Color</Label>
            <ColorPicker
              value={config.emailColors.button}
              onChange={(color) => updateEmailColor('button', color)}
            />
          </div>
          <div>
            <Label>Button Text</Label>
            <ColorPicker
              value={config.emailColors.buttonText}
              onChange={(color) => updateEmailColor('buttonText', color)}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
