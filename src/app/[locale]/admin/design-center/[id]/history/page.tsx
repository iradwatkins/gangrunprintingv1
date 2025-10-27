import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Link } from '@/lib/i18n/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, History as HistoryIcon } from 'lucide-react'
import { prisma } from '@/lib/prisma'
import { formatDistanceToNow } from 'date-fns'

async function getPromptHistory(id: string) {
  const prompt = await prisma.promptTemplate.findUnique({
    where: { id },
    include: {
      testImages: {
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (!prompt) {
    notFound()
  }

  // Group images by iteration
  const imagesByIteration = prompt.testImages.reduce(
    (acc, image) => {
      if (!acc[image.iteration]) {
        acc[image.iteration] = []
      }
      acc[image.iteration].push(image)
      return acc
    },
    {} as Record<number, typeof prompt.testImages>
  )

  return { prompt, imagesByIteration }
}

interface PageProps {
  params: {
    id: string
  }
}

export default async function PromptHistoryPage({ params }: PageProps) {
  const { prompt, imagesByIteration } = await getPromptHistory(params.id)

  const iterations = Object.keys(imagesByIteration)
    .map(Number)
    .sort((a, b) => b - a) // Sort descending (newest first)

  return (
    <div className="flex-1 space-y-6 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link href={`/admin/design-center/${params.id}/edit`}>
            <Button variant="ghost" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Editor
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <HistoryIcon className="h-8 w-8 text-primary" />
            {prompt.name} - History
          </h1>
          <p className="text-muted-foreground mt-1">
            {prompt.testImages.length} total images across {iterations.length} iterations
          </p>
        </div>
      </div>

      {/* Iterations */}
      <div className="space-y-8">
        {iterations.map((iteration) => {
          const images = imagesByIteration[iteration]
          const excellentCount = images.filter((img) => img.quality === 'excellent').length
          const goodCount = images.filter((img) => img.quality === 'good').length
          const poorCount = images.filter((img) => img.quality === 'poor').length

          return (
            <Card key={iteration}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    Iteration {iteration}
                    <Badge variant="outline">{images.length} images</Badge>
                  </CardTitle>
                  <div className="flex gap-2">
                    {excellentCount > 0 && (
                      <Badge variant="default">{excellentCount} excellent</Badge>
                    )}
                    {goodCount > 0 && <Badge variant="secondary">{goodCount} good</Badge>}
                    {poorCount > 0 && <Badge variant="outline">{poorCount} poor</Badge>}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Generated{' '}
                  {formatDistanceToNow(new Date(images[0].createdAt), { addSuffix: true })}
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((image, index) => (
                    <div key={image.id} className="space-y-2">
                      <div className="relative aspect-[4/3] bg-muted rounded-lg overflow-hidden">
                        <img
                          src={image.imageUrl}
                          alt={`Iteration ${iteration} - Image ${index + 1}`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">#{index + 1}</span>
                        <Badge
                          variant={
                            image.quality === 'excellent'
                              ? 'default'
                              : image.quality === 'good'
                                ? 'secondary'
                                : 'outline'
                          }
                        >
                          {image.quality}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {iterations.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No iterations yet</p>
              <Link href={`/admin/design-center/${params.id}/edit`}>
                <Button className="mt-4">Generate First Iteration</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
