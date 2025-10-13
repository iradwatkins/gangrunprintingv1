import { PrismaClient, DesignPricingType } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedDesignOptions() {
  console.log('Seeding design options...')

  const now = new Date()

  // 1. Create DesignOption records
  const designOptions = [
    {
      id: 'design_upload_own',
      name: 'Upload Your Own Artwork',
      code: 'upload_own',
      description: 'Upload your own design files - no charge',
      tooltipText: 'Upload your artwork now or email it to us later. Accepted formats: JPG, PNG, PDF, AI, EPS',
      pricingType: DesignPricingType.FREE,
      requiresSideSelection: false,
      sideOnePrice: null,
      sideTwoPrice: null,
      basePrice: 0,
      sortOrder: 1,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'design_standard',
      name: 'Standard Custom Design',
      code: 'standard_design',
      description: 'Professional design service by our team',
      tooltipText: 'Our design team will create a custom design for your project (2-3 business days)',
      pricingType: DesignPricingType.SIDE_BASED,
      requiresSideSelection: true,
      sideOnePrice: 75.0,
      sideTwoPrice: 120.0,
      basePrice: 0,
      sortOrder: 2,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'design_rush',
      name: 'Rush Custom Design',
      code: 'rush_design',
      description: 'Expedited professional design service',
      tooltipText: 'Priority design service with faster turnaround (1 business day)',
      pricingType: DesignPricingType.SIDE_BASED,
      requiresSideSelection: true,
      sideOnePrice: 125.0,
      sideTwoPrice: 200.0,
      basePrice: 0,
      sortOrder: 3,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'design_minor_changes',
      name: 'Design Changes - Minor',
      code: 'minor_changes',
      description: 'Small adjustments to existing design',
      tooltipText: 'Minor text changes, color adjustments, or small layout tweaks',
      pricingType: DesignPricingType.FLAT,
      requiresSideSelection: false,
      sideOnePrice: null,
      sideTwoPrice: null,
      basePrice: 25.0,
      sortOrder: 4,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'design_major_changes',
      name: 'Design Changes - Major',
      code: 'major_changes',
      description: 'Significant modifications to existing design',
      tooltipText: 'Major redesign elements, layout changes, or extensive revisions',
      pricingType: DesignPricingType.FLAT,
      requiresSideSelection: false,
      sideOnePrice: null,
      sideTwoPrice: null,
      basePrice: 75.0,
      sortOrder: 5,
      isActive: true,
      updatedAt: now,
    },
  ]

  for (const option of designOptions) {
    await prisma.designOption.upsert({
      where: { id: option.id },
      update: option,
      create: option,
    })
    console.log(`✓ Created/Updated design option: ${option.name}`)
  }

  // 2. Create DesignSet (container for design options)
  const designSetId = 'designset_standard'
  await prisma.designSet.upsert({
    where: { id: designSetId },
    update: {
      name: 'Standard Design Set',
      description: 'Standard design options for most products',
      sortOrder: 1,
      isActive: true,
      updatedAt: now,
    },
    create: {
      id: designSetId,
      name: 'Standard Design Set',
      description: 'Standard design options for most products',
      sortOrder: 1,
      isActive: true,
      updatedAt: now,
    },
  })
  console.log(`✓ Created/Updated design set: Standard Design Set`)

  // 3. Create DesignSetItem records (link options to set)
  for (let i = 0; i < designOptions.length; i++) {
    const option = designOptions[i]
    await prisma.designSetItem.upsert({
      where: {
        designSetId_designOptionId: {
          designSetId: designSetId,
          designOptionId: option.id,
        },
      },
      update: {
        isDefault: i === 0, // First option (upload_own) is default
        sortOrder: i + 1,
        updatedAt: now,
      },
      create: {
        id: `${designSetId}_${option.id}`,
        designSetId: designSetId,
        designOptionId: option.id,
        isDefault: i === 0,
        sortOrder: i + 1,
        updatedAt: now,
      },
    })
  }
  console.log(`✓ Added all design options to set`)

  console.log('✅ Design options seeding complete!')
  console.log('')
  console.log('Summary:')
  console.log('  - 5 design options created')
  console.log('  - 1 design set created')
  console.log('  - 5 design set items created')
  console.log('')
  console.log('Next steps:')
  console.log('  1. Run migration: npx prisma migrate dev --name add-design-system')
  console.log('  2. Assign design set to products in admin')
}

// Run if executed directly
if (require.main === module) {
  seedDesignOptions()
    .then(() => {
      console.log('Seeding completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Seeding failed:', error)
      process.exit(1)
    })
    .finally(async () => {
      await prisma.$disconnect()
    })
}
