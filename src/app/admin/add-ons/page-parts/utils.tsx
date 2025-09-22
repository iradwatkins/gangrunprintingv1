/**
 * Utility functions
 */

const pricingModelIcons = {
  FLAT: <DollarSign className="h-4 w-4" />,
  PERCENTAGE: <Percent className="h-4 w-4" />,
  PER_UNIT: <Package className="h-4 w-4" />,
  CUSTOM: <Settings className="h-4 w-4" />,
}

const pricingModelLabels = {
  FLAT: 'Flat Fee',
  PERCENTAGE: 'Percentage',
  PER_UNIT: 'Per Unit',
  CUSTOM: 'Custom',
}

export default function AddOnsPage() {
  const fetchAddOns = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/add-ons')
      if (!response.ok) throw new Error('Failed to fetch')
      const rawData = await response.json()

      )

      // Handle both formats: direct array or { data: array }
      let data = rawData
      if (rawData && typeof rawData === 'object' && 'data' in rawData) {
        data = rawData.data
      }

      )

      // Ensure data is always an array
      setAddOns(Array.isArray(data) ? data : [])
    } catch (error) {
      toast.error('Failed to fetch add-ons')
      setAddOns([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

      const url = editingAddOn ? `/api/add-ons/${editingAddOn.id}` : '/api/add-ons'

      const method = editingAddOn ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description || null,
          tooltipText: formData.tooltipText || null,
          pricingModel: formData.pricingModel,
          configuration,
          additionalTurnaroundDays: formData.additionalTurnaroundDays,
          sortOrder: formData.sortOrder,
          isActive: formData.isActive,
          adminNotes: formData.adminNotes || null,
        }),
      })

      if (response.ok) {
        toast.success(editingAddOn ? 'Add-on updated successfully' : 'Add-on created successfully')
        setDialogOpen(false)
        resetForm()
        fetchAddOns()
      } else {
        const error = await response.json()
        throw new Error(error.details || 'Failed to save add-on')
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save add-on')
    } finally {
      setSaving(false)
    }
  }

      const response = await fetch(`/api/add-ons/${addOnToDelete.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success('Add-on deleted successfully')
        setDeleteDialogOpen(false)
        setAddOnToDelete(null)
        fetchAddOns()
      } else {
        throw new Error('Failed to delete add-on')
      }
    } catch (error) {
      toast.error('Failed to delete add-on')
    }
  }

      const response = await fetch(`/api/add-ons/${addOn.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !addOn.isActive }),
      })

      if (response.ok) {
        toast.success(`Add-on ${!addOn.isActive ? 'activated' : 'deactivated'} successfully`)
        fetchAddOns()
      } else {
        throw new Error('Failed to update add-on status')
      }
    } catch (error) {
      toast.error('Failed to update add-on status')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      tooltipText: '',
      pricingModel: 'FLAT',
      additionalTurnaroundDays: 0,
      sortOrder: 0,
      isActive: true,
      adminNotes: '',
      flatPrice: 0,
      percentage: 0,
      percentageAppliesTo: 'base_price',
      pricePerUnit: 0,
      unitName: 'piece',
      customConfig: '{}',
    })
    setEditingAddOn(null)
  }

  const openEditDialog = (addOn: AddOn) => {
    setEditingAddOn(addOn)

    // Parse configuration based on pricing model
    let flatPrice = 0
    let percentage = 0
    let percentageAppliesTo = 'base_price'
    let pricePerUnit = 0
    let unitName = 'piece'
    let customConfig = '{}'

    if (addOn.pricingModel === 'FLAT') {
      flatPrice = addOn.configuration.price || 0
    } else if (addOn.pricingModel === 'PERCENTAGE') {
      percentage = addOn.configuration.percentage || 0
      percentageAppliesTo = addOn.configuration.appliesTo || 'base_price'
    } else if (addOn.pricingModel === 'PER_UNIT') {
      pricePerUnit = addOn.configuration.pricePerUnit || 0
      unitName = addOn.configuration.unitName || 'piece'
    } else {
      customConfig = JSON.stringify(addOn.configuration, null, 2)
    }

    setFormData({
      name: addOn.name,
      description: addOn.description || '',
      tooltipText: addOn.tooltipText || '',
      pricingModel: addOn.pricingModel,
      additionalTurnaroundDays: addOn.additionalTurnaroundDays,
      sortOrder: addOn.sortOrder,
      isActive: addOn.isActive,
      adminNotes: addOn.adminNotes || '',
      flatPrice,
      percentage,
      percentageAppliesTo,
      pricePerUnit,
      unitName,
      customConfig,
    })
    setDialogOpen(true)
  }

  const openDeleteDialog = (addOn: AddOn) => {
    setAddOnToDelete(addOn)
    setDeleteDialogOpen(true)
  }

  const filteredAddOns = Array.isArray(addOns)
    ? addOns.filter(
        (addOn) =>
          addOn.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          addOn.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const formatPriceDisplay = (addOn: AddOn) => {
    const config = addOn.configuration as any
    switch (addOn.pricingModel) {
      case 'FLAT':
        return config.price ? `$${config.price.toFixed(2)}` : '-'
      case 'PERCENTAGE':
        return config.percentage ? `${config.percentage}%` : '-'
      case 'PER_UNIT':
        return config.pricePerUnit ? `$${config.pricePerUnit}/${config.unitName || 'unit'}` : '-'
      case 'CUSTOM':
        if (config.setupFee && config.pricePerPiece) {
          return `$${config.setupFee} + $${config.pricePerPiece}/pc`
        }
        return 'Variable'
      default:
        return '-'
    }
  }


export { pricingModelIcons, pricingModelLabels, AddOnsPage, fetchAddOns, response, rawData, url, method, error, resetForm, openEditDialog, openDeleteDialog, filteredAddOns, formatPriceDisplay, config };