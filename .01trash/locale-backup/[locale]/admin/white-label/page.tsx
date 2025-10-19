// Temporarily simplified - i18n disabled
import { Suspense } from 'react'
import { BrandEditor } from '@/components/white-label/brand-editor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Loading } from '@/components/ui/loading'
import { Palette, Layout, Image, Code, Mail, Eye } from 'lucide-react'

// Force dynamic rendering for admin pages (requires authentication)
export const dynamic = 'force-dynamic'

type Props = {
  params: Promise<{ locale: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function WhiteLabelPage({ params, searchParams }: Props) {
  const { locale } = await params
  const search = await searchParams

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White Label Settings</h1>
          <p className="text-muted-foreground mt-2">
            Customize your brand appearance and white-label settings
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary">Current Locale: {locale.toUpperCase()}</Badge>
        </div>
      </div>

      <Tabs className="space-y-4" defaultValue="brand">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger className="flex items-center gap-2" value="brand">
            <Palette className="h-4 w-4" />
            Brand Colors
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="typography">
            <Layout className="h-4 w-4" />
            Typography
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="logos">
            <Image className="h-4 w-4" />
            Logos & Assets
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="layout">
            <Layout className="h-4 w-4" />
            Layout
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="custom">
            <Code className="h-4 w-4" />
            Custom CSS
          </TabsTrigger>
          <TabsTrigger className="flex items-center gap-2" value="email">
            <Mail className="h-4 w-4" />
            Email Themes
          </TabsTrigger>
        </TabsList>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor Panel */}
          <div className="lg:col-span-2 space-y-4">
            <TabsContent className="mt-0" value="brand">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Brand Colors
                  </CardTitle>
                  <CardDescription>Define your brand's primary color palette</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Loading />}>
                    <BrandEditor section="colors" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="typography">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Typography
                  </CardTitle>
                  <CardDescription>Configure fonts and text styling</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Loading />}>
                    <BrandEditor section="typography" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="logos">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Image className="h-5 w-5" />
                    Logos & Assets
                  </CardTitle>
                  <CardDescription>Upload and manage your brand assets</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Loading />}>
                    <BrandEditor section="logos" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="layout">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="h-5 w-5" />
                    Layout & Spacing
                  </CardTitle>
                  <CardDescription>Adjust layout properties and spacing</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Loading />}>
                    <BrandEditor section="layout" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="custom">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="h-5 w-5" />
                    Custom CSS & JavaScript
                  </CardTitle>
                  <CardDescription>Add custom styling and functionality</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Loading />}>
                    <BrandEditor section="custom" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent className="mt-0" value="email">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Email Templates
                  </CardTitle>
                  <CardDescription>Customize email template appearance</CardDescription>
                </CardHeader>
                <CardContent>
                  <Suspense fallback={<Loading />}>
                    <BrandEditor section="email" />
                  </Suspense>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          {/* Preview Panel */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Live Preview
                </CardTitle>
                <CardDescription>See how your changes look in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Loading />}>
                  <BrandPreview />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Theme Templates</CardTitle>
                <CardDescription>Choose from pre-made themes</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Loading />}>
                  <ThemeTemplates />
                </Suspense>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Export/Import</CardTitle>
                <CardDescription>Manage your theme configurations</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<Loading />}>
                  <ThemeImportExport />
                </Suspense>
              </CardContent>
            </Card>
          </div>
        </div>
      </Tabs>
    </div>
  )
}

// Component stubs - these will be implemented
function BrandPreview() {
  return (
    <div className="space-y-4">
      <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-sm text-gray-500">Live preview will appear here</p>
      </div>
      <div className="text-xs text-gray-500">Preview updates automatically as you make changes</div>
    </div>
  )
}

function ThemeTemplates() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Theme Templates Component</p>
    </div>
  )
}

function ThemeImportExport() {
  return (
    <div className="space-y-2">
      <p className="text-sm text-gray-600">Import/Export Component</p>
    </div>
  )
}
