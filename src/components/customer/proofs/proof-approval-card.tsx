'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  CheckCircle,
  XCircle,
  Clock,
  Download,
  Eye,
  MessageSquare,
  FileText,
  Loader2,
} from 'lucide-react';

interface ProofFile {
  id: string;
  filename: string;
  fileUrl: string;
  label?: string;
  approvalStatus: 'WAITING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  createdAt: string;
  FileMessage: Array<{
    id: string;
    message: string;
    authorRole: string;
    authorName: string;
    createdAt: string;
  }>;
}

interface Props {
  orderId: string;
  proof: ProofFile;
  onApprovalChange: () => void;
}

const statusConfig = {
  WAITING: { label: 'Awaiting Your Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: 'Rejected - Revisions Requested', color: 'bg-red-100 text-red-800', icon: XCircle },
  NOT_REQUIRED: { label: 'No Approval Needed', color: 'bg-gray-100 text-gray-800', icon: FileText },
};

export function ProofApprovalCard({ orderId, proof, onApprovalChange }: Props) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [approvalDialogOpen, setApprovalDialogOpen] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'APPROVED' | 'REJECTED'>('APPROVED');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const statusInfo = statusConfig[proof.approvalStatus];
  const StatusIcon = statusInfo.icon;
  const isWaiting = proof.approvalStatus === 'WAITING';

  const handleApproval = async () => {
    if (!message.trim() && approvalAction === 'REJECTED') {
      alert('Please provide a reason for rejection');
      return;
    }

    setSubmitting(true);
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
      });

      if (response.ok) {
        setApprovalDialogOpen(false);
        setMessage('');
        onApprovalChange();
      } else {
        const error = await response.json();
        alert(`Failed to submit approval: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error submitting approval:', error);
      alert('Failed to submit approval');
    } finally {
      setSubmitting(false);
    }
  };

  const openApprovalDialog = (action: 'APPROVED' | 'REJECTED') => {
    setApprovalAction(action);
    setMessage('');
    setApprovalDialogOpen(true);
  };

  return (
    <>
      <Card className={isWaiting ? 'border-yellow-300 border-2' : ''}>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">{proof.label || proof.filename}</CardTitle>
              <CardDescription className="mt-1">
                Uploaded on {new Date(proof.createdAt).toLocaleDateString()}
              </CardDescription>
            </div>
            <Badge className={`${statusInfo.color} gap-1 flex-shrink-0`}>
              <StatusIcon className="h-3 w-3" />
              {statusInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* File Preview Thumbnail */}
          <div className="relative aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
            {proof.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                alt={proof.label || proof.filename}
                className="object-contain w-full h-full cursor-pointer hover:opacity-90 transition-opacity"
                loading="lazy"
                src={proof.fileUrl}
                onClick={() => setPreviewOpen(true)}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <FileText className="h-16 w-16" />
                <p className="text-sm">{proof.filename}</p>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => setPreviewOpen(true)}
            >
              <Eye className="h-4 w-4 mr-2" />
              View Large
            </Button>
            <Button
              className="flex-1"
              size="sm"
              variant="outline"
              onClick={() => window.open(proof.fileUrl, '_blank')}
            >
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>

          {/* Approval Actions (only for WAITING status) */}
          {isWaiting && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Review this proof and provide your feedback:</p>
              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  disabled={submitting}
                  onClick={() => openApprovalDialog('APPROVED')}
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Approve
                </Button>
                <Button
                  className="flex-1"
                  disabled={submitting}
                  variant="destructive"
                  onClick={() => openApprovalDialog('REJECTED')}
                >
                  <XCircle className="h-4 w-4 mr-2" />
                  Request Changes
                </Button>
              </div>
            </div>
          )}

          {/* Message History */}
          {proof.FileMessage.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                Comments ({proof.FileMessage.length})
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {proof.FileMessage.map((msg) => (
                  <div key={msg.id} className="bg-muted rounded-lg p-3 text-sm">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className="text-xs" variant="outline">
                        {msg.authorRole}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(msg.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <p>{msg.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Large Preview Dialog */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>{proof.label || proof.filename}</DialogTitle>
            <DialogDescription>
              Click outside to close • Right-click to save image
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-auto max-h-[75vh]">
            {proof.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
              <img
                alt={proof.label || proof.filename}
                className="w-full h-auto"
                loading="lazy"
                src={proof.fileUrl}
              />
            ) : proof.fileUrl.match(/\.pdf$/i) ? (
              <iframe
                className="w-full h-[70vh]"
                src={proof.fileUrl}
                title={proof.label || proof.filename}
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <FileText className="h-24 w-24 text-muted-foreground" />
                <p className="text-muted-foreground">Preview not available for this file type</p>
                <Button onClick={() => window.open(proof.fileUrl, '_blank')}>
                  <Download className="h-4 w-4 mr-2" />
                  Download to View
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Approval Dialog */}
      <Dialog open={approvalDialogOpen} onOpenChange={setApprovalDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {approvalAction === 'APPROVED' ? 'Approve Proof' : 'Request Changes'}
            </DialogTitle>
            <DialogDescription>
              {approvalAction === 'APPROVED'
                ? 'Confirm that this proof looks good and is ready for production.'
                : 'Please describe what changes you would like to see.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="message">
                {approvalAction === 'APPROVED' ? 'Message (optional)' : 'Changes Needed *'}
              </Label>
              <Textarea
                id="message"
                placeholder={
                  approvalAction === 'APPROVED'
                    ? 'Add a comment (optional)...'
                    : 'Please describe the changes you need...'
                }
                required={approvalAction === 'REJECTED'}
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              className="flex-1"
              disabled={submitting}
              variant="outline"
              onClick={() => setApprovalDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className={
                approvalAction === 'APPROVED'
                  ? 'flex-1 bg-green-600 hover:bg-green-700'
                  : 'flex-1'
              }
              disabled={submitting || (approvalAction === 'REJECTED' && !message.trim())}
              variant={approvalAction === 'REJECTED' ? 'destructive' : 'default'}
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
                  Submit Changes
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
