'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import toast from '@/lib/toast'
import {
  ArrowLeft,
  ArrowRight,
  Save,
  Loader2,
  Package,
  Image as ImageIcon,
  FileText,
  Layers,
  Ruler,
  Settings,
  Clock,
  Calculator,
  CheckCircle2,
} from 'lucide-react'

// Import step components
import { ProductBasicInfoStep } from './wizard-steps/product-basic-info-step'
import { ProductPaperStockStep } from './wizard-steps/product-paper-stock-step'
import { ProductQuantityStep } from './wizard-steps/product-quantity-step'
import { ProductSizeStep } from './wizard-steps/product-size-step'
import { ProductOptionsStep } from './wizard-steps/product-options-step'
import { ProductTurnaroundStep } from './wizard-steps/product-turnaround-step'
import { ProductPriceTestStep } from './wizard-steps/product-price-test-step'

interface ProductWizardProps {
  product?: any
}

interface WizardStep {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isCompleted: boolean
  isValid: boolean
}

interface ProductData {
  // Basic Info
  name: string
  slug: string
  sku: string
  categoryId: string
  description: string
  shortDescription: string
  isActive: boolean
  isFeatured: boolean

  // Images
  images: any[]

  // Paper Stocks
  paperStocks: any[]

  // Quantities
  useQuantityGroup: boolean
  quantityGroupId: string
  quantityIds: string[]

  // Sizes
  useSizeGroup: boolean
  sizeGroupId: string
  sizeIds: string[]

  // Options/Add-ons
  options: any[]

  // Turnaround/Production
  productionTime: number
  rushAvailable: boolean
  rushDays: number
  rushFee: number
  gangRunEligible: boolean
  minGangQuantity: number
  maxGangQuantity: number

  // Pricing
  basePrice: number
  setupFee: number
  pricingTiers: any[]
}

