'use client'

import { File, Image as ImageIcon, FileText } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface FileData {
  id: string
  name: string
  preview?: string
  url?: string
  type?: string
}

interface FileThumbnailsProps {
  files: FileData[]
  className?: string
  size?: 'sm' | 'md' | 'lg'
  maxDisplay?: number
}

export function FileThumbnails({
  files,
  className,
  size = 'sm',
  maxDisplay = 3
}: FileThumbnailsProps) {
  if (!files || files.length === 0) {
    return null
  }

  const displayFiles = files.slice(0, maxDisplay)
  const remainingCount = files.length - maxDisplay

  const sizeClasses = {
    sm: 'w-10 h-10',
    md: 'w-16 h-16',
    lg: 'w-20 h-20'
  }

  const iconSizes = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {displayFiles.map((file) => (
        <div
          key={file.id}
          className={cn(
            'relative rounded-md overflow-hidden bg-muted border flex items-center justify-center',
            sizeClasses[size]
          )}
          title={file.name}
        >
          {file.preview || file.url ? (
            <Image
              fill
              alt={file.name}
              className="object-cover"
              src={file.preview || file.url || ''}
            />
          ) : (
            <div className="flex flex-col items-center justify-center p-1">
              {file.type?.includes('pdf') ? (
                <FileText className={cn('text-red-500', iconSizes[size])} />
              ) : (
                <File className={cn('text-muted-foreground', iconSizes[size])} />
              )}
            </div>
          )}
        </div>
      ))}

      {remainingCount > 0 && (
        <div
          className={cn(
            'rounded-md bg-muted border flex items-center justify-center text-xs font-semibold text-muted-foreground',
            sizeClasses[size]
          )}
        >
          +{remainingCount}
        </div>
      )}

      {size !== 'sm' && (
        <div className="text-xs text-muted-foreground">
          {files.length} file{files.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
