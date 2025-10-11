import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // First, delete any existing image upload add-ons
  await prisma.addOn.deleteMany({
    where: {
      OR: [{ id: 'addon_image_upload' }, { name: 'Image Upload' }],
    },
  })

  // Create the Image Upload add-on
  const imageUploadAddon = await prisma.addOn.create({
    data: {
      id: 'addon_image_upload',
      name: 'Image Upload',
      description: 'Upload additional images or files for your project (optional)',
      tooltipText:
        'Upload multiple additional images, logos, or files for your project. You can also skip this and email files later.',
      pricingModel: 'CUSTOM',
      configuration: {
        type: 'image_upload',
        maxFiles: 10,
        maxFileSize: 25, // MB
        acceptedFileTypes: [
          'image/jpeg',
          'image/png',
          'image/gif',
          'image/webp',
          'application/pdf',
          'application/postscript',
          'application/illustrator',
        ],
        allowDeferredUpload: true,
        pricing: {
          basePrice: 0, // Free service
          description: 'Free file upload service',
        },
        options: {
          upload_now: {
            id: 'upload_now',
            name: 'Upload Files Now',
            description: 'Upload your additional files immediately',
            tooltipText: 'Upload multiple images or files now. All uploads are free.',
            basePrice: 0,
            requiresFileUpload: true,
            fileUploadOptional: false,
          },
          upload_later: {
            id: 'upload_later',
            name: 'Will Email Files Later',
            description: 'Submit files after placing order',
            tooltipText: 'You can email us your additional files after placing the order',
            basePrice: 0,
            sendReminder: true,
            allowDeferredUpload: true,
          },
        },
        fileRequirements: {
          maxFiles: 10,
          maxFileSize: '25MB per file',
          formats: 'JPG, PNG, GIF, WebP, PDF, AI, EPS',
          note: 'All file uploads are free of charge',
        },
      },
      additionalTurnaroundDays: 0,
      sortOrder: 10,
      isActive: true,
      updatedAt: new Date(),
    },
  })

  console.log('Created Image Upload add-on:', imageUploadAddon.id)

  // Find or create an addon set for additional services
  let additionalServicesSet = await prisma.addOnSet.findFirst({
    where: { name: 'Additional Services' },
  })

  if (!additionalServicesSet) {
    additionalServicesSet = await prisma.addOnSet.create({
      data: {
        id: 'addon_set_additional_services',
        name: 'Additional Services',
        description: 'Optional additional services for your project',
        sortOrder: 5,
        isActive: true,
        updatedAt: new Date(),
      },
    })
    console.log('Created Additional Services addon set:', additionalServicesSet.id)
  }

  // Add the Image Upload add-on to the Additional Services set
  const addOnSetItem = await prisma.addOnSetItem.create({
    data: {
      id: 'image_upload_addon_set_item',
      addOnSetId: additionalServicesSet.id,
      addOnId: imageUploadAddon.id,
      displayPosition: 'IN_DROPDOWN',
      sortOrder: 1,
      isDefault: false,
      updatedAt: new Date(),
    },
  })

  console.log('Added Image Upload add-on to Additional Services set:', addOnSetItem.id)
}

main()
  .catch((e) => {
    console.error('Error seeding Image Upload add-on:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
