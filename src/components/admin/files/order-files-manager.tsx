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
  Trash2,
  MessageSquare,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  FileArchive,
  Mail,
  Send,
} from 'lucide-react'
import { FileUploadDialog } from './file-upload-dialog'
import { SimpleFileUpload } from './simple-file-upload'
import { FileMessageDialog } from './file-message-dialog'
import toast from '@/lib/toast'
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
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import Image from 'next/image'

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

const fileTypeLabels = {
  CUSTOMER_ARTWORK: 'Customer Artwork',
  ADMIN_PROOF: 'Proof',
  PRODUCTION_FILE: 'Production File',
  REFERENCE: 'Reference',
  ATTACHMENT: 'Attachment',
}

const approvalStatusConfig = {
  WAITING: {
    label: 'Awaiting Approval',
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
    icon: Clock,
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
    icon: CheckCircle,
  },
  REJECTED: {
    label: 'Rejected',
    color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
    icon: XCircle,
  },
  NOT_REQUIRED: {
    label: 'No Approval Needed',
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
    icon: FileText,
  },
}

export function OrderFilesManager({ orderId }: Props) {
  // This component is admin-only, so always show admin features
  const isAdmin = true

  const [files, setFiles] = useState<OrderFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [messageDialogOpen, setMessageDialogOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState<OrderFile | null>(null)

  // Approval dialog state
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [approvalMessage, setApprovalMessage] = useState('')
  const [fileToApprove, setFileToApprove] = useState<OrderFile | null>(null)
  const [isApproving, setIsApproving] = useState(false)

  // Email proof dialog state
  const [emailDialogOpen, setEmailDialogOpen] = useState(false)
  const [emailMessage, setEmailMessage] = useState('')
  const [fileToEmail, setFileToEmail] = useState<OrderFile | null>(null)
  const [isSendingEmail, setIsSendingEmail] = useState(false)

  const fetchFiles = async () => {
    try {
      const response = await fetch(`/api/orders/${orderId}/files`)
      if (response.ok) {
        const data = await response.json()
        setFiles(data.files || [])
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

  const handleDelete = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const response = await fetch(`/api/orders/${orderId}/files/${fileId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setFiles(files.filter((f) => f.id !== fileId))
      } else {
        alert('Failed to delete file')
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  const handleApprovalClick = (file: OrderFile, action: 'APPROVED' | 'REJECTED') => {
    setFileToApprove(file)
    setApprovalAction(action)
    setApprovalMessage('')
    setApprovalDialogOpen(true)
  }

  const handleApprovalConfirm = async () => {
    if (!fileToApprove) return

    setIsApproving(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/files/${fileToApprove.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalAction,
          message: approvalMessage || undefined,
        }),
      })

      if (response.ok) {
        toast.success(
          approvalAction === 'APPROVED'
            ? 'File approved successfully'
            : 'File rejected successfully'
        )
        // Refresh files list
        await fetchFiles()
        setApprovalDialogOpen(false)
        setFileToApprove(null)
        setApprovalMessage('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to process approval')
      }
    } catch (error) {
      console.error('Error processing approval:', error)
      toast.error('Failed to process approval')
    } finally {
      setIsApproving(false)
    }
  }

  const handleEmailProof = (file: OrderFile) => {
    setFileToEmail(file)
    setEmailMessage('')
    setEmailDialogOpen(true)
  }

  const handleSendEmail = async () => {
    if (!fileToEmail) return

    setIsSendingEmail(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/files/${fileToEmail.id}/send-proof`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: emailMessage || undefined,
        }),
      })

      if (response.ok) {
        toast.success('Proof email sent successfully! Customer will be notified.')
        setEmailDialogOpen(false)
        setFileToEmail(null)
        setEmailMessage('')
      } else {
        const data = await response.json()
        toast.error(data.error || 'Failed to send proof email')
      }
    } catch (error) {
      console.error('Error sending proof email:', error)
      toast.error('Failed to send proof email')
    } finally {
      setIsSendingEmail(false)
    }
  }

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

  const customerArtwork = files.filter((f) => f.fileType === 'CUSTOMER_ARTWORK')
  const adminProofs = files.filter((f) => f.fileType === 'ADMIN_PROOF')
  const otherFiles = files.filter((f) => !['CUSTOMER_ARTWORK', 'ADMIN_PROOF'].includes(f.fileType))

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Order Files</CardTitle>
          <CardDescription>Loading files...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Order Files</CardTitle>
              <CardDescription>
                {files.length} file{files.length !== 1 ? 's' : ''} uploaded
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {files.length > 0 && (
                <Button asChild size="sm" variant="outline">
                  <a
                    download
                    href={`/api/admin/orders/${orderId}/download-files`}
                    title={`Download all ${files.length} files as ZIP`}
                  >
                    <FileArchive className="h-4 w-4 mr-2" />
                    Download All
                  </a>
                </Button>
              )}
              <SimpleFileUpload orderId={orderId} onSuccess={fetchFiles} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {files.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed rounded-lg">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-sm text-muted-foreground">
                No files uploaded yet. Use the "Upload File for Approval" button above to add files.
              </p>
            </div>
          ) : (
            <>
              {/* Customer Artwork Section */}
              {customerArtwork.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <ImageIcon className="h-4 w-4" />
                    Customer Artwork ({customerArtwork.length})
                  </h3>
                  <div className="space-y-3">
                    {customerArtwork.map((file) => (
                      <FileListItem
                        key={file.id}
                        file={file}
                        formatFileSize={formatFileSize}
                        getFileIcon={getFileIcon}
                        onApprove={
                          isAdmin && file.approvalStatus === 'WAITING'
                            ? (file) => handleApprovalClick(file, 'APPROVED')
                            : undefined
                        }
                        onDelete={handleDelete}
                        onReject={
                          isAdmin && file.approvalStatus === 'WAITING'
                            ? (file) => handleApprovalClick(file, 'REJECTED')
                            : undefined
                        }
                        onSendEmail={isAdmin ? handleEmailProof : undefined}
                        onViewMessages={(file) => {
                          setSelectedFile(file)
                          setMessageDialogOpen(true)
                        }}
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
                    Proofs for Approval ({adminProofs.length})
                  </h3>
                  <div className="space-y-3">
                    {adminProofs.map((file) => (
                      <FileListItem
                        key={file.id}
                        file={file}
                        formatFileSize={formatFileSize}
                        getFileIcon={getFileIcon}
                        onApprove={
                          isAdmin && file.approvalStatus === 'WAITING'
                            ? (file) => handleApprovalClick(file, 'APPROVED')
                            : undefined
                        }
                        onDelete={handleDelete}
                        onReject={
                          isAdmin && file.approvalStatus === 'WAITING'
                            ? (file) => handleApprovalClick(file, 'REJECTED')
                            : undefined
                        }
                        onViewMessages={(file) => {
                          setSelectedFile(file)
                          setMessageDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {otherFiles.length > 0 && (adminProofs.length > 0 || customerArtwork.length > 0) && (
                <Separator />
              )}

              {/* Other Files Section */}
              {otherFiles.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Other Files ({otherFiles.length})
                  </h3>
                  <div className="space-y-3">
                    {otherFiles.map((file) => (
                      <FileListItem
                        key={file.id}
                        file={file}
                        formatFileSize={formatFileSize}
                        getFileIcon={getFileIcon}
                        onApprove={
                          isAdmin && file.approvalStatus === 'WAITING'
                            ? (file) => handleApprovalClick(file, 'APPROVED')
                            : undefined
                        }
                        onDelete={handleDelete}
                        onReject={
                          isAdmin && file.approvalStatus === 'WAITING'
                            ? (file) => handleApprovalClick(file, 'REJECTED')
                            : undefined
                        }
                        onSendEmail={isAdmin ? handleEmailProof : undefined}
                        onViewMessages={(file) => {
                          setSelectedFile(file)
                          setMessageDialogOpen(true)
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <FileUploadDialog
        open={uploadDialogOpen}
        orderId={orderId}
        onOpenChange={setUploadDialogOpen}
        onSuccess={() => {
          fetchFiles()
          setUploadDialogOpen(false)
        }}
      />

      {selectedFile && (
        <FileMessageDialog
          file={selectedFile}
          open={messageDialogOpen}
          orderId={orderId}
          onMessageSent={fetchFiles}
          onOpenChange={setMessageDialogOpen}
        />
      )}

      {/* Approval Dialog */}
      <AlertDialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {approvalAction === 'APPROVED' ? 'Approve File' : 'Reject File'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {approvalAction === 'APPROVED'
                ? 'This will approve the file and allow production to proceed.'
                : 'This will reject the file and request changes from the customer.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {fileToApprove && (
              <div className="text-sm">
                <p className="font-medium">{fileToApprove.label || fileToApprove.filename}</p>
                <p className="text-muted-foreground">{fileTypeLabels[fileToApprove.fileType]}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="approval-message">
                {approvalAction === 'APPROVED' ? 'Approval Note (Optional)' : 'Rejection Reason'}
              </Label>
              <Textarea
                id="approval-message"
                placeholder={
                  approvalAction === 'APPROVED'
                    ? 'Add a note for the team...'
                    : 'Explain what needs to be changed...'
                }
                rows={3}
                value={approvalMessage}
                onChange={(e) => setApprovalMessage(e.target.value)}
              />
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isApproving}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className={
                approvalAction === 'REJECTED'
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : ''
              }
              disabled={isApproving}
              onClick={(e) => {
                e.preventDefault()
                handleApprovalConfirm()
              }}
            >
              {isApproving
                ? 'Processing...'
                : approvalAction === 'APPROVED'
                  ? 'Approve File'
                  : 'Reject File'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Email Proof Dialog */}
      <AlertDialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Send Proof Email</AlertDialogTitle>
            <AlertDialogDescription>
              Send this proof to the customer for approval with an optional message.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-4 py-4">
            {fileToEmail && (
              <div className="text-sm">
                <p className="font-medium">{fileToEmail.label || fileToEmail.filename}</p>
                <p className="text-muted-foreground">{fileTypeLabels[fileToEmail.fileType]}</p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email-message">Message to Customer (Optional)</Label>
              <Textarea
                id="email-message"
                placeholder="Add a message about this proof..."
                rows={4}
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                This message will be included in the email along with the proof attachment.
              </p>
            </div>
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSendingEmail}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-blue-600 text-white hover:bg-blue-700"
              disabled={isSendingEmail}
              onClick={(e) => {
                e.preventDefault()
                handleSendEmail()
              }}
            >
              {isSendingEmail ? (
                <>
                  <Send className="h-4 w-4 mr-2 animate-pulse" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Proof Email
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function FileListItem({
  file,
  onDelete,
  onViewMessages,
  onApprove,
  onReject,
  onSendEmail,
  formatFileSize,
  getFileIcon,
}: {
  file: OrderFile
  onDelete: (id: string) => void
  onViewMessages: (file: OrderFile) => void
  onApprove?: (file: OrderFile) => void
  onReject?: (file: OrderFile) => void
  onSendEmail?: (file: OrderFile) => void
  formatFileSize: (bytes?: number) => string
  getFileIcon: (mimeType?: string) => any
}) {
  const FileIcon = getFileIcon(file.mimeType)
  const statusConfig = approvalStatusConfig[file.approvalStatus]
  const StatusIcon = statusConfig.icon

  const isImage = file.mimeType?.startsWith('image/')
  const thumbnailUrl = file.thumbnailUrl || (isImage ? file.fileUrl : null)

  return (
    <div className="flex items-start gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors">
      <div
        className="rounded-md bg-muted overflow-hidden flex-shrink-0"
        style={{ width: '80px', height: '80px' }}
      >
        {thumbnailUrl ? (
          <div className="relative w-full h-full">
            <Image
              fill
              alt={file.label || file.filename}
              className="object-cover"
              sizes="80px"
              src={thumbnailUrl}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center p-2">
            <FileIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{file.label || file.filename}</p>
            <p className="text-xs text-muted-foreground">
              {formatFileSize(file.fileSize)} • {new Date(file.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Badge className={`${statusConfig.color} gap-1 px-2 py-0.5 text-xs flex-shrink-0`}>
            <StatusIcon className="h-3 w-3" />
            {statusConfig.label}
          </Badge>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <Badge className="text-xs" variant="outline">
            {fileTypeLabels[file.fileType]}
          </Badge>
          <Badge className="text-xs" variant="outline">
            {file.uploadedByRole}
          </Badge>
          {file.FileMessage.length > 0 && (
            <Badge className="text-xs gap-1" variant="outline">
              <MessageSquare className="h-3 w-3" />
              {file.FileMessage.length}
            </Badge>
          )}
        </div>
      </div>
      <div className="flex gap-1 flex-shrink-0">
        {/* Approval buttons (admin only, WAITING status only) */}
        {onApprove && (
          <Button
            className="text-green-600 hover:text-green-700 hover:bg-green-50"
            size="icon"
            title="Approve file"
            variant="ghost"
            onClick={() => onApprove(file)}
          >
            <ThumbsUp className="h-4 w-4" />
          </Button>
        )}
        {onReject && (
          <Button
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            size="icon"
            title="Reject file"
            variant="ghost"
            onClick={() => onReject(file)}
          >
            <ThumbsDown className="h-4 w-4" />
          </Button>
        )}
        {onSendEmail && (
          <Button
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            size="icon"
            title="Send proof email to customer"
            variant="ghost"
            onClick={() => onSendEmail(file)}
          >
            <Mail className="h-4 w-4" />
          </Button>
        )}
        <Button size="icon" variant="ghost" onClick={() => window.open(file.fileUrl, '_blank')}>
          <Download className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onViewMessages(file)}>
          <MessageSquare className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => onDelete(file.id)}>
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
      </div>
    </div>
  )
}
