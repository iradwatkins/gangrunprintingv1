import { Suspense } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react'
import { ApiConfigForm } from './api-config-form'
import { prisma } from '@/lib/prisma'

async function getApiSettings() {
  const settings = await prisma.settings.findMany({
    where: {
      category: 'ai_image_generation',
      isActive: true,
    },
    orderBy: { key: 'asc' },
  })

  return settings
}

export default async function DesignCenterSettingsPage() {
  const settings = await getApiSettings()

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link href="/admin/design-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Design Center
              </Button>
            </Link>
          </div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <SettingsIcon className="h-8 w-8 text-primary" />
            AI Provider Settings
          </h1>
          <p className="text-muted-foreground mt-1">
            Configure API keys for different AI image generation providers
          </p>
        </div>
      </div>

      {/* API Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Supported AI Providers</CardTitle>
          <CardDescription>
            Add your API keys for the providers you want to use. Keys are stored securely and encrypted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading settings...</div>}>
            <ApiConfigForm initialSettings={settings} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Info Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Google Imagen (Vertex AI)</CardTitle>
            <CardDescription>Google's Imagen 3 model via Vertex AI</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              High-quality photorealistic images with excellent prompt understanding
            </p>
            <a
              href="https://cloud.google.com/vertex-ai/generative-ai/docs/image/generate-images"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Get API Key →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">OpenAI DALL-E 3</CardTitle>
            <CardDescription>OpenAI's latest image generation model</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Creative and artistic images with natural language prompts
            </p>
            <a
              href="https://platform.openai.com/api-keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Get API Key →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stability AI</CardTitle>
            <CardDescription>Stable Diffusion models</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Open-source models with fine control and customization
            </p>
            <a
              href="https://platform.stability.ai/account/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline"
            >
              Get API Key →
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Midjourney</CardTitle>
            <CardDescription>Premium artistic image generation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-sm text-muted-foreground">
              High-quality artistic and stylized images (via third-party API)
            </p>
            <p className="text-sm text-muted-foreground italic">
              Note: Requires third-party API service
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
