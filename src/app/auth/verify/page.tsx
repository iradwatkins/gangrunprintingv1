import { Suspense } from 'react'
import { verifyMagicLink } from '@/lib/auth'
import { redirect } from 'next/navigation'

interface VerifyPageProps {
  searchParams: {
    token?: string
    email?: string
  }
}

async function VerifyContent({ searchParams }: VerifyPageProps) {
  const { token, email } = searchParams

  if (!token || !email) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid Magic Link</h1>
          <p className="text-gray-600 mb-6">The magic link is missing required parameters.</p>
          <a
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Request New Magic Link
          </a>
        </div>
      </div>
    )
  }

  try {
    await verifyMagicLink(token, email)
    redirect('/dashboard')
  } catch (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-6">
            The magic link has expired or is invalid. Please request a new one.
          </p>
          <a
            href="/auth/signin"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Request New Magic Link
          </a>
        </div>
      </div>
    )
  }
}

function LoadingVerify() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Verifying your magic link...</p>
      </div>
    </div>
  )
}

export default function VerifyPage({ searchParams }: VerifyPageProps) {
  return (
    <Suspense fallback={<LoadingVerify />}>
      <VerifyContent searchParams={searchParams} />
    </Suspense>
  )
}