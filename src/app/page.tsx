import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-background">
      <div className="z-10 max-w-5xl w-full items-center justify-between">
        <h1 className="text-5xl font-bold text-center mb-4 text-foreground">
          Welcome to GangRun Printing
        </h1>
        <p className="text-center text-muted-foreground mb-12 text-lg">
          Professional printing services for all your needs
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link 
            href="/products"
            className="bg-primary text-primary-foreground px-8 py-4 rounded-lg hover:opacity-90 transition-opacity font-semibold text-lg shadow-lg inline-block text-center"
          >
            Browse Products
          </Link>
          <Link 
            href="/upload"
            className="border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-lg inline-block text-center"
          >
            Upload Files
          </Link>
          <Link
            href="/track"
            className="border-2 border-primary text-primary px-8 py-4 rounded-lg hover:bg-primary hover:text-primary-foreground transition-colors font-semibold text-lg inline-block text-center"
          >
            Track Order
          </Link>
        </div>
        <div className="mt-12 text-center">
          <Link 
            href="/admin"
            className="text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Dashboard →
          </Link>
        </div>
      </div>
    </main>
  )
}