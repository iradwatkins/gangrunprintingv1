import { cn } from '@/lib/utils'

interface ProductImagePlaceholderProps {
  title: string
  className?: string
  iconSize?: 'sm' | 'md' | 'lg' | 'xl'
}

const productIcons: Record<string, string> = {
  'Business Cards': '🎴',
  'Flyers & Brochures': '📑',
  'Banners & Signs': '🎪',
  'Stickers & Labels': '🏷️',
  Apparel: '👔',
  Postcards: '✉️',
  Posters: '🖼️',
  'T-Shirts': '👕',
  'Yard Signs': '📍',
}

const sizeMap = {
  sm: 'text-2xl',
  md: 'text-4xl',
  lg: 'text-6xl',
  xl: 'text-8xl',
}

export function ProductImagePlaceholder({
  title,
  className,
  iconSize = 'lg',
}: ProductImagePlaceholderProps) {
  const icon = productIcons[title] || '📦'

  return (
    <div
      className={cn(
        'w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex flex-col items-center justify-center',
        className
      )}
    >
      <div className={cn('mb-2', sizeMap[iconSize])}>{icon}</div>
      <p className="text-xs text-muted-foreground text-center px-2">{title}</p>
    </div>
  )
}
