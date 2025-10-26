'use client'

import { useState } from 'react'
import { Link } from '@/lib/i18n/navigation'
import { useRouter } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { MoreHorizontal, Edit, Trash2, History, Eye } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import type { PromptTemplate, PromptTestImage } from '@prisma/client'

type PromptWithTests = PromptTemplate & {
  testImages: PromptTestImage[]
  _count: {
    testImages: number
  }
}

interface PromptListProps {
  prompts: PromptWithTests[]
}

export function PromptList({ prompts }: PromptListProps) {
  const router = useRouter()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [promptToDelete, setPromptToDelete] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!promptToDelete) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/prompts/${promptToDelete}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete prompt')

      router.refresh()
      setDeleteDialogOpen(false)
      setPromptToDelete(null)
    } catch (error) {
      console.error('Error deleting prompt:', error)
      alert('Failed to delete prompt. Please try again.')
    } finally {
      setIsDeleting(false)
    }
  }

  if (prompts.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">No prompts yet</p>
        <Link href="/admin/marketing/prompts/templates">
          <Button>Browse Templates to Get Started</Button>
        </Link>
      </div>
    )
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Product Type</TableHead>
            <TableHead>Tests</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {prompts.map((prompt) => (
            <TableRow key={prompt.id}>
              <TableCell className="font-medium">{prompt.name}</TableCell>
              <TableCell>
                <Badge variant="outline">{prompt.category}</Badge>
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{prompt.productType}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    {prompt._count.testImages} images
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDistanceToNow(new Date(prompt.updatedAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/marketing/prompts/${prompt.id}/edit`}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit & Test
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/admin/marketing/prompts/${prompt.id}/history`}>
                        <History className="h-4 w-4 mr-2" />
                        View History
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => {
                        setPromptToDelete(prompt.id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this prompt and all its test images. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
