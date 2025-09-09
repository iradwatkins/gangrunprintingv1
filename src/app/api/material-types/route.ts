import { type NextRequest, NextResponse } from 'next/server'

// Mock Material Types API since the model doesn't exist in the current database
const materialTypes = [
  { id: '1', name: 'Paper', description: 'All paper-based materials', sortOrder: 0, isActive: true, _count: { products: 0 } },
  { id: '2', name: 'Vinyl', description: 'Vinyl and plastic materials', sortOrder: 1, isActive: true, _count: { products: 0 } },
  { id: '3', name: 'Canvas', description: 'Canvas materials', sortOrder: 2, isActive: true, _count: { products: 0 } }
]

export async function GET() {
  try {
    return NextResponse.json(materialTypes)
  } catch (error) {
    console.error('Error fetching material types:', error)
    return NextResponse.json(
      { error: 'Failed to fetch material types' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, sortOrder, isActive } = body

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      )
    }

    // Check if name already exists
    if (materialTypes.some(mt => mt.name === name)) {
      return NextResponse.json(
        { error: 'A material type with this name already exists' },
        { status: 400 }
      )
    }

    const newMaterialType = {
      id: Date.now().toString(),
      name,
      description,
      sortOrder: sortOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
      _count: { products: 0 }
    }

    materialTypes.push(newMaterialType)
    
    return NextResponse.json(newMaterialType, { status: 201 })
  } catch (error: any) {
    console.error('Error creating material type:', error)
    return NextResponse.json(
      { error: 'Failed to create material type' },
      { status: 500 }
    )
  }
}