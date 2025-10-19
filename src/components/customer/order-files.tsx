'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Eye,
} from 'lucide-react'
import toast from '@/lib/toast'

interface OrderFile {
  id: string
  filename: string
  fileUrl: string
  fileSize?: number
  mimeType?: string
  thumbnailUrl?: string
  fileType: 'CUSTOMER_ARTWORK' | 'ADMIN_PROOF' | 'PRODUCTION_FILE' | 'REFERENCE' | 'ATTACHMENT'
  label?: string
  approvalStatus: 'WAITING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED'
  uploadedByRole: 'CUSTOMER' | 'ADMIN' | 'VENDOR' | 'SYSTEM'
  createdAt: string
  FileMessage: Array<{
    id: string
    message: string
    authorRole: string
    authorName: string
    createdAt: string
  }>
}

interface Props {
  orderId: string
}

const approvalStatusConfig = {
  WAITING: {
    label: 'Awaiting Approval',
    description: 'Your file is being reviewed by our team',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    description: 'Ready for production',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Changes Requested',
    description: 'Please review feedback and upload a new file',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
  NOT_REQUIRED: {
    label: 'No Approval Needed',
    description: 'This file does not require approval',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: FileText,
  },
}

export function CustomerOrderFiles({ orderId }: Props) {
  const [files, setFiles] = useState<OrderFile[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/files`)
      if (response.ok) {
        const data = await response.json()
        // Only show customer-relevant files
        const customerFiles = (data.files || []).filter(
          (f: OrderFile) =>
            f.fileType === 'CUSTOMER_ARTWORK' ||
            f.fileType === 'ADMIN_PROOF' ||
            f.uploadedByRole === 'CUSTOMER'
        )
        setFiles(customerFiles)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [orderId])

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getFileIcon = (mimeType?: string) => {
    if (!mimeType) return FileText
    if (mimeType.startsWith('image/')) return ImageIcon
    return FileText
  }

  // Group files by type
  const customerArtwork = files.filter((f) => f.fileType === 'CUSTOMER_ARTWORK')
  const adminProofs = files.filter((f) => f.fileType === 'ADMIN_PROOF')

  // Check if any files are waiting for approval
  const hasWaitingFiles = files.some((f) => f.approvalStatus === 'WAITING')
  const hasRejectedFiles = files.some((f) => f.approvalStatus === 'REJECTED')
  const allApproved = files.length > 0 && files.every((f) => f.approvalStatus === 'APPROVED' || f.approvalStatus === 'NOT_REQUIRED')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Files & Artwork</CardTitle>
          <CardDescription>Loading files...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Upload className="h-5 w-5" />
          Files & Artwork
        </CardTitle>
        <CardDescription>
          {files.length === 0
            ? 'No files uploaded yet'
            : `${files.length} file${files.length !== 1 ? 's' : ''} uploaded`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Alert */}
        {allApproved && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-green-900">All Files Approved!</p>
                <p className="text-sm text-green-700 mt-1">
                  Your order is ready for production and will be processed shortly.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasWaitingFiles && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex gap-3">
              <Clock className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-yellow-900">Awaiting Approval</p>
                <p className="text-sm text-yellow-700 mt-1">
                  Our team is reviewing your files. We'll notify you once they're approved.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasRejectedFiles && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-red-900">Changes Requested</p>
                <p className="text-sm text-red-700 mt-1">
                  Please review the feedback below and upload updated files.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Customer Artwork Section */}
        {customerArtwork.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              Your Artwork ({customerArtwork.length})
            </h3>
            <div className="space-y-3">
              {customerArtwork.map((file) => (
                <CustomerFileItem
                  key={file.id}
                  file={file}
                  formatFileSize={formatFileSize}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          </div>
        )}

        {customerArtwork.length > 0 && adminProofs.length > 0 && <Separator />}

        {/* Admin Proofs Section */}
        {adminProofs.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Proofs for Your Approval ({adminProofs.length})
            </h3>
            <div className="space-y-3">
              {adminProofs.map((file) => (
                <CustomerFileItem
                  key={file.id}
                  file={file}
                  formatFileSize={formatFileSize}
                  getFileIcon={getFileIcon}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {files.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-sm text-muted-foreground mb-4">No files uploaded yet</p>
            <p className="text-xs text-muted-foreground">
              Files will appear here once uploaded
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function CustomerFileItem({
  file,
  formatFileSize,
  getFileIcon,
}: {
  file: OrderFile
  formatFileSize: (bytes?: number) => string
  getFileIcon: (mimeType?: string) => any
}) {
  const FileIcon = getFileIcon(file.mimeType)
  const statusConfig = approvalStatusConfig[file.approvalStatus]
  const StatusIcon = statusConfig.icon

  return (
    <div className="rounded-lg border p-4 space-y-3">
      <div className="flex items-start gap-3">
        <div className="rounded-md bg-muted p-2">
          <FileIcon className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{file.label || file.filename}</p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(file.fileSize)} • Uploaded{' '}
                {new Date(file.createdAt).toLocaleDateString()}
              </p>
            </div>
            <Button
              className="flex-shrink-0"
              size="sm"
              variant="ghost"
              onClick={() => window.open(file.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* Status Badge with Description */}
      <div className="flex items-start gap-2 rounded-md bg-muted/50 p-3">
        <StatusIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium">{statusConfig.label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{statusConfig.description}</p>
        </div>
        <Badge className={`${statusConfig.color} flex-shrink-0`}>{statusConfig.label}</Badge>
      </div>

      {/* Feedback Messages */}
      {file.FileMessage.length > 0 && (
        <div className="space-y-2 pt-2 border-t">
          <p className="text-sm font-medium">Feedback:</p>
          {file.FileMessage.map((msg) => (
            <div key={msg.id} className="text-sm bg-muted/50 rounded-md p-3">
              <p className="text-muted-foreground mb-1">
                <span className="font-medium text-foreground">{msg.authorName}</span> •{' '}
                {new Date(msg.createdAt).toLocaleDateString()}
              </p>
              <p>{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
