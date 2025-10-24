'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  CheckCircle,
  XCircle,
  Download,
  MessageSquare,
  Clock,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Image as ImageIcon,
  Send,
  AlertCircle,
} from 'lucide-react'
import Image from 'next/image'
import toast from '@/lib/toast'
import { useRouter } from 'next/navigation'

interface OrderData {
  id: string
  orderNumber: string
  email: string
  customerName?: string
}

interface FileData {
  id: string
  filename: string
  label?: string
  fileUrl: string
  thumbnailUrl?: string
  mimeType?: string
  fileSize?: number
  approvalStatus: 'WAITING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED'
  createdAt: string
  messages: Array<{
    id: string
    message: string
    authorName: string
    authorRole: string
    createdAt: string
  }>
}

interface Props {
  order: OrderData
  file: FileData
  defaultAction?: 'approve' | 'reject'
}

export function ProofApprovalInterface({ order, file, defaultAction }: Props) {
  const router = useRouter()
  const [selectedAction, setSelectedAction] = useState<'approve' | 'reject' | null>(
    defaultAction || null
  )
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isImage = file.mimeType?.startsWith('image/')
  const fileIcon = isImage ? ImageIcon : FileText
  const FileIcon = fileIcon

  const handleSubmit = async () => {
    if (!selectedAction) {
      toast.error('Please select approve or reject')
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/proof-approval/${order.id}/${file.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: selectedAction,
          message: message.trim() || undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast.success(
          selectedAction === 'approve'
            ? 'Proof approved successfully!'
            : 'Changes requested successfully!'
        )

        // Redirect to completion page
        router.push(`/proof-approval/${order.id}/${file.id}/complete?status=${selectedAction}d`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to submit approval')
      }
    } catch (error) {
      console.error('Error submitting approval:', error)
      toast.error('Failed to submit approval. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size'
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  return (
    <div className="space-y-6">
      {/* File Preview Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileIcon className="h-5 w-5" />
            Proof File
          </CardTitle>
          <CardDescription>
            Please review this proof carefully before making your decision
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-6">
            {/* File Preview */}
            <div className="flex-shrink-0">
              <div className="w-48 h-48 rounded-lg bg-muted overflow-hidden border">
                {file.thumbnailUrl || isImage ? (
                  <div className="relative w-full h-full">
                    <Image
                      fill
                      alt={file.label || file.filename}
                      className="object-cover"
                      src={file.thumbnailUrl || file.fileUrl}
                    />
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FileIcon className="h-16 w-16 text-muted-foreground" />
                  </div>
                )}
              </div>
            </div>

            {/* File Details */}
            <div className="flex-1 space-y-4">
              <div>
                <h3 className="font-semibold text-lg">{file.label || file.filename}</h3>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.fileSize)} • Uploaded{' '}
                  {new Date(file.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Badge variant="outline">Proof File</Badge>
                <Badge className="bg-yellow-100 text-yellow-800">
                  <Clock className="h-3 w-3 mr-1" />
                  Awaiting Approval
                </Badge>
              </div>

              <Button
                className="w-full md:w-auto"
                variant="outline"
                onClick={() => window.open(file.fileUrl, '_blank')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Full File
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Messages */}
      {file.messages.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Messages ({file.messages.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {file.messages.map((msg) => (
                <div key={msg.id} className="flex gap-3 p-3 rounded-lg bg-muted/50">
                  <div className="flex-shrink-0">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        msg.authorRole === 'admin'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {msg.authorName.charAt(0).toUpperCase()}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{msg.authorName}</span>
                      <Badge className="text-xs" variant="outline">
                        {msg.authorRole === 'admin' ? 'Team' : 'Customer'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm">{msg.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Approval Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Your Decision</CardTitle>
          <CardDescription>Choose whether to approve this proof or request changes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Action Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              className={`h-20 flex-col gap-2 ${
                selectedAction === 'approve'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'border-green-200 hover:bg-green-50'
              }`}
              size="lg"
              variant={selectedAction === 'approve' ? 'default' : 'outline'}
              onClick={() => setSelectedAction('approve')}
            >
              <ThumbsUp className="h-6 w-6" />
              <span className="font-semibold">Approve Proof</span>
              <span className="text-xs opacity-75">Ready for production</span>
            </Button>

            <Button
              className={`h-20 flex-col gap-2 ${
                selectedAction === 'reject'
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'border-orange-200 hover:bg-orange-50'
              }`}
              size="lg"
              variant={selectedAction === 'reject' ? 'default' : 'outline'}
              onClick={() => setSelectedAction('reject')}
            >
              <ThumbsDown className="h-6 w-6" />
              <span className="font-semibold">Request Changes</span>
              <span className="text-xs opacity-75">Needs modifications</span>
            </Button>
          </div>

          {/* Message Input */}
          <div className="space-y-3">
            <Label htmlFor="customer-message">
              {selectedAction === 'approve'
                ? 'Additional Comments (Optional)'
                : 'What changes would you like? (Optional)'}
            </Label>
            <Textarea
              id="customer-message"
              placeholder={
                selectedAction === 'approve'
                  ? 'Any additional comments about the proof...'
                  : 'Please describe what changes you would like to see...'
              }
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <Separator />

          {/* Important Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-800 mb-1">Important Notice</p>
                <p className="text-amber-700">
                  Please review your proof carefully. We cannot be held responsible for errors that
                  are approved. If you approve this proof, production will begin immediately.
                </p>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            className="w-full"
            disabled={!selectedAction || isSubmitting}
            size="lg"
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <>
                <Send className="h-4 w-4 mr-2 animate-pulse" />
                Submitting...
              </>
            ) : (
              <>
                {selectedAction === 'approve' ? (
                  <CheckCircle className="h-4 w-4 mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                {selectedAction === 'approve' ? 'Approve & Begin Production' : 'Request Changes'}
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
