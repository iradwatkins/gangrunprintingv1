import { Suspense } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Sparkles, Plus, FileText, Beaker, TrendingUp } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PromptList } from './prompt-list'

async function getPromptStats() {
  const [totalPrompts, totalTemplates, recentTests] = await Promise.all([
    prisma.promptTemplate.count({
      where: { isTemplate: false },
    }),
    prisma.promptTemplate.count({
      where: { isTemplate: true },
    }),
    prisma.promptTestImage.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
    }),
  ])

  return { totalPrompts, totalTemplates, recentTests }
}

async function getUserPrompts() {
  const prompts = await prisma.promptTemplate.findMany({
    where: { isTemplate: false },
    include: {
      testImages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: { testImages: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  })

  return prompts
}

export default async function PromptsPage() {
  const [stats, prompts] = await Promise.all([getPromptStats(), getUserPrompts()])

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            AI Prompt Studio
          </h1>
          <p className="text-muted-foreground mt-1">
            Create, test, and refine AI image generation prompts for your products
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/marketing/prompts/templates">
            <Button variant="outline">
              <FileText className="h-4 w-4 mr-2" />
              Browse Templates
            </Button>
          </Link>
          <Link href="/admin/marketing/prompts/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create New Prompt
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Your Prompts</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">Active saved prompts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTemplates}</div>
            <p className="text-xs text-muted-foreground">Available templates</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Tests</CardTitle>
            <Beaker className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentTests}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Prompts List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Prompts</CardTitle>
          <CardDescription>
            Manage your saved prompts and continue refining them
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<div>Loading prompts...</div>}>
            <PromptList prompts={prompts} />
          </Suspense>
        </CardContent>
      </Card>

      {/* Quick Start Guide */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-lg">Quick Start Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              1
            </div>
            <div>
              <p className="font-medium">Browse Templates</p>
              <p className="text-sm text-muted-foreground">
                Start with pre-built templates for common product types
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              2
            </div>
            <div>
              <p className="font-medium">Test & Refine</p>
              <p className="text-sm text-muted-foreground">
                Generate test images and iterate on your prompt to get the perfect result
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold">
              3
            </div>
            <div>
              <p className="font-medium">Save & Use</p>
              <p className="text-sm text-muted-foreground">
                Save your refined prompt and use it to generate product images
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
