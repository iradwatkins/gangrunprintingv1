import { redirect } from 'next/navigation'

// Root page - redirects to default locale (English)
// This handles visitors who land at gangrunprinting.com/
export default function RootPage() {
  redirect('/en')
}
