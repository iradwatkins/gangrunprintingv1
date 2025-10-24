'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  MessageSquare,
  FileText,
  Loader2,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react'
import { EnhancedFilePreview } from '@/components/ui/enhanced-file-preview'
import { cn } from '@/lib/utils'

interface ProofFile {
  id: string
  filename: string
  fileUrl: string
  thumbnailUrl?: string
  label?: string
  approvalStatus: 'WAITING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED'
  createdAt: string
  mimeType?: string
  fileSize?: number
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
  proof: ProofFile
  onApprovalChange: () => void
}

const statusConfig = {
  WAITING: {
    label: 'Needs Your Review',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    icon: Clock,
    priority: 'high',
  },
  APPROVED: {
    label: 'Approved',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    icon: CheckCircle,
    priority: 'low',
  },
  REJECTED: {
    label: 'Changes Requested',
    color: 'bg-red-100 text-red-800 border-red-300',
    icon: XCircle,
    priority: 'medium',
  },
  NOT_REQUIRED: {
    label: 'No Review Needed',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: FileText,
    priority: 'low',
  },
}

export function MobileProofApprovalCard({ orderId, proof, onApprovalChange }: Props) {
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false)
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED')
  const [message, setMessage] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const statusInfo = statusConfig[proof.approvalStatus]
  const StatusIcon = statusInfo.icon
  const isWaiting = proof.approvalStatus === 'WAITING'
  const unreadMessages = proof.FileMessage.length

  const handleApproval = async () => {
    if (!message.trim() && approvalAction === 'REJECTED') {
      alert('Please provide a reason for rejection')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch(`/api/orders/${orderId}/files/${proof.id}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: approvalAction,
          message: message || (approvalAction === 'APPROVED' ? 'Approved!' : ''),
        }),
      })

      if (response.ok) {
        setApprovalDialogOpen(false)
        setDetailsOpen(false)
        setMessage('')
        onApprovalChange()
      } else {
        const error = await response.json()
        alert(`Failed to submit approval: ${error.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error submitting approval:', error)
      alert('Failed to submit approval')
    } finally {
      setSubmitting(false)
    }
  }

  const openApprovalDialog = (action: 'APPROVED' | 'REJECTED') => {
    setApprovalAction(action)
    setMessage('')
    setApprovalDialogOpen(true)
  }

  return (
    <>
      {/* Mobile-optimized card */}
      <Card
        className={cn(
          'relative overflow-hidden transition-all duration-200',
          isWaiting && 'border-amber-300 border-2 shadow-md',
          statusInfo.priority === 'high' && 'bg-gradient-to-r from-amber-50 to-white'
        )}
      >
        {/* Priority indicator for waiting proofs */}
        {isWaiting && (
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-400" />
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base leading-tight truncate">
                {proof.label || proof.filename}
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {new Date(proof.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </CardDescription>
            </div>

            <div className="flex flex-col items-end gap-2">
              <Badge className={cn(statusInfo.color, 'text-xs font-medium')} variant="outline">
                <StatusIcon className="h-3 w-3 mr-1" />
                {statusInfo.label}
              </Badge>

              {unreadMessages > 0 && (
                <Badge className="text-xs" variant="secondary">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  {unreadMessages}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Enhanced file preview */}
          <EnhancedFilePreview
            className="border-0 shadow-none bg-transparent"
            filename={proof.filename}
            fileSize={proof.fileSize}
            fileUrl={proof.fileUrl}
            label={proof.label}
            mimeType={proof.mimeType}
            showFileInfo={false}
            thumbnailUrl={proof.thumbnailUrl}
          />

          {/* Quick actions for waiting proofs */}
          {isWaiting && (
            <div className="grid grid-cols-2 gap-2">
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={submitting}
                size="sm"
                onClick={() => openApprovalDialog('APPROVED')}
              >
                <ThumbsUp className="h-4 w-4 mr-1" />
                Approve
              </Button>
              <Button
                className="border-red-300 text-red-700 hover:bg-red-50"
                disabled={submitting}
                size="sm"
                variant="outline"
                onClick={() => openApprovalDialog('REJECTED')}
              >
                <ThumbsDown className="h-4 w-4 mr-1" />
                Changes
              </Button>
            </div>
          )}

          {/* Details trigger */}
          <Sheet open={detailsOpen} onOpenChange={setDetailsOpen}>
            <SheetTrigger asChild>
              <Button className="w-full justify-between" size="sm" variant="outline">
                <span className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  View Details
                </span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </SheetTrigger>

            <SheetContent className="h-[85vh] overflow-y-auto" side="bottom">
              <SheetHeader className="text-left mb-4">
                <SheetTitle>{proof.label || proof.filename}</SheetTitle>
                <SheetDescription>
                  Uploaded on {new Date(proof.createdAt).toLocaleDateString()}
                </SheetDescription>
              </SheetHeader>

              <div className="space-y-6">
                {/* Large preview */}
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  {proof.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <img
                      alt={proof.label || proof.filename}
                      className="w-full h-full object-contain"
                      loading="lazy"
                      src={proof.fileUrl}
                    />
                  ) : proof.fileUrl.match(/\.pdf$/i) ? (
                    <iframe
                      className="w-full h-full border-0"
                      src={proof.fileUrl}
                      title={proof.label || proof.filename}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                      <FileText className="h-16 w-16 mb-2" />
                      <p className="text-sm text-center">{proof.filename}</p>
                    </div>
                  )}
                </div>

                {/* File actions */}
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => window.open(proof.fileUrl, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Full Size
                  </Button>
                  <Button
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      const a = document.createElement('a')
                      a.href = proof.fileUrl
                      a.download = proof.filename
                      a.click()
                    }}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>

                {/* Approval actions (mobile optimized) */}
                {isWaiting && (
                  <div className="space-y-3">
                    <div className="text-center p-4 bg-amber-50 rounded-lg border border-amber-200">
                      <p className="text-sm font-medium text-amber-800 mb-2">
                        🔍 Please review this proof carefully
                      </p>
                      <p className="text-xs text-amber-700">
                        Check spelling, colors, layout, and contact information before approving
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3">
                      <Button
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3"
                        disabled={submitting}
                        onClick={() => openApprovalDialog('APPROVED')}
                      >
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Approve for Production
                      </Button>
                      <Button
                        className="w-full border-red-300 text-red-700 hover:bg-red-50 py-3"
                        disabled={submitting}
                        variant="outline"
                        onClick={() => openApprovalDialog('REJECTED')}
                      >
                        <XCircle className="h-5 w-5 mr-2" />
                        Request Changes
                      </Button>
                    </div>
                  </div>
                )}

                {/* Message history */}
                {proof.FileMessage.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Comments ({proof.FileMessage.length})
                    </h4>
                    <div className="space-y-3">
                      {proof.FileMessage.map((msg) => (
                        <div key={msg.id} className="bg-muted rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="text-xs" variant="outline">
                              {msg.authorRole === 'admin' ? '👨‍💼 Team' : '👤 You'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <p className="text-sm">{msg.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </CardContent>
      </Card>

      {/* Approval Dialog - Same as desktop but mobile optimized */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent className="mx-4 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">
              {approvalAction === 'APPROVED' ? '✅ Approve Proof' : '📝 Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'APPROVED'
                ? 'Confirm this proof is ready for production.'
                : 'Tell us what changes you need.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium" htmlFor="message">
                {approvalAction === 'APPROVED'
                  ? 'Add a comment (optional)'
                  : 'What changes do you need? *'}
              </Label>
              <Textarea
                className="resize-none text-sm"
                id="message"
                placeholder={
                  approvalAction === 'APPROVED'
                    ? 'Looks great! Ready for production.'
                    : 'Please describe the specific changes needed...'
                }
                required={approvalAction === 'REJECTED'}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              {approvalAction === 'REJECTED' && (
                <p className="text-xs text-muted-foreground">
                  Be specific about colors, text, layout, or other changes needed.
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Button
              className={cn(
                'w-full py-3',
                approvalAction === 'APPROVED'
                  ? 'bg-emerald-600 hover:bg-emerald-700'
                  : 'bg-red-600 hover:bg-red-700'
              )}
              disabled={submitting || (approvalAction === 'REJECTED' && !message.trim())}
              onClick={handleApproval}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : approvalAction === 'APPROVED' ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirm Approval
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 mr-2" />
                  Submit Change Request
                </>
              )}
            </Button>

            <Button
              disabled={submitting}
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
