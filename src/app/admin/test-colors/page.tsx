export default function TestColors() {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Color Test Page</h1>
      
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Primary Colors</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-primary rounded flex items-center justify-center text-primary-foreground">
            Primary
          </div>
          <div className="w-24 h-24 bg-primary/50 rounded flex items-center justify-center">
            Primary/50
          </div>
          <div className="w-24 h-24 bg-primary/10 rounded flex items-center justify-center">
            Primary/10
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Accent Colors</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-accent rounded flex items-center justify-center text-accent-foreground">
            Accent
          </div>
          <div className="w-24 h-24 bg-accent/50 rounded flex items-center justify-center">
            Accent/50
          </div>
          <div className="w-24 h-24 bg-accent/10 rounded flex items-center justify-center">
            Accent/10
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Chart Colors</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-chart-1 rounded flex items-center justify-center text-white">
            Chart 1
          </div>
          <div className="w-24 h-24 bg-chart-2 rounded flex items-center justify-center text-white">
            Chart 2
          </div>
          <div className="w-24 h-24 bg-chart-3 rounded flex items-center justify-center text-white">
            Chart 3
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Direct Orange Colors</h2>
        <div className="flex gap-4">
          <div className="w-24 h-24 bg-orange-500 rounded flex items-center justify-center text-white">
            Orange 500
          </div>
          <div className="w-24 h-24 bg-orange-400 rounded flex items-center justify-center text-white">
            Orange 400
          </div>
          <div className="w-24 h-24 bg-orange-600 rounded flex items-center justify-center text-white">
            Orange 600
          </div>
        </div>
      </div>
    </div>
  )
}