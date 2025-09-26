import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, delete any existing design-related add-ons
  await prisma.addOn.deleteMany({
    where: {
      OR: [
        { id: 'addon_design' },
        { id: 'addon_upload_artwork' },
        { id: 'addon_standard_design' },
        { id: 'addon_rush_design' },
        { id: 'addon_design_changes_minor' },
        { id: 'addon_design_changes_major' },
        { id: 'addon_upload_later' },
        { name: 'Design Services' }
      ]
    }
  })

  // Create the single Design add-on with comprehensive configuration
  const designAddon = await prisma.addOn.create({
    data: {
      id: 'addon_design',
      name: 'Design',
      description: 'Design service options including artwork upload, custom design, and design changes',
      tooltipText: 'Choose from various design service options for your project',
      pricingModel: 'CUSTOM',
      configuration: {
        type: 'design',
        options: {
          upload_artwork: {
            id: 'upload_artwork',
            name: 'Upload My Artwork',
            description: 'Upload your own design files',
            tooltipText: 'Upload your artwork now or email it to us later. Accepted formats: JPG, PNG, PDF, AI, EPS',
            basePrice: 0,
            requiresFileUpload: true,
            fileUploadOptional: true,
            allowDeferredUpload: true,
            acceptedFileTypes: ['image/jpeg', 'image/png', 'application/pdf', 'application/postscript', 'application/illustrator']
          },
          standard_design: {
            id: 'standard_design',
            name: 'Standard Custom Design',
            description: 'Professional design service by our team',
            tooltipText: 'Our design team will create a custom design for your project',
            requiresSideSelection: true,
            sideOptions: {
              oneSide: {
                label: 'One Side',
                price: 90
              },
              twoSides: {
                label: 'Two Sides',
                price: 135
              }
            },
            additionalTurnaroundDays: 2
          },
          rush_design: {
            id: 'rush_design',
            name: 'Rush Custom Design',
            description: 'Expedited professional design service',
            tooltipText: 'Priority design service with faster turnaround',
            requiresSideSelection: true,
            sideOptions: {
              oneSide: {
                label: 'One Side',
                price: 160
              },
              twoSides: {
                label: 'Two Sides',
                price: 240
              }
            },
            additionalTurnaroundDays: 1
          },
          minor_changes: {
            id: 'minor_changes',
            name: 'Design Changes - Minor',
            description: 'Small adjustments to existing design',
            tooltipText: 'Minor text changes, color adjustments, or small layout tweaks',
            basePrice: 22.5,
            additionalTurnaroundDays: 1
          },
          major_changes: {
            id: 'major_changes',
            name: 'Design Changes - Major',
            description: 'Significant modifications to existing design',
            tooltipText: 'Major redesign elements, layout changes, or extensive revisions',
            basePrice: 45,
            additionalTurnaroundDays: 2
          },
          upload_later: {
            id: 'upload_later',
            name: 'Will Upload Images Later',
            description: 'Submit artwork after placing order',
            tooltipText: 'You can email us your files after placing the order',
            basePrice: 0,
            sendReminder: true,
            allowDeferredUpload: true
          }
        }
      },
      additionalTurnaroundDays: 0,
      sortOrder: 0,
      isActive: true,
      updatedAt: new Date()
    }
  })

  console.log('Created Design add-on:', designAddon.id)

  // Add the Design add-on to the Design Services addon set
  const designServiceSet = await prisma.addOnSet.findFirst({
    where: { name: 'Design Services' }
  })

  if (designServiceSet) {
    // First, remove any existing items from the set
    await prisma.addOnSetItem.deleteMany({
      where: { addOnSetId: designServiceSet.id }
    })

    // Add the new Design add-on to the set
    const addOnSetItem = await prisma.addOnSetItem.create({
      data: {
        id: 'design_addon_set_item',
        addOnSetId: designServiceSet.id,
        addOnId: designAddon.id,
        displayPosition: 'IN_DROPDOWN',
        sortOrder: 1,
        isDefault: false,
        updatedAt: new Date()
      }
    })

    console.log('Added Design add-on to Design Services set:', addOnSetItem.id)
  } else {
    console.log('Design Services addon set not found')
  }
}

main()
  .catch((e) => {
    console.error('Error seeding Design add-on:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })