'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProofApprovalCard } from './proof-approval-card'
import { MobileProofApprovalCard } from './mobile-proof-approval-card'
import {
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Smartphone,
  Monitor,
} from 'lucide-react'
import { useMediaQuery } from '@/hooks/use-media-query'

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
}

export function ResponsiveProofApproval({ orderId }: Props) {
  const [proofs, setProofs] = useState<ProofFile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  // Use media query hook to detect mobile vs desktop
  const isMobile = useMediaQuery('(max-width: 768px)')

  const fetchProofs = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const response = await fetch(`/api/orders/${orderId}/files`)
      if (!response.ok) {
        throw new Error('Failed to load proofs')
      }
      const data = await response.json()

      // Extract proofs from the response
      const files = data.success ? data.data.files : data.files

      // Filter to only show ADMIN_PROOF files
      const adminProofs = files?.filter((f: any) => f.fileType === 'ADMIN_PROOF') || []
      setProofs(adminProofs)
      setLastRefresh(new Date())
    } catch (err) {
      console.error('Error fetching proofs:', err)
      setError('Unable to load proofs. Please try again.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchProofs()
  }, [orderId])

  // Auto-refresh every 30 seconds if there are waiting proofs
  useEffect(() => {
    const waitingProofs = proofs.filter((p) => p.approvalStatus === 'WAITING')
    if (waitingProofs.length === 0) return

    const interval = setInterval(() => {
      fetchProofs(true)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [proofs])

  const waitingProofs = proofs.filter((p) => p.approvalStatus === 'WAITING')
  const approvedProofs = proofs.filter((p) => p.approvalStatus === 'APPROVED')
  const rejectedProofs = proofs.filter((p) => p.approvalStatus === 'REJECTED')

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proof Approval
            {isMobile && <Smartphone className="h-4 w-4 text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading proofs...</p>
          </div>
        </CardContent>
      </Card>
    )
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
            <AlertDescription className="mb-4">{error}</AlertDescription>
          </Alert>
          <Button className="w-full" variant="outline" onClick={() => fetchProofs()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  if (proofs.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Proof Approval
          </CardTitle>
          <CardDescription>No proofs have been uploaded for this order yet.</CardDescription>
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
    )
  }

  // Mobile layout
  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Header */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Eye className="h-5 w-5" />
                  Proof Review
                </CardTitle>
                <CardDescription className="text-sm">
                  {waitingProofs.length > 0
                    ? `${waitingProofs.length} proof${waitingProofs.length !== 1 ? 's' : ''} need${waitingProofs.length === 1 ? 's' : ''} your review`
                    : 'All proofs reviewed'}
                </CardDescription>
              </div>

              <div className="flex items-center gap-2">
                {refreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                <Button
                  disabled={refreshing}
                  size="sm"
                  variant="outline"
                  onClick={() => fetchProofs(true)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Status badges */}
            <div className="flex flex-wrap gap-2 pt-2">
              {waitingProofs.length > 0 && (
                <Badge className="bg-amber-100 text-amber-800 border-amber-300" variant="outline">
                  {waitingProofs.length} Waiting
                </Badge>
              )}
              {approvedProofs.length > 0 && (
                <Badge
                  className="bg-emerald-100 text-emerald-800 border-emerald-300"
                  variant="outline"
                >
                  {approvedProofs.length} Approved
                </Badge>
              )}
              {rejectedProofs.length > 0 && (
                <Badge className="bg-red-100 text-red-800 border-red-300" variant="outline">
                  {rejectedProofs.length} Changes Requested
                </Badge>
              )}
            </div>
          </CardHeader>

          {/* Mobile alerts */}
          {waitingProofs.length > 0 && (
            <CardContent>
              <Alert className="bg-amber-50 border-amber-200">
                <AlertCircle className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-800">Action Required</AlertTitle>
                <AlertDescription className="text-amber-700">
                  Review and approve {waitingProofs.length} proof
                  {waitingProofs.length !== 1 ? 's' : ''} below to proceed with production.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}

          {waitingProofs.length === 0 && approvedProofs.length === proofs.length && (
            <CardContent>
              <Alert className="bg-emerald-50 border-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="text-emerald-800">All Set!</AlertTitle>
                <AlertDescription className="text-emerald-700">
                  All proofs approved. We'll start production soon.
                </AlertDescription>
              </Alert>
            </CardContent>
          )}
        </Card>

        {/* Mobile proof cards */}
        <div className="space-y-4">
          {/* Waiting proofs first (priority) */}
          {waitingProofs.map((proof) => (
            <MobileProofApprovalCard
              key={proof.id}
              orderId={orderId}
              proof={proof}
              onApprovalChange={() => fetchProofs(true)}
            />
          ))}

          {/* Rejected proofs */}
          {rejectedProofs.map((proof) => (
            <MobileProofApprovalCard
              key={proof.id}
              orderId={orderId}
              proof={proof}
              onApprovalChange={() => fetchProofs(true)}
            />
          ))}

          {/* Approved proofs last */}
          {approvedProofs.map((proof) => (
            <MobileProofApprovalCard
              key={proof.id}
              orderId={orderId}
              proof={proof}
              onApprovalChange={() => fetchProofs(true)}
            />
          ))}
        </div>

        {/* Last refresh indicator */}
        <div className="text-center text-xs text-muted-foreground py-2">
          Last updated: {lastRefresh.toLocaleTimeString()}
        </div>
      </div>
    )
  }

  // Desktop layout (original)
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
                <Monitor className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
              <CardDescription>
                Review and approve proofs before we start production
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                {waitingProofs.length > 0 && (
                  <Badge
                    className="bg-yellow-100 text-yellow-800 border-yellow-300"
                    variant="outline"
                  >
                    {waitingProofs.length} Waiting
                  </Badge>
                )}
                {approvedProofs.length > 0 && (
                  <Badge className="bg-green-100 text-green-800 border-green-300" variant="outline">
                    {approvedProofs.length} Approved
                  </Badge>
                )}
              </div>

              {refreshing && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
              <Button
                disabled={refreshing}
                size="sm"
                variant="outline"
                onClick={() => fetchProofs(true)}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardHeader>

        {waitingProofs.length > 0 && (
          <CardContent>
            <Alert className="bg-yellow-50 border-yellow-200">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertTitle className="text-yellow-800">Action Required</AlertTitle>
              <AlertDescription className="text-yellow-700">
                You have {waitingProofs.length} proof{waitingProofs.length !== 1 ? 's' : ''} waiting
                for your approval. Please review and approve them so we can proceed with production.
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

      {/* Desktop proof sections */}
      {waitingProofs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Proofs Awaiting Your Approval</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {waitingProofs.map((proof) => (
              <ProofApprovalCard
                key={proof.id}
                orderId={orderId}
                proof={proof}
                onApprovalChange={() => fetchProofs(true)}
              />
            ))}
          </div>
        </div>
      )}

      {rejectedProofs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Proofs with Requested Changes</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {rejectedProofs.map((proof) => (
              <ProofApprovalCard
                key={proof.id}
                orderId={orderId}
                proof={proof}
                onApprovalChange={() => fetchProofs(true)}
              />
            ))}
          </div>
        </div>
      )}

      {approvedProofs.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Approved Proofs</h3>
          <div className="grid gap-4 md:grid-cols-2">
            {approvedProofs.map((proof) => (
              <ProofApprovalCard
                key={proof.id}
                orderId={orderId}
                proof={proof}
                onApprovalChange={() => fetchProofs(true)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
