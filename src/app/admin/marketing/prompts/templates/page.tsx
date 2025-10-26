import { Suspense } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ArrowLeft, FileText } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { TemplateGrid } from './template-grid'
import type { PromptCategory } from '@prisma/client'

async function getTemplates() {
  const templates = await prisma.promptTemplate.findMany({
    where: { isTemplate: true },
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })

  return templates
}

async function getTemplatesByCategory() {
  const templates = await getTemplates()

  const byCategory = templates.reduce(
    (acc, template) => {
      if (!acc[template.category]) {
        acc[template.category] = []
      }
      acc[template.category].push(template)
      return acc
    },
    {} as Record<PromptCategory, typeof templates>
  )

  return byCategory
}

export default async function TemplatesPage() {
  const templatesByCategory = await getTemplatesByCategory()

  const categories: { value: PromptCategory; label: string; description: string }[] = [
    {
      value: 'PRODUCT',
      label: 'Product',
      description: 'Clean product shots and catalog photography',
    },
    {
      value: 'PROMOTIONAL',
      label: 'Promotional',
      description: 'Marketing materials and promotional content',
    },
    {
      value: 'SEASONAL',
      label: 'Seasonal',
      description: 'Holiday and seasonal campaigns',
    },
    {
      value: 'LIFESTYLE',
      label: 'Lifestyle',
      description: 'Real-world usage and lifestyle scenarios',
    },
    {
      value: 'ENVIRONMENT',
      label: 'Environment',
      description: 'Print shop and production environments',
    },
  ]

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/marketing/prompts">
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Prompts
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            Prompt Templates
          </h1>
          <p className="text-muted-foreground mt-1">
            Start with a pre-built template and customize it for your needs
          </p>
        </div>
      </div>

      {/* Templates by Category */}
      <Tabs defaultValue="PRODUCT" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          {categories.map((cat) => (
            <TabsTrigger key={cat.value} value={cat.value}>
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((cat) => (
          <TabsContent key={cat.value} value={cat.value} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>{cat.label}</CardTitle>
                <CardDescription>{cat.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Suspense fallback={<div>Loading templates...</div>}>
                  <TemplateGrid templates={templatesByCategory[cat.value] || []} />
                </Suspense>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
