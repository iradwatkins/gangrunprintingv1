import { useState, useEffect } from 'react'
import toast from '@/lib/toast'

export interface ProductImage {
  id?: string
  imageId?: string
  url: string
  thumbnailUrl?: string
  largeUrl?: string
  mediumUrl?: string
  webpUrl?: string
  blurDataUrl?: string
  alt?: string
  isPrimary?: boolean
  sortOrder?: number
  width?: number
  height?: number
  fileSize?: number
  mimeType?: string
}

export interface ProductFormData {
  name: string
  sku: string
  categoryId: string
  description: string
  isActive: boolean
  isFeatured: boolean
  imageUrl: string
  images: ProductImage[]
  selectedPaperStockSet: string
  selectedQuantityGroup: string
  selectedSizeGroup: string
  selectedAddOnSet: string
  selectedTurnaroundTimeSet: string
  selectedDesignSet: string
}

export interface ProductFormOptions {
  categories: Array<{ id: string; name: string }>
  paperStockSets: Array<{ id: string; name: string }>
  quantityGroups: Array<{ id: string; name: string }>
  sizeGroups: Array<{ id: string; name: string }>
  addOnSets: Array<{ id: string; name: string }>
  turnaroundTimeSets: Array<{ id: string; name: string }>
  designSets: Array<{ id: string; name: string }>
}

const initialFormData: ProductFormData = {
  name: '',
  sku: '',
  categoryId: '',
  description: '',
  isActive: true,
  isFeatured: false,
  imageUrl: '',
  images: [],
  selectedPaperStockSet: '',
  selectedQuantityGroup: '',
  selectedSizeGroup: '',
  selectedAddOnSet: '',
  selectedTurnaroundTimeSet: '',
  selectedDesignSet: '',
}

