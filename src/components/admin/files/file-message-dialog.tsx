'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MessageSquare, Send, User, Clock, Download, CheckCircle, XCircle } from 'lucide-react';

interface OrderFile {
  id: string;
  filename: string;
  fileUrl: string;
  fileType: string;
  label?: string;
  approvalStatus: 'WAITING' | 'APPROVED' | 'REJECTED' | 'NOT_REQUIRED';
  uploadedByRole: string;
  createdAt: string;
}

interface Message {
  id: string;
  message: string;
  authorRole: string;
  authorName: string;
  createdAt: string;
  isInternal: boolean;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  file: OrderFile;
  onMessageSent: () => void;
}

const approvalStatusConfig = {
  WAITING: { label: 'Awaiting Approval', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  APPROVED: { label: 'Approved', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  REJECTED: { label: 'Rejected', color: 'bg-red-100 text-red-800', icon: XCircle },
  NOT_REQUIRED: { label: 'No Approval Needed', color: 'bg-gray-100 text-gray-800', icon: CheckCircle },
};

export function FileMessageDialog({ open, onOpenChange, orderId, file, onMessageSent }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/files/${file.id}/messages`);
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchMessages();
    }
  }, [open, file.id]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      const response = await fetch(`/api/orders/${orderId}/files/${file.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: newMessage,
          isInternal: false,
        }),
      });

      if (response.ok) {
        setNewMessage('');
        fetchMessages();
        onMessageSent();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    } finally {
      setSending(false);
    }
  };

  const statusConfig = approvalStatusConfig[file.approvalStatus];
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            File Discussion
          </DialogTitle>
          <DialogDescription>
            <div className="flex flex-col gap-2 mt-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">{file.label || file.filename}</span>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(file.fileUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-1" />
                  Download
                </Button>
              </div>
              <Badge className={`${statusConfig.color} gap-1 w-fit`}>
                <StatusIcon className="h-3 w-3" />
                {statusConfig.label}
              </Badge>
            </div>
          </DialogDescription>
        </DialogHeader>

        <Separator />

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 py-4">
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No messages yet</p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className="flex gap-3">
                <div
                  className={`rounded-full h-8 w-8 flex items-center justify-center flex-shrink-0 ${
                    message.authorRole === 'admin'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{message.authorName}</span>
                    <Badge className="text-xs" variant="outline">
                      {message.authorRole}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm bg-muted rounded-lg p-3">{message.message}</p>
                </div>
              </div>
            ))
          )}
        </div>

        <Separator />

        {/* New Message Input */}
        <div className="space-y-2 pt-4">
          <Textarea
            disabled={sending}
            placeholder="Type your message..."
            rows={3}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSendMessage();
              }
            }}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-muted-foreground">Press Ctrl+Enter to send</p>
            <Button disabled={!newMessage.trim() || sending} size="sm" onClick={handleSendMessage}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
