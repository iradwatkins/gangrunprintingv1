export default function Verify() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
            Check your email
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            A sign-in link has been sent to your email address.
          </p>
        </div>
        
        <div className="mt-8 space-y-4">
          <div className="rounded-lg bg-blue-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Important
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Please check your spam folder if you don't see the email in your inbox.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-500">
            You can close this window once you've clicked the link in your email.
          </p>
        </div>
      </div>
    </div>
  )
}