import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createId } from '@paralleldrive/cuid2'

// POST /api/add-ons/[id]/duplicate
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    // Fetch the original add-on with sub-options
    const original = await prisma.addOn.findUnique({
      where: { id },
      include: {
        addOnSubOptions: {
          orderBy: {
            displayOrder: 'asc',
          },
        },
      },
    })

    if (!original) {
      return NextResponse.json({ error: 'Add-on not found' }, { status: 404 })
    }

    // Get count of existing copies to generate a unique name
    const existingCopies = await prisma.addOn.count({
      where: {
        name: {
          startsWith: `${original.name} (Copy`,
        },
      },
    })

    const copyNumber = existingCopies + 1
    const newName = `${original.name} (Copy ${copyNumber})`

    // Create the duplicated add-on with sub-options using transaction
    const duplicate = await prisma.$transaction(async (tx) => {
      // Create the new add-on
      const newAddOn = await tx.addOn.create({
        data: {
          id: createId(),
          name: newName,
          description: original.description,
          tooltipText: original.tooltipText,
          pricingModel: original.pricingModel,
          configuration: original.configuration,
          additionalTurnaroundDays: original.additionalTurnaroundDays,
          sortOrder: original.sortOrder + 1, // Place after original
          isActive: false, // Start as inactive to prevent conflicts
          adminNotes: original.adminNotes,
          updatedAt: new Date(),
        },
      })

      // Copy all add-on sub-options
      if (original.addOnSubOptions.length > 0) {
        await tx.addOnSubOption.createMany({
          data: original.addOnSubOptions.map((subOption) => ({
            id: createId(),
            addOnId: newAddOn.id,
            name: subOption.name,
            optionType: subOption.optionType,
            options: subOption.options,
            defaultValue: subOption.defaultValue,
            isRequired: subOption.isRequired,
            affectsPricing: subOption.affectsPricing,
            tooltipText: subOption.tooltipText,
            displayOrder: subOption.displayOrder,
            updatedAt: new Date(),
          })),
        })
      }

      // Return the complete duplicated add-on
      return await tx.addOn.findUnique({
        where: { id: newAddOn.id },
        include: {
          addOnSubOptions: {
            orderBy: {
              displayOrder: 'asc',
            },
          },
        },
      })
    })

    return NextResponse.json({
      message: 'Add-on duplicated successfully',
      addOn: duplicate,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to duplicate add-on' }, { status: 500 })
  }
}
