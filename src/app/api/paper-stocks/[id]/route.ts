import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@clerk/nextjs/server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const { id } = await params
    // Temporarily skip auth check
    // const session = await auth()
    // if (!session?.user || (session.user as any).role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    const body = await request.json()
    const { 
      name, 
      basePrice, 
      shippingWeight, 
      isActive,
      coatings,
      sidesOptions,
      defaultCoating,
      defaultSides
    } = body

    // Update paper stock and relationships in a transaction
    const paperStock = await prisma.$transaction(async (tx) => {
      // Delete existing relationships
      await tx.paperStockCoating.deleteMany({
        where: { paperStockId: id }
      })
      await tx.paperStockSides.deleteMany({
        where: { paperStockId: id }
      })

      // Update paper stock with new relationships
      return await tx.paperStock.update({
        where: { id },
        data: {
          name,
          weight: `${Math.round(shippingWeight * 100)}lb`,
          finish: 'Custom',
          coating: 'Custom',
          sides: 'Custom',
          costPerSheet: basePrice / 0.00001,
          thickness: shippingWeight,
          isActive: isActive !== undefined ? isActive : true,
          // Add new coating relationships
          paperStockCoatings: {
            create: coatings
              .filter((c: any) => c.enabled)
              .map((c: any) => ({
                coatingId: c.id,
                isDefault: c.id === defaultCoating
              }))
          },
          // Add new sides relationships
          paperStockSides: {
            create: sidesOptions
              .filter((s: any) => s.enabled)
              .map((s: any) => ({
                sidesOptionId: s.id,
                priceMultiplier: s.multiplier || 1.0,
                isEnabled: true
              }))
          }
        },
        include: {
          paperStockCoatings: {
            include: { coating: true }
          },
          paperStockSides: {
            include: { sidesOption: true }
          }
        }
      })
    })

    return NextResponse.json(paperStock)
  } catch (error: any) {
    console.error('Error updating paper stock:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Paper stock not found' },
        { status: 404 }
      )
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A paper stock with this name already exists' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to update paper stock' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const { id } = await params
    // Temporarily skip auth check
    // const session = await auth()
    // if (!session?.user || (session.user as any).role !== 'ADMIN') {
    //   return NextResponse.json(
    //     { error: 'Unauthorized' },
    //     { status: 401 }
    //   )
    // }

    // Check if paper stock is being used by products
    const productsCount = await prisma.productPaperStock.count({
      where: { paperStockId: id }
    })

    if (productsCount > 0) {
      return NextResponse.json(
        { error: `Cannot delete paper stock. ${productsCount} products are using it.` },
        { status: 400 }
      )
    }

    // Delete paper stock (relationships will cascade delete)
    await prisma.paperStock.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting paper stock:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Paper stock not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to delete paper stock' },
      { status: 500 }
    )
  }
}