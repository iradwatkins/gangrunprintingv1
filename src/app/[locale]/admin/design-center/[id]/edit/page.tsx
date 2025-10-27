import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Sparkles } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { PromptWorkspace } from './prompt-workspace'

async function getPrompt(id: string) {
  const prompt = await prisma.promptTemplate.findUnique({
    where: { id },
    include: {
      testImages: {
        orderBy: { createdAt: 'desc' },
        take: 4, // Get most recent 4 images
      },
    },
  })

  if (!prompt) {
    notFound()
  }

  return prompt
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function EditPromptPage({ params }: PageProps) {
  const prompt = await getPrompt(params.id)

  return (
    <div className="flex-1 flex flex-col h-screen">
      {/* Header */}
      <div className="border-b bg-background p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/design-center">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-primary" />
                {prompt.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                Iteration {prompt.currentIteration} • {prompt.category} • {prompt.productType}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="flex-1 overflow-hidden">
        <Suspense fallback={<div className="p-8">Loading workspace...</div>}>
          <PromptWorkspace prompt={prompt} />
        </Suspense>
      </div>
    </div>
  )
}
