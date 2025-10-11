import { PrismaClient, PricingModel, DisplayPosition } from '@prisma/client'

const prisma = new PrismaClient()

export async function seedDesignAddons() {
  console.log('Seeding design add-ons...')

  const now = new Date()

  const designAddons = [
    {
      id: 'addon_upload_artwork',
      name: 'Upload My Artwork',
      description: 'Upload your own design files',
      tooltipText:
        'Upload your artwork now or email it to us later. Accepted formats: JPG, PNG, PDF, AI, EPS',
      pricingModel: PricingModel.FLAT,
      configuration: {
        basePrice: 0,
        requiresFileUpload: true,
        fileUploadOptional: true,
        allowDeferredUpload: true,
        acceptedFileTypes: [
          'image/jpeg',
          'image/png',
          'application/pdf',
          'application/postscript',
          'application/illustrator',
        ],
      },
      additionalTurnaroundDays: 0,
      sortOrder: 1,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'addon_standard_design',
      name: 'Standard Custom Design',
      description: 'Professional design service by our team',
      tooltipText: 'Our design team will create a custom design for your project',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        requiresSideSelection: true,
        sideOptions: {
          oneSide: { price: 90.0, label: 'One Side' },
          twoSides: { price: 135.0, label: 'Two Sides' },
        },
      },
      additionalTurnaroundDays: 2,
      sortOrder: 2,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'addon_rush_design',
      name: 'Rush Custom Design',
      description: 'Expedited professional design service',
      tooltipText: 'Priority design service with faster turnaround',
      pricingModel: PricingModel.CUSTOM,
      configuration: {
        requiresSideSelection: true,
        sideOptions: {
          oneSide: { price: 160.0, label: 'One Side' },
          twoSides: { price: 240.0, label: 'Two Sides' },
        },
      },
      additionalTurnaroundDays: 1,
      sortOrder: 3,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'addon_design_changes_minor',
      name: 'Design Changes - Minor',
      description: 'Small adjustments to existing design',
      tooltipText: 'Minor text changes, color adjustments, or small layout tweaks',
      pricingModel: PricingModel.FLAT,
      configuration: {
        basePrice: 22.5,
      },
      additionalTurnaroundDays: 1,
      sortOrder: 4,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'addon_design_changes_major',
      name: 'Design Changes - Major',
      description: 'Significant modifications to existing design',
      tooltipText: 'Major redesign elements, layout changes, or extensive revisions',
      pricingModel: PricingModel.FLAT,
      configuration: {
        basePrice: 45.0,
      },
      additionalTurnaroundDays: 2,
      sortOrder: 5,
      isActive: true,
      updatedAt: now,
    },
    {
      id: 'addon_upload_later',
      name: 'Will Upload Images Later',
      description: 'Submit artwork after placing order',
      tooltipText: 'You can email us your files after placing the order',
      pricingModel: PricingModel.FLAT,
      configuration: {
        basePrice: 0,
        allowDeferredUpload: true,
        sendReminder: true,
      },
      additionalTurnaroundDays: 0,
      sortOrder: 6,
      isActive: true,
      updatedAt: now,
    },
  ]

  for (const addon of designAddons) {
    await prisma.addOn.upsert({
      where: { id: addon.id },
      update: addon,
      create: addon,
    })
    console.log(`✓ Created/Updated addon: ${addon.name}`)
  }

  // Create sub-options for Standard and Rush Design
  const designWithSides = ['addon_standard_design', 'addon_rush_design']

  for (const addOnId of designWithSides) {
    const addon = designAddons.find((a) => a.id === addOnId)
    if (!addon) continue

    // Create side selection sub-option
    await prisma.addOnSubOption.upsert({
      where: {
        id: `${addOnId}_sides`,
      },
      update: {
        name: 'Design Sides',
        optionType: 'SELECT',
        options: {
          choices: [
            {
              value: 'oneSide',
              label: 'One Side',
              price: addon.configuration.sideOptions.oneSide.price,
            },
            {
              value: 'twoSides',
              label: 'Two Sides',
              price: addon.configuration.sideOptions.twoSides.price,
            },
          ],
        },
        isRequired: true,
        affectsPricing: true,
        tooltipText: 'Select how many sides you need designed',
        displayOrder: 1,
        updatedAt: now,
      },
      create: {
        id: `${addOnId}_sides`,
        addOnId: addOnId,
        name: 'Design Sides',
        optionType: 'SELECT',
        options: {
          choices: [
            {
              value: 'oneSide',
              label: 'One Side',
              price: addon.configuration.sideOptions.oneSide.price,
            },
            {
              value: 'twoSides',
              label: 'Two Sides',
              price: addon.configuration.sideOptions.twoSides.price,
            },
          ],
        },
        isRequired: true,
        affectsPricing: true,
        tooltipText: 'Select how many sides you need designed',
        displayOrder: 1,
        updatedAt: now,
      },
    })
    console.log(`✓ Created/Updated sub-option for: ${addon.name}`)
  }

  // Create a Design Add-On Set
  const designSetId = 'addonset_design_services'
  await prisma.addOnSet.upsert({
    where: { id: designSetId },
    update: {
      name: 'Design Services',
      description: 'Professional design and artwork options',
      sortOrder: 1,
      isActive: true,
      updatedAt: now,
    },
    create: {
      id: designSetId,
      name: 'Design Services',
      description: 'Professional design and artwork options',
      sortOrder: 1,
      isActive: true,
      updatedAt: now,
    },
  })
  console.log(`✓ Created/Updated addon set: Design Services`)

  // Add all design addons to the set
  for (let i = 0; i < designAddons.length; i++) {
    const addon = designAddons[i]
    await prisma.addOnSetItem.upsert({
      where: {
        addOnSetId_addOnId: {
          addOnSetId: designSetId,
          addOnId: addon.id,
        },
      },
      update: {
        displayPosition: DisplayPosition.ABOVE_DROPDOWN, // Design options show above main addon dropdown
        isDefault: false,
        sortOrder: i + 1,
        updatedAt: now,
      },
      create: {
        id: `${designSetId}_${addon.id}`,
        addOnSetId: designSetId,
        addOnId: addon.id,
        displayPosition: DisplayPosition.ABOVE_DROPDOWN,
        isDefault: false,
        sortOrder: i + 1,
        updatedAt: now,
      },
    })
  }
  console.log(`✓ Added all design addons to set`)

  console.log('✅ Design add-ons seeding complete!')
}

// Run if executed directly
if (require.main === module) {
  seedDesignAddons()
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
