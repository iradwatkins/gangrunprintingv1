import Header from './header'
import Footer from './footer'
import { ChatwootWidget } from './chatwoot-widget'

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ChatwootWidget />
    </div>
  )
}