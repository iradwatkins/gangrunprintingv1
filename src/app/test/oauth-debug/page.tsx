export default function OAuthDebugPage() {
  const config = {
    domain: process.env.DOMAIN,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    publicAppUrl: process.env.NEXT_PUBLIC_APP_URL,
    googleClientId: process.env.AUTH_GOOGLE_ID,
    nodeEnv: process.env.NODE_ENV,
    expectedRedirectUri: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`,
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">OAuth Debug Info</h1>

      <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-bold mb-4 text-yellow-800">
          ⚠️ Google Console Configuration Required
        </h2>
        <p className="mb-4">Go to Google Cloud Console and verify these settings:</p>

        <div className="bg-white p-4 rounded border mb-4">
          <h3 className="font-bold mb-2">1. Authorized JavaScript Origins</h3>
          <code className="bg-gray-100 px-2 py-1 rounded block">https://gangrunprinting.com</code>
        </div>

        <div className="bg-white p-4 rounded border">
          <h3 className="font-bold mb-2">2. Authorized Redirect URIs (ADD BOTH)</h3>
          <code className="bg-gray-100 px-2 py-1 rounded block mb-2">
            https://gangrunprinting.com/api/auth/google/callback
          </code>
          <code className="bg-gray-100 px-2 py-1 rounded block">
            https://www.gangrunprinting.com/api/auth/google/callback
          </code>
        </div>
      </div>

      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Current Configuration</h2>
        <pre className="bg-white p-4 rounded overflow-auto">{JSON.stringify(config, null, 2)}</pre>
      </div>

      <div className="mt-6 bg-blue-50 border-2 border-blue-400 p-6 rounded-lg">
        <h3 className="font-bold mb-2">Google Console URL:</h3>
        <a
          className="text-blue-600 underline"
          href="https://console.cloud.google.com/apis/credentials"
          rel="noopener noreferrer"
          target="_blank"
        >
          https://console.cloud.google.com/apis/credentials
        </a>
        <p className="mt-4 text-sm">
          1. Click on your OAuth 2.0 Client ID
          <br />
          2. Add the redirect URIs shown above
          <br />
          3. Save changes
          <br />
          4. Try logging in again
        </p>
      </div>
    </div>
  )
}
