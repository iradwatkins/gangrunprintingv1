'use client'

import { useState } from 'react'
import { useRouter } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { toast } from 'sonner'
import { Eye, EyeOff, Save, Key } from 'lucide-react'

interface Setting {
  id: string
  key: string
  value: string | null
  category: string
  description: string | null
  isEncrypted: boolean
  isActive: boolean
}

interface ApiConfigFormProps {
  initialSettings: Setting[]
}

const AI_PROVIDERS = [
  {
    key: 'ai_google_imagen_api_key',
    label: 'Google Imagen API Key',
    description: 'Vertex AI API key for Google Imagen 3',
    placeholder: 'Enter your Google Cloud API key',
  },
  {
    key: 'ai_openai_api_key',
    label: 'OpenAI API Key',
    description: 'API key for DALL-E 3',
    placeholder: 'sk-...',
  },
  {
    key: 'ai_stability_api_key',
    label: 'Stability AI API Key',
    description: 'API key for Stable Diffusion',
    placeholder: 'sk-...',
  },
  {
    key: 'ai_midjourney_api_key',
    label: 'Midjourney API Key',
    description: 'Third-party Midjourney API key',
    placeholder: 'Enter your Midjourney API key',
  },
]

export function ApiConfigForm({ initialSettings }: ApiConfigFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({})

  // Initialize form state from existing settings
  const initialFormState = AI_PROVIDERS.reduce((acc, provider) => {
    const existing = initialSettings.find(s => s.key === provider.key)
    acc[provider.key] = {
      value: existing?.value || '',
      isActive: existing?.isActive ?? false,
    }
    return acc
  }, {} as Record<string, { value: string; isActive: boolean }>)

  const [formState, setFormState] = useState(initialFormState)

  const toggleKeyVisibility = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/admin/design-center/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          settings: Object.entries(formState).map(([key, data]) => ({
            key,
            value: data.value,
            isActive: data.isActive,
            category: 'ai_image_generation',
            isEncrypted: true,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('API settings saved successfully')
      router.refresh()
    } catch (error) {
      console.error('Error saving settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
      {AI_PROVIDERS.map((provider) => {
        const state = formState[provider.key]
        const isVisible = showKeys[provider.key]

        return (
          <div key={provider.key} className="space-y-3 pb-6 border-b last:border-0">
            <div className="flex items-start justify-between">
              <div>
                <Label className="text-base font-semibold">{provider.label}</Label>
                <p className="text-sm text-muted-foreground mt-1">{provider.description}</p>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor={`${provider.key}-active`} className="text-sm">
                  Active
                </Label>
                <Switch
                  id={`${provider.key}-active`}
                  checked={state.isActive}
                  onCheckedChange={(checked) =>
                    setFormState((prev) => ({
                      ...prev,
                      [provider.key]: { ...prev[provider.key], isActive: checked },
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Input
                  type={isVisible ? 'text' : 'password'}
                  placeholder={provider.placeholder}
                  value={state.value}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      [provider.key]: { ...prev[provider.key], value: e.target.value },
                    }))
                  }
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility(provider.key)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {state.value && state.isActive && (
              <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-500">
                <Key className="h-4 w-4" />
                <span>Configured and active</span>
              </div>
            )}
          </div>
        )
      })}

      <div className="flex justify-end pt-4">
        <Button type="submit" disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save API Settings'}
        </Button>
      </div>
    </form>
  )
}
