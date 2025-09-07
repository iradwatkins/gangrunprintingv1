'use client'

import { useState, use } from 'react'
import { ArrowLeft, Upload, ShoppingCart, Clock, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const products: { [key: string]: any } = {
  '1': {
    id: '1',
    name: 'Business Cards',
    category: 'Marketing Materials',
    description: 'Make a lasting impression with our premium business cards. Choose from a variety of paper stocks, finishes, and sizes to create the perfect card for your brand.',
    startingPrice: 29.99,
    turnaround: '3-5 business days',
    sizes: [
      { id: 'standard', name: 'Standard (3.5" x 2")', price: 29.99 },
      { id: 'square', name: 'Square (2.5" x 2.5")', price: 34.99 },
      { id: 'mini', name: 'Mini (3.5" x 1")', price: 24.99 }
    ],
    paperTypes: [
      { id: 'matte', name: '16pt Matte', price: 0 },
      { id: 'gloss', name: '16pt Gloss', price: 0 },
      { id: 'premium', name: '32pt Premium', price: 10 }
    ],
    quantities: [
      { amount: 100, price: 29.99 },
      { amount: 250, price: 39.99 },
      { amount: 500, price: 59.99 },
      { amount: 1000, price: 89.99 }
    ],
    finishes: [
      { id: 'none', name: 'No Coating', price: 0 },
      { id: 'uv', name: 'UV Coating', price: 5 },
      { id: 'foil', name: 'Foil Stamping', price: 15 }
    ]
  },
  '2': {
    id: '2',
    name: 'Flyers & Brochures',
    category: 'Marketing Materials',
    description: 'Promote your business with eye-catching flyers and brochures. Perfect for events, promotions, and marketing campaigns.',
    startingPrice: 49.99,
    turnaround: '5-7 business days',
    sizes: [
      { id: 'letter', name: '8.5" x 11"', price: 49.99 },
      { id: 'half', name: '5.5" x 8.5"', price: 39.99 },
      { id: 'trifold', name: '11" x 8.5" Tri-fold', price: 59.99 }
    ],
    paperTypes: [
      { id: 'standard', name: '100lb Text', price: 0 },
      { id: 'premium', name: '100lb Cover', price: 10 }
    ],
    quantities: [
      { amount: 25, price: 49.99 },
      { amount: 50, price: 79.99 },
      { amount: 100, price: 129.99 },
      { amount: 250, price: 249.99 }
    ],
    finishes: [
      { id: 'none', name: 'No Coating', price: 0 },
      { id: 'matte', name: 'Matte Finish', price: 5 },
      { id: 'gloss', name: 'Gloss Finish', price: 5 }
    ]
  }
}

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const router = useRouter()
  const product = products[resolvedParams.id] || products['1']
  
  const [selectedSize, setSelectedSize] = useState(product.sizes[0].id)
  const [selectedPaper, setSelectedPaper] = useState(product.paperTypes[0].id)
  const [selectedQuantity, setSelectedQuantity] = useState(product.quantities[0].amount)
  const [selectedFinish, setSelectedFinish] = useState(product.finishes[0].id)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const calculatePrice = () => {
    const sizePrice = product.sizes.find((s: any) => s.id === selectedSize)?.price || 0
    const paperPrice = product.paperTypes.find((p: any) => p.id === selectedPaper)?.price || 0
    const quantityPrice = product.quantities.find((q: any) => q.amount === selectedQuantity)?.price || 0
    const finishPrice = product.finishes.find((f: any) => f.id === selectedFinish)?.price || 0
    
    return quantityPrice + paperPrice + finishPrice
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0])
    }
  }

  const handleAddToCart = () => {
    // TODO: Implement cart functionality
    console.log('Adding to cart:', {
      product: product.name,
      size: selectedSize,
      paper: selectedPaper,
      quantity: selectedQuantity,
      finish: selectedFinish,
      price: calculatePrice(),
      file: uploadedFile?.name
    })
    router.push('/cart')
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Products
      </Link>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Product Image */}
        <div>
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-muted-foreground">[Product Image]</span>
          </div>
          <div className="grid grid-cols-4 gap-2 mt-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded flex items-center justify-center">
                <span className="text-xs text-muted-foreground">[{i}]</span>
              </div>
            ))}
          </div>
        </div>

        {/* Product Details */}
        <div>
          <div className="mb-6">
            <Badge variant="secondary" className="mb-2">{product.category}</Badge>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-muted-foreground mb-4">{product.description}</p>
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center">
                <Clock className="mr-1 h-4 w-4" />
                {product.turnaround}
              </div>
            </div>
          </div>

          <Tabs defaultValue="customize" className="mb-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="customize">Customize</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customize" className="space-y-6">
              {/* Size Selection */}
              <div>
                <Label className="text-base mb-3 block">Size</Label>
                <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
                  {product.sizes.map((size: any) => (
                    <div key={size.id} className="flex items-center space-x-2 mb-2">
                      <RadioGroupItem value={size.id} id={size.id} />
                      <Label htmlFor={size.id} className="cursor-pointer flex-1">
                        <span>{size.name}</span>
                        <span className="ml-2 text-muted-foreground">${size.price}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Paper Type */}
              <div>
                <Label htmlFor="paper" className="text-base mb-3 block">Paper Type</Label>
                <Select value={selectedPaper} onValueChange={setSelectedPaper}>
                  <SelectTrigger id="paper">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.paperTypes.map((paper: any) => (
                      <SelectItem key={paper.id} value={paper.id}>
                        {paper.name} {paper.price > 0 && `(+$${paper.price})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Quantity */}
              <div>
                <Label htmlFor="quantity" className="text-base mb-3 block">Quantity</Label>
                <Select value={selectedQuantity.toString()} onValueChange={(v) => setSelectedQuantity(parseInt(v))}>
                  <SelectTrigger id="quantity">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.quantities.map((qty: any) => (
                      <SelectItem key={qty.amount} value={qty.amount.toString()}>
                        {qty.amount} - ${qty.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Finish */}
              <div>
                <Label htmlFor="finish" className="text-base mb-3 block">Finish</Label>
                <Select value={selectedFinish} onValueChange={setSelectedFinish}>
                  <SelectTrigger id="finish">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {product.finishes.map((finish: any) => (
                      <SelectItem key={finish.id} value={finish.id}>
                        {finish.name} {finish.price > 0 && `(+$${finish.price})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* File Upload */}
              <div>
                <Label htmlFor="file" className="text-base mb-3 block">Upload Your Design</Label>
                <div className="border-2 border-dashed rounded-lg p-4">
                  <Input
                    id="file"
                    type="file"
                    accept=".pdf,.ai,.psd,.jpg,.jpeg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="file"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    <Upload className="h-8 w-8 mb-2 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploadedFile ? uploadedFile.name : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-muted-foreground mt-1">
                      PDF, AI, PSD, JPG, PNG (max. 100MB)
                    </span>
                  </Label>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="specifications" className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Product Specifications</h3>
                <dl className="space-y-2">
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Category:</dt>
                    <dd>{product.category}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Turnaround Time:</dt>
                    <dd>{product.turnaround}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Available Sizes:</dt>
                    <dd>{product.sizes.length} options</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Paper Options:</dt>
                    <dd>{product.paperTypes.length} types</dd>
                  </div>
                </dl>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Features</h3>
                <ul className="space-y-1">
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Professional quality printing
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Free design review
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    100% satisfaction guarantee
                  </li>
                  <li className="flex items-center">
                    <Check className="mr-2 h-4 w-4 text-green-500" />
                    Fast turnaround times
                  </li>
                </ul>
              </div>
            </TabsContent>
          </Tabs>

          {/* Price and Add to Cart */}
          <div className="border-t pt-6">
            <div className="flex items-end justify-between mb-4">
              <div>
                <span className="text-sm text-muted-foreground">Total Price</span>
                <p className="text-3xl font-bold">${calculatePrice().toFixed(2)}</p>
              </div>
              <Badge variant="outline" className="mb-1">
                <Clock className="mr-1 h-3 w-3" />
                {product.turnaround}
              </Badge>
            </div>
            <Button 
              onClick={handleAddToCart}
              size="lg" 
              className="w-full"
              disabled={!uploadedFile}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Add to Cart
            </Button>
            {!uploadedFile && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please upload your design file to continue
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}