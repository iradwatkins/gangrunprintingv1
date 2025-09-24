/**
 * Utility functions
 */

  const fetchOptions = async () => {
    try {
      const [coatingsRes, sidesRes] = await Promise.all([
        fetch('/api/coating-options'),
        fetch('/api/sides-options'),
      ])

      if (coatingsRes.ok) {
        const coatingsData = await coatingsRes.json()
        setAllCoatingOptions(coatingsData)
      }

      if (sidesRes.ok) {
        const sidesData = await sidesRes.json()
        setAllSidesOptions(sidesData)
      }
    } catch (error) {
      }
  }

  const fetchPaperStocks = async () => {
    try {
      const response = await fetch('/api/paper-stocks')
      if (!response.ok) throw new Error('Failed to fetch paper stocks')

      const data = await response.json()

      // Transform API response to match our interface
      const transformedStocks = data.map((stock: Record<string, unknown>) => ({
        id: stock.id,
        name: stock.name,
        weight: stock.weight || 0.0015,
        pricePerSqInch: stock.pricePerSqInch || 0.0015,
        tooltipText: stock.tooltipText,
        isActive: stock.isActive,
        paperStockCoatings: stock.paperStockCoatings || [],
        paperStockSides: stock.paperStockSides || [],
        productsCount: stock.paperStockSetItems?.length || 0,
      }))

      setPaperStocks(transformedStocks)
    } catch (error) {
      toast.error('Failed to load paper stocks')
    } finally {
      setLoading(false)
    }
  }

      const url = editingStock ? `/api/paper-stocks/${editingStock.id}` : '/api/paper-stocks'
      const method = editingStock ? 'PUT' : 'POST'

      const payload = {
        name: formData.name,
        weight: formData.weight,
        pricePerSqInch: formData.pricePerSqInch,
        tooltipText: formData.tooltipText,
        isActive: formData.isActive,
        coatings: formData.selectedCoatings.map((coatingId) => ({
          id: coatingId,
          isDefault: coatingId === formData.defaultCoating,
        })),
        sidesOptions: formData.selectedSides.map((sidesId) => ({
          id: sidesId,
          multiplier: formData.sidesMultipliers[sidesId] || 1.0,
        })),
      }

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to save paper stock')
      }

      toast.success(editingStock ? 'Paper stock updated' : 'Paper stock created')
      setDialogOpen(false)
      resetForm()
      fetchPaperStocks()
    } catch (error) {
      toast.error(error.message)
    }
  }

    const selectedCoatings = stock.paperStockCoatings.map((pc) => pc.coatingId)
    const defaultCoating = stock.paperStockCoatings.find((pc) => pc.isDefault)?.coatingId || ''

    // Extract sides data and multipliers
    const selectedSides = stock.paperStockSides.map((ps) => ps.sidesOptionId)
    const sidesMultipliers = stock.paperStockSides.reduce(
      (acc, ps) => {
        acc[ps.sidesOptionId] = ps.priceMultiplier
        return acc
      },
      {} as Record<string, number>
    )

    setFormData({
      name: stock.name,
      weight: stock.weight,
      pricePerSqInch: stock.pricePerSqInch,
      tooltipText: stock.tooltipText || '',
      isActive: stock.isActive,
      selectedCoatings,
      defaultCoating,
      selectedSides,
      sidesMultipliers,
    })
    setDialogOpen(true)
  }

      const response = await fetch(`/api/paper-stocks/${deletingStock.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete paper stock')
      }

      toast.success('Paper stock deleted')
      setDeleteDialogOpen(false)
      setDeletingStock(null)
      fetchPaperStocks()
    } catch (error) {
      toast.error(error.message)
    }
  }

  const resetForm = () => {
    setEditingStock(null)
    setFormData({
      name: '',
      weight: 0.0015,
      pricePerSqInch: 0.0015,
      tooltipText: '',
      isActive: true,
      selectedCoatings: [],
      defaultCoating: '',
      selectedSides: [],
      sidesMultipliers: {},
    })
  }

  const openDeleteDialog = (stock: PaperStock) => {
    setDeletingStock(stock)
    setDeleteDialogOpen(true)
  }

    const selectedCoatings = stock.paperStockCoatings.map((pc) => pc.coatingId)
    const defaultCoating = stock.paperStockCoatings.find((pc) => pc.isDefault)?.coatingId || ''

    // Extract sides data and multipliers
    const selectedSides = stock.paperStockSides.map((ps) => ps.sidesOptionId)
    const sidesMultipliers = stock.paperStockSides.reduce(
      (acc, ps) => {
        acc[ps.sidesOptionId] = ps.priceMultiplier
        return acc
      },
      {} as Record<string, number>
    )

    setFormData({
      name: `${stock.name} - Copy`,
      weight: stock.weight,
      pricePerSqInch: stock.pricePerSqInch,
      tooltipText: stock.tooltipText || '',
      isActive: stock.isActive,
      selectedCoatings,
      defaultCoating,
      selectedSides,
      sidesMultipliers,
    })
    setDialogOpen(true)
  }

export { fetchOptions, coatingsData, sidesData, fetchPaperStocks, response, data, transformedStocks, url, method, payload, error, selectedCoatings, defaultCoating, selectedSides, sidesMultipliers, resetForm, openDeleteDialog };
