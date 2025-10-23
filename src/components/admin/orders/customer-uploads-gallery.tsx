'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ImageIcon, FileText, Download, ZoomIn, Upload as UploadIcon } from 'lucide-react'
import Image from 'next/image'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface OrderFile {
  id: string
  filename: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string
  fileType: string
  label?: string
  approvalStatus: string
  uploadedByRole: string
  createdAt: string
}

interface Props {
  orderId: string
}

export function CustomerUploadsGallery({ orderId }: Props) {
  const [files, setFiles] = useState<OrderFile[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedFile, setSelectedFile] = useState<OrderFile | null>(null)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/files`)
      if (response.ok) {
        const data = await response.json()
        // Filter to show only files uploaded by customer
        const customerFiles = (data.files || []).filter(
          (f: OrderFile) => f.uploadedByRole === 'CUSTOMER'
        )
        setFiles(customerFiles)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }, [orderId])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return ''
    const mb = bytes / (1024 * 1024)
    if (mb < 1) {
      return `${(bytes / 1024).toFixed(0)} KB`
    }
    return `${mb.toFixed(2)} MB`
  }

  const handleViewFullSize = (file: OrderFile) => {
    setSelectedFile(file)
    setLightboxOpen(true)
  }

  const handleDownload = (file: OrderFile) => {
    window.open(file.fileUrl, '_blank')
  }

  const handleDownloadAll = () => {
    files.forEach((file) => {
      window.open(file.fileUrl, '_blank')
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Customer Uploaded Files
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse flex gap-4">
            <div className="h-40 w-40 bg-gray-300 rounded-lg" />
            <div className="h-40 w-40 bg-gray-300 rounded-lg" />
            <div className="h-40 w-40 bg-gray-300 rounded-lg" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (files.length === 0) {
    return null // Don't show section if no customer uploads
  }

  const isImage = (file: OrderFile) => file.mimeType?.startsWith('image/')
  const getThumbnail = (file: OrderFile) =>
    file.thumbnailUrl || (isImage(file) ? file.fileUrl : null)

  return (
    <>
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UploadIcon className="h-5 w-5 text-primary" />
              Customer Uploaded Files
              <Badge variant="secondary">{files.length}</Badge>
            </CardTitle>
            {files.length > 1 && (
              <Button size="sm" variant="outline" onClick={handleDownloadAll}>
                <Download className="h-4 w-4 mr-2" />
                Download All
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {files.map((file) => {
              const thumbnail = getThumbnail(file)
              return (
                <div
                  key={file.id}
                  className="group relative rounded-lg border-2 border-gray-200 hover:border-primary transition-all duration-200 overflow-hidden bg-white shadow-sm hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="aspect-square relative bg-gray-50">
                    {thumbnail ? (
                      <Image
                        fill
                        alt={file.label || file.filename}
                        className="object-cover"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        src={thumbnail}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <FileText className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      {thumbnail && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleViewFullSize(file)}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                      )}
                      <Button size="sm" variant="secondary" onClick={() => handleDownload(file)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {/* File info */}
                  <div className="p-2 space-y-1">
                    <p className="text-xs font-medium truncate" title={file.label || file.filename}>
                      {file.label || file.filename}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{formatFileSize(file.fileSize)}</span>
                      {isImage(file) && <ImageIcon className="h-3 w-3" />}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Upload date info */}
          <div className="mt-4 text-sm text-muted-foreground">
            <p>
              Files uploaded by customer on{' '}
              {new Date(files[0]?.createdAt).toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedFile?.label || selectedFile?.filename}</DialogTitle>
          </DialogHeader>
          {selectedFile && getThumbnail(selectedFile) && (
            <div className="relative w-full" style={{ minHeight: '500px' }}>
              <Image
                fill
                alt={selectedFile.label || selectedFile.filename}
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 80vw"
                src={getThumbnail(selectedFile)!}
              />
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setLightboxOpen(false)}>
              Close
            </Button>
            <Button onClick={() => selectedFile && handleDownload(selectedFile)}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