export function ProductWizard({ product }: ProductWizardProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [savingDraft, setSavingDraft] = useState(false)

  const [formData, setFormData] = useState<ProductData>({
    name: product?.name || '',
    slug: product?.slug || '',
    sku: product?.sku || '',
    categoryId: product?.categoryId || '',
    description: product?.description || '',
    shortDescription: product?.shortDescription || '',
    isActive: product?.isActive ?? true,
    isFeatured: product?.isFeatured || false,
    images: product?.images || [],
    paperStocks: product?.paperStocks || [],
    useQuantityGroup: product?.quantityGroupId ? true : false,
    quantityGroupId: product?.quantityGroupId || '',
    quantityIds: product?.quantityIds || [],
    useSizeGroup: product?.sizeGroupId ? true : false,
    sizeGroupId: product?.sizeGroupId || '',
    sizeIds: product?.sizeIds || [],
    options: product?.options || [],
    productionTime: product?.productionTime || 3,
    rushAvailable: product?.rushAvailable || false,
    rushDays: product?.rushDays || 1,
    rushFee: product?.rushFee || 0,
    gangRunEligible: product?.gangRunEligible || false,
    minGangQuantity: product?.minGangQuantity || 100,
    maxGangQuantity: product?.maxGangQuantity || 1000,
    basePrice: product?.basePrice || 0,
    setupFee: product?.setupFee || 0,
    pricingTiers: product?.pricingTiers || [],
  })

  const [stepValidation, setStepValidation] = useState<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
    false,
  ])

  const steps: WizardStep[] = [
    {
      id: 'basic-info',
      title: 'Basic Info & Images',
      description: 'Product name, description, and images',
      icon: Package,
      isCompleted: stepValidation[0],
      isValid: stepValidation[0],
    },
    {
      id: 'paper-stock',
      title: 'Paper Stock',
      description: 'Available paper options',
      icon: FileText,
      isCompleted: stepValidation[1],
      isValid: stepValidation[1],
    },
    {
      id: 'quantities',
      title: 'Quantity Options',
      description: 'Available quantities',
      icon: Layers,
      isCompleted: stepValidation[2],
      isValid: stepValidation[2],
    },
    {
      id: 'sizes',
      title: 'Size Options',
      description: 'Available sizes',
      icon: Ruler,
      isCompleted: stepValidation[3],
      isValid: stepValidation[3],
    },
    {
      id: 'options',
      title: 'Add-on Options',
      description: 'Additional features and services',
      icon: Settings,
      isCompleted: stepValidation[4],
      isValid: stepValidation[4],
    },
    {
      id: 'turnaround',
      title: 'Turnaround Times',
      description: 'Production and delivery times',
      icon: Clock,
      isCompleted: stepValidation[5],
      isValid: stepValidation[5],
    },
    {
      id: 'price-test',
      title: 'Price Testing',
      description: 'Test pricing and publish',
      icon: Calculator,
      isCompleted: stepValidation[6],
      isValid: stepValidation[6],
    },
  ]

  const updateFormData = (updates: Partial<ProductData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const updateStepValidation = (stepIndex: number, isValid: boolean) => {
    setStepValidation((prev) => {
      const newValidation = [...prev]
      newValidation[stepIndex] = isValid
      return newValidation
    })
  }

  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex)
    }
  }

  const goToNextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1)
    }
  }

  const saveDraft = async () => {
    setSavingDraft(true)
    try {
      const url = product ? `/api/products/${product.id}/draft` : '/api/products/draft'

      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        throw new Error('Failed to save draft')
      }

      toast.success('Draft saved successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to save draft')
    } finally {
      setSavingDraft(false)
    }
  }

  const publishProduct = async () => {
    setLoading(true)
    try {
      const url = product ? `/api/products/${product.id}` : '/api/products'

      const method = product ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, isDraft: false }),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Failed to publish product')
      }

      toast.success(product ? 'Product updated successfully' : 'Product published successfully')
      router.push('/admin/products')
    } catch (error: any) {
      toast.error(error.message || 'Failed to publish product')
    } finally {
      setLoading(false)
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ProductBasicInfoStep
            formData={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(0, isValid)}
          />
        )
      case 1:
        return (
          <ProductPaperStockStep
            formData={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(1, isValid)}
          />
        )
      case 2:
        return (
          <ProductQuantityStep
            formData={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(2, isValid)}
          />
        )
      case 3:
        return (
          <ProductSizeStep
            formData={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(3, isValid)}
          />
        )
      case 4:
        return (
          <ProductOptionsStep
            formData={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(4, isValid)}
          />
        )
      case 5:
        return (
          <ProductTurnaroundStep
            formData={formData}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(5, isValid)}
          />
        )
      case 6:
        return (
          <ProductPriceTestStep
            formData={formData}
            onPublish={publishProduct}
            onUpdate={updateFormData}
            onValidationChange={(isValid) => updateStepValidation(6, isValid)}
          />
        )
      default:
        return null
    }
  }

  const progress = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button size="sm" variant="ghost" onClick={() => router.push('/admin/products')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Products
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {product ? 'Edit Product' : 'Create New Product'}
            </h1>
            <p className="text-muted-foreground">
              Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button disabled={savingDraft} size="sm" variant="outline" onClick={saveDraft}>
            {savingDraft && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}% Complete</span>
            </div>
            <Progress className="h-2" value={progress} />
          </div>
        </CardContent>
      </Card>

      {/* Step Navigation */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-7 gap-2">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = index === currentStep
              const isPast = index < currentStep
              const isClickable = index <= currentStep || step.isCompleted

              return (
                <button
                  key={step.id}
                  className={`
                    p-3 rounded-lg border transition-all text-center
                    ${
                      isActive
                        ? 'border-primary bg-primary/10 text-primary'
                        : isPast || step.isCompleted
                          ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100'
                          : 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                    }
                    ${isClickable && !isActive ? 'hover:border-primary/50 hover:bg-primary/5' : ''}
                  `}
                  disabled={!isClickable}
                  onClick={() => isClickable && goToStep(index)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center justify-center">
                      {step.isCompleted ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <div className="text-xs font-medium leading-tight">{step.title}</div>
                  </div>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Step Content */}
      <div className="min-h-[500px]">{renderStepContent()}</div>

      {/* Navigation Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-between">
            <Button disabled={currentStep === 0} variant="outline" onClick={goToPreviousStep}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <div className="flex items-center gap-2">
              {currentStep < steps.length - 1 && (
                <Button disabled={loading} variant="outline" onClick={publishProduct}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save Draft
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button disabled={!stepValidation[currentStep]} onClick={goToNextStep}>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button disabled={loading || !stepValidation[currentStep]} onClick={publishProduct}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {product ? 'Update Product' : 'Publish Product'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
