import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createQRCodeAddon() {
  try {
    console.log('📱 Creating QR Code addon...\n')

    // Create the addon with FLAT pricing ($5.00)
    const addon = await prisma.addOn.create({
      data: {
        name: 'QR Code',
        description: 'Add a QR code to your print products for easy mobile scanning.',
        tooltipText:
          '$5.00 - Use a QR code for scanning with a mobile device. This can be used to share a URL, text, email, phone, sms, vcard, location, etc. Please attach your own QR code or enter the contents you would like encoded to your QR code.',
        pricingModel: 'FLAT',
        configuration: {
          flatFee: 5.0,
        },
        additionalTurnaroundDays: 0,
        sortOrder: 105,
        isActive: true,
        adminNotes:
          'QR Code flat fee: $5.00 regardless of quantity. Customer provides content or uploads their own QR code.',
      },
    })

    console.log('✅ QR Code addon created successfully:')
    console.log(JSON.stringify(addon, null, 2))

    // Create Code Content sub-option
    const codeContentSubOption = await prisma.addOnSubOption.create({
      data: {
        addOnId: addon.id,
        name: 'Code Content',
        optionType: 'TEXT',
        options: null,
        defaultValue: '',
        isRequired: false,
        affectsPricing: false,
        tooltipText:
          'Please enter your QR code content here or if you are attaching your own QR code, please note that here.',
        displayOrder: 0,
      },
    })

    console.log('\n✅ Code Content sub-option created')

    // Find all addon sets to associate with
    const addonSets = await prisma.addOnSet.findMany({
      where: {
        isActive: true,
      },
    })

    console.log(`\n📦 Found ${addonSets.length} addon sets`)

    // Associate with each addon set
    for (const set of addonSets) {
      try {
        const setItem = await prisma.addOnSetItem.create({
          data: {
            addOnSetId: set.id,
            addOnId: addon.id,
            displayPosition: 'IN_DROPDOWN',
            isDefault: false,
            sortOrder: 105,
          },
        })
        console.log(`   ✅ Associated with: ${set.name}`)
      } catch (error: any) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  Already associated with: ${set.name}`)
        } else {
          console.log(`   ❌ Failed to associate with: ${set.name}`)
        }
      }
    }

    console.log('\n✅ QR Code addon setup complete!')
    console.log('\n📋 Pricing:')
    console.log('   Flat Fee: $5.00 (same price for any quantity)')
    console.log('\n💡 QR Code can encode:')
    console.log('   • URLs (website links)')
    console.log('   • Text messages')
    console.log('   • Email addresses')
    console.log('   • Phone numbers')
    console.log('   • SMS messages')
    console.log('   • vCards (contact information)')
    console.log('   • Geographic locations')
    console.log('   • And more...')
  } catch (error) {
    console.error('❌ Error creating QR Code addon:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createQRCodeAddon()
