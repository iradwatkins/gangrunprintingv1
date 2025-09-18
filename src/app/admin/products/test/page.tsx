'use client'

export default function TestPage() {
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-4">Test Admin Page</h1>
      <p className="text-lg">If you can see this text, the page is rendering correctly!</p>

      <div className="mt-8 p-4 bg-green-50 border border-green-300 rounded">
        <h2 className="text-xl font-semibold text-green-800">✅ Success!</h2>
        <p>The admin layout and auth wrapper are working.</p>
        <p>This confirms the page component can render.</p>
        <p>Time: {new Date().toISOString()}</p>
      </div>

      <div className="mt-4 p-4 bg-blue-50 border border-blue-300 rounded">
        <h2 className="text-xl font-semibold text-blue-800">📋 Diagnostics:</h2>
        <ul className="list-disc list-inside mt-2">
          <li>Client side: {typeof window !== 'undefined' ? 'Yes' : 'No'}</li>
          <li>URL: {typeof window !== 'undefined' ? window.location.href : 'N/A'}</li>
          <li>The issue is likely with data fetching in products/new page</li>
        </ul>
      </div>
    </div>
  )
}