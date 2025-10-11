import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Creating Design addon...')

  // Create the Design addon
  const designAddon = await prisma.addOn.create({
    data: {
      name: 'Design',
      description: 'Please select the design option you would like.',
      tooltipText: 'Please select the design option you would like.',
      pricingModel: 'CUSTOM',
      configuration: {
        type: 'design',
        requiresFileUpload: true,
        defaultOption: 'Upload My Artwork',
        designEmail: 'design@gangrunprinting.com',
        options: [
          {
            id: 'upload-artwork',
            name: 'Upload My Artwork',
            price: 0,
            requiresUpload: true,
            requiresSides: false,
          },
          {
            id: 'standard-design',
            name: 'Standard Custom Design',
            pricing: {
              oneSide: 90,
              twoSides: 135,
            },
            requiresUpload: false,
            requiresSides: true,
            requiresEmail: true,
          },
          {
            id: 'rush-design',
            name: 'Rush Custom Design',
            pricing: {
              oneSide: 160,
              twoSides: 240,
            },
            requiresUpload: false,
            requiresSides: true,
            requiresEmail: true,
          },
          {
            id: 'minor-changes',
            name: 'Design Changes - Minor',
            price: 22.5,
            requiresUpload: true,
            requiresSides: false,
          },
          {
            id: 'major-changes',
            name: 'Design Changes - Major',
            price: 45,
            requiresUpload: true,
            requiresSides: false,
          },
        ],
      },
      additionalTurnaroundDays: 0,
      sortOrder: 20,
      isActive: true,
    },
  })

  console.log('✅ Design addon created:', designAddon.id)

  // No sub-options needed - the design type selection will be handled in the UI
  // The pricing calculation will be done based on the selected design option

  console.log('\n📋 Design Addon Summary:')
  console.log('- Upload My Artwork: FREE')
  console.log('- Standard Custom Design: $90 (1-side) / $135 (2-sides)')
  console.log('- Rush Custom Design: $160 (1-side) / $240 (2-sides)')
  console.log('- Design Changes - Minor: $22.50')
  console.log('- Design Changes - Major: $45.00')
}

main()
  .catch((e) => {
    console.error('Error creating Design addon:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
