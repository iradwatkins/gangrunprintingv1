'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { ProofApprovalCard } from './proof-approval-card';
import { Eye, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

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
}

export function CustomerProofApproval({ orderId }: Props) {
  const [proofs, setProofs] = useState<ProofFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProofs = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/orders/${orderId}/files`);
      if (!response.ok) {
        throw new Error('Failed to load proofs');
      }
      const data = await response.json();
      // Filter to only show ADMIN_PROOF files
      const adminProofs = data.files?.filter((f: any) => f.fileType === 'ADMIN_PROOF') || [];
      setProofs(adminProofs);
    } catch (err) {
      console.error('Error fetching proofs:', err);
      setError('Unable to load proofs. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProofs();
  }, [orderId]);

  const waitingProofs = proofs.filter((p) => p.approvalStatus === 'WAITING');
  const approvedProofs = proofs.filter((p) => p.approvalStatus === 'APPROVED');
  const rejectedProofs = proofs.filter((p) => p.approvalStatus === 'REJECTED');

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proof Approval
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading proofs...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proof Approval
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (proofs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proof Approval
          </CardTitle>
          <CardDescription>
            No proofs have been uploaded for this order yet.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Waiting for Proofs</AlertTitle>
            <AlertDescription>
              Our team will upload proofs for your review soon. You'll be notified by email when
              they're ready.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Proof Approval
              </CardTitle>
              <CardDescription>
                Review and approve proofs before we start production
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {waitingProofs.length > 0 && (
                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-300">
                  {waitingProofs.length} Waiting
                </Badge>
              )}
              {approvedProofs.length > 0 && (
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                  {approvedProofs.length} Approved
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        {waitingProofs.length > 0 && (
          <CardContent>
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Action Required</AlertTitle>
              <AlertDescription className="text-yellow-700">
                You have {waitingProofs.length} proof{waitingProofs.length !== 1 ? 's' : ''}{' '}
                waiting for your approval. Please review and approve them so we can proceed with
                production.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
        {waitingProofs.length === 0 && approvedProofs.length === proofs.length && (
          <CardContent>
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">All Proofs Approved</AlertTitle>
              <AlertDescription className="text-green-700">
                Great! All proofs have been approved. We'll proceed with production shortly.
              </AlertDescription>
            </Alert>
          </CardContent>
        )}
      </Card>

      {/* Waiting Proofs Section */}
      {waitingProofs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Proofs Awaiting Your Approval</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {waitingProofs.map((proof) => (
              <ProofApprovalCard
                key={proof.id}
                orderId={orderId}
                proof={proof}
                onApprovalChange={fetchProofs}
              />
            ))}
          </div>
        </div>
      )}

      {/* Rejected Proofs Section */}
      {rejectedProofs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Proofs with Requested Changes</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {rejectedProofs.map((proof) => (
              <ProofApprovalCard
                key={proof.id}
                orderId={orderId}
                proof={proof}
                onApprovalChange={fetchProofs}
              />
            ))}
          </div>
        </div>
      )}

      {/* Approved Proofs Section */}
      {approvedProofs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Approved Proofs</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {approvedProofs.map((proof) => (
              <ProofApprovalCard
                key={proof.id}
                orderId={orderId}
                proof={proof}
                onApprovalChange={fetchProofs}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
