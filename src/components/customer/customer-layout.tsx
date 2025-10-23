import HeaderWrapper from './header-wrapper'
import Footer from './footer'

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