export function useProductForm() {
  const [formData, setFormData] = useState<ProductFormData>(initialFormData)
  const [options, setOptions] = useState<ProductFormOptions>({
    categories: [],
    paperStockSets: [],
    quantityGroups: [],
    sizeGroups: [],
    addOnSets: [],
    turnaroundTimeSets: [],
    designSets: [],
  })
  const [loading, setLoading] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Auto-generate SKU when name changes
  useEffect(() => {
    if (formData.name) {
      const sku = formData.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      setFormData((prev) => ({ ...prev, sku }))
    }
  }, [formData.name])

  // Set default selections when data loads
  useEffect(() => {
    if (options.paperStockSets.length > 0 && !formData.selectedPaperStockSet) {
      setFormData((prev) => ({ ...prev, selectedPaperStockSet: options.paperStockSets[0].id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.paperStockSets])

  useEffect(() => {
    if (options.quantityGroups.length > 0 && !formData.selectedQuantityGroup) {
      setFormData((prev) => ({ ...prev, selectedQuantityGroup: options.quantityGroups[0].id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.quantityGroups])

  useEffect(() => {
    if (options.sizeGroups.length > 0 && !formData.selectedSizeGroup) {
      setFormData((prev) => ({ ...prev, selectedSizeGroup: options.sizeGroups[0].id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.sizeGroups])

  useEffect(() => {
    if (options.designSets.length > 0 && !formData.selectedDesignSet) {
      setFormData((prev) => ({ ...prev, selectedDesignSet: options.designSets[0].id }))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.designSets])

  const fetchOptions = async () => {
    try {
      setLoading(true)
      const [
        categoriesRes,
        paperStockGroupsRes,
        quantitiesRes,
        sizesRes,
        addOnSetsRes,
        turnaroundTimeSetsRes,
        designSetsRes,
      ] = await Promise.all([
        fetch('/api/product-categories'),
        fetch('/api/paper-stock-sets'),
        fetch('/api/quantity-groups'),
        fetch('/api/size-groups'),
        fetch('/api/addon-sets'),
        fetch('/api/turnaround-time-sets'),
        fetch('/api/design-sets'),
      ])

      const newErrors: Record<string, string> = {}
      const newOptions: ProductFormOptions = {
        categories: [],
        paperStockSets: [],
        quantityGroups: [],
        sizeGroups: [],
        addOnSets: [],
        turnaroundTimeSets: [],
        designSets: [],
      }

      if (categoriesRes.ok) {
        newOptions.categories = await categoriesRes.json()
      } else {
        newErrors.categories = 'Failed to load categories'
      }

      if (paperStockGroupsRes.ok) {
        newOptions.paperStockSets = await paperStockGroupsRes.json()
      } else {
        newErrors.paperStockSets = 'Failed to load paper stock sets'
      }

      if (quantitiesRes.ok) {
        newOptions.quantityGroups = await quantitiesRes.json()
      } else {
        newErrors.quantityGroups = 'Failed to load quantity groups'
      }

      if (sizesRes.ok) {
        newOptions.sizeGroups = await sizesRes.json()
      } else {
        newErrors.sizeGroups = 'Failed to load size groups'
      }

      if (addOnSetsRes.ok) {
        newOptions.addOnSets = await addOnSetsRes.json()
      } else {
        newErrors.addOnSets = 'Failed to load addon sets'
      }

      if (turnaroundTimeSetsRes.ok) {
        newOptions.turnaroundTimeSets = await turnaroundTimeSetsRes.json()
      } else {
        newErrors.turnaroundTimeSets = 'Failed to load turnaround time sets'
      }

      if (designSetsRes.ok) {
        newOptions.designSets = await designSetsRes.json()
      } else {
        newErrors.designSets = 'Failed to load design sets'
      }

      setOptions(newOptions)
      setErrors(newErrors)
    } catch (error) {
      setErrors({
        categories: 'Network error',
        paperStockSets: 'Network error',
        quantityGroups: 'Network error',
        sizeGroups: 'Network error',
        addOnSets: 'Network error',
        turnaroundTimeSets: 'Network error',
        designSets: 'Network error',
      })
    } finally {
      setLoading(false)
    }
  }

  const updateFormData = (updates: Partial<ProductFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }))
  }

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast.error('Product name is required')
      return false
    }

    // SKU is optional - will be auto-generated if empty

    if (!formData.categoryId?.trim()) {
      toast.error('Please select a product category')
      return false
    }

    if (!formData.selectedPaperStockSet?.trim()) {
      toast.error('Please select a paper stock set')
      return false
    }

    if (!formData.selectedQuantityGroup?.trim()) {
      toast.error('Please select a quantity group')
      return false
    }

    if (!formData.selectedSizeGroup?.trim()) {
      toast.error('Please select a size group')
      return false
    }

    if (loading) {
      toast.error('Please wait for data to load before submitting')
      return false
    }

    return true
  }

  const transformForSubmission = async () => {
    // Resolve addon set to individual addon IDs if needed
    let selectedAddOnIds: string[] = []
    if (formData.selectedAddOnSet) {
      try {
        const response = await fetch(`/api/addon-sets/${formData.selectedAddOnSet}`)
        if (response.ok) {
          const addOnSet = await response.json()
          selectedAddOnIds = addOnSet.addOnSetItems?.map((item: any) => item.addOnId) || []
        }
      } catch (error) {
        console.error('Failed to fetch addon set details:', error)
      }
    }

    return {
      name: formData.name,
      sku: formData.sku,
      categoryId: formData.categoryId,
      description: formData.description || null,
      shortDescription: null,
      isActive: formData.isActive,
      isFeatured: formData.isFeatured,
      paperStockSetId: formData.selectedPaperStockSet,
      quantityGroupId: formData.selectedQuantityGroup,
      sizeGroupId: formData.selectedSizeGroup,
      selectedAddOns: selectedAddOnIds,
      turnaroundTimeSetId: formData.selectedTurnaroundTimeSet,
      addOnSetId: formData.selectedAddOnSet,
      designSetId: formData.selectedDesignSet || null,
      productionTime: 3,
      rushAvailable: false,
      rushDays: null,
      rushFee: null,
      basePrice: 0,
      setupFee: 0,
      images: formData.images.map((image, index) => ({
        imageId: image.imageId || image.id,
        url: image.url,
        ...(image.thumbnailUrl && { thumbnailUrl: image.thumbnailUrl }),
        alt: image.alt || `${formData.name} product image ${index + 1}`,
        isPrimary: image.isPrimary !== false && index === 0, // First image is primary
        sortOrder: image.sortOrder ?? index,
        ...(image.width && { width: image.width }),
        ...(image.height && { height: image.height }),
        ...(image.fileSize && { fileSize: image.fileSize }),
        ...(image.mimeType && { mimeType: image.mimeType }),
      })),
    }
  }

  return {
    formData,
    options,
    loading,
    errors,
    updateFormData,
    fetchOptions,
    validateForm,
    transformForSubmission,
  }
}
