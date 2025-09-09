import { type NextRequest, NextResponse } from 'next/server'

// Import the mock data from the parent route
const materialTypes = [
  { id: '1', name: 'Paper', description: 'All paper-based materials', sortOrder: 0, isActive: true, _count: { products: 0 } },
  { id: '2', name: 'Vinyl', description: 'Vinyl and plastic materials', sortOrder: 1, isActive: true, _count: { products: 0 } },
  { id: '3', name: 'Canvas', description: 'Canvas materials', sortOrder: 2, isActive: true, _count: { products: 0 } }
]

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const { id } = await params
    const materialType = materialTypes.find(mt => mt.id === id)

    if (!materialType) {
      return NextResponse.json(
        { error: 'Material type not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(materialType)
  } catch (error) {
    console.error('Error fetching material type:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material type' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
        const { id } = await params
    const body = await request.json()
    const { name, description, sortOrder, isActive } = body

    const index = materialTypes.findIndex(mt => mt.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Material type not found' },
        { status: 404 }
      )
    }

    // Check if name already exists (excluding current item)
    if (name && materialTypes.some(mt => mt.name === name && mt.id !== id)) {
      return NextResponse.json(
        { error: 'A material type with this name already exists' },
        { status: 400 }
      )
    }

    materialTypes[index] = {
      ...materialTypes[index],
      ...(name !== undefined && { name }),
      ...(description !== undefined && { description }),
      ...(sortOrder !== undefined && { sortOrder }),
      ...(isActive !== undefined && { isActive })
    }

    return NextResponse.json(materialTypes[index])
  } catch (error: any) {
    console.error('Error updating material type:', error)
    return NextResponse.json(
      { error: 'Failed to update material type' },
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
    const index = materialTypes.findIndex(mt => mt.id === id)
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Material type not found' },
        { status: 404 }
      )
    }

    // Check if material type is being used
    if (materialTypes[index]._count.products > 0) {
      return NextResponse.json(
        { error: `Cannot delete material type. ${materialTypes[index]._count.products} products are using it.` },
        { status: 400 }
      )
    }

    materialTypes.splice(index, 1)

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting material type:', error)
    return NextResponse.json(
      { error: 'Failed to delete material type' },
      { status: 500 }
    )
  }
}