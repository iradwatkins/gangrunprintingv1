import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/add-ons/[id] - Get a single add-on
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const addOn = await prisma.addOn.findUnique({
      where: { id },
      include: {
        addOnSubOptions: {
          orderBy: { displayOrder: 'asc' },
        },
        productAddOns: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                slug: true,
              },
            },
          },
        },
      },
    })

    if (!addOn) {
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 })
    }

    return NextResponse.json(addOn)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch add-on' }, { status: 500 })
  }
}

// PUT /api/add-ons/[id] - Update an add-on
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const {
      name,
      description,
      tooltipText,
      pricingModel,
      configuration,
      additionalTurnaroundDays,
      sortOrder,
      isActive,
      adminNotes,
      subOptions,
    } = body

    // Update add-on
    const addOn = await prisma.addOn.update({
      where: { id },
      data: {
        name,
        description,
        tooltipText,
        pricingModel,
        configuration,
        additionalTurnaroundDays,
        sortOrder,
        isActive,
        adminNotes,
      },
    })

    // Handle sub-options update if provided
    if (subOptions !== undefined) {
      // Delete existing sub-options
      await prisma.addOnSubOption.deleteMany({
        where: { addOnId: id },
      })

      // Create new sub-options
      if (subOptions.length > 0) {
        await prisma.addOnSubOption.createMany({
          data: subOptions.map((option: any) => ({
            addOnId: id,
            name: option.name,
            optionType: option.optionType,
            options: option.options || null,
            defaultValue: option.defaultValue,
            isRequired: option.isRequired || false,
            affectsPricing: option.affectsPricing || false,
            tooltipText: option.tooltipText,
            displayOrder: option.displayOrder || 0,
          })),
        })
      }
    }

    // Fetch updated add-on with sub-options
    const updatedAddOn = await prisma.addOn.findUnique({
      where: { id },
      include: {
        addOnSubOptions: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    })

    return NextResponse.json(updatedAddOn)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update add-on' }, { status: 500 })
  }
}

// PATCH /api/add-ons/[id] - Partially update an add-on (e.g., toggle isActive)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    // Only update the fields provided in the request body
    const addOn = await prisma.addOn.update({
      where: { id },
      data: body,
    })

    return NextResponse.json(addOn)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update add-on' }, { status: 500 })
  }
}

// DELETE /api/add-ons/[id] - Delete an add-on (soft delete by setting isActive to false)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    // Check if add-on is in use by any products
    const productCount = await prisma.productAddOn.count({
      where: { addOnId: id },
    })

    if (productCount > 0) {
      // Soft delete - just deactivate
      const addOn = await prisma.addOn.update({
        where: { id },
        data: { isActive: false },
      })

      return NextResponse.json({
        message: 'Add-on deactivated (in use by products)',
        addOn,
      })
    }

    // Hard delete if not in use
    await prisma.addOn.delete({
      where: { id },
    })

    return NextResponse.json({ message: 'Add-on deleted successfully' })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete add-on' }, { status: 500 })
  }
}
