import { prisma } from '../src/lib/prisma'

async function addVariableDataAddOn() {
  try {
    // Check if Variable Data add-on already exists
    const existingAddOn = await prisma.addOn.findFirst({
      where: {
        name: 'Variable Data Printing'
      }
    })

    if (existingAddOn) {
      // Update existing add-on
      const updated = await prisma.addOn.update({
        where: { id: existingAddOn.id },
        data: {
          description: 'Personalized printing with unique names, numbers, or text on each piece',
          tooltipText: 'Select this option if you need your order to have a unique name, number, or word on each card.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'variable_data',
            basePrice: 60,
            pricePerPiece: 0.02,
            displayPrice: '$60.00 + $0.02/piece',
            conditionalFields: {
              locationsCount: {
                label: 'How many locations for the variables?',
                type: 'number',
                min: 1,
                max: 10,
                helpText: 'Enter the number of variables you are going to have on each piece. If only a first name for example, this number should be 1.',
                required: true
              },
              locationsInput: {
                label: 'Where are the locations for the variables?',
                type: 'dynamic_text',
                helpText: 'Enter the location(s) or word(s) that will be replaced with variable words.',
                placeholder: '[FirstName], [Number], [CustomText]',
                required: true
              }
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true
          },
          sortOrder: 13,
          isActive: true,
          adminNotes: 'Variable data printing with conditional fields and dynamic pricing'
        }
      })

    } else {
      // Create new add-on
      const newAddOn = await prisma.addOn.create({
        data: {
          name: 'Variable Data Printing',
          description: 'Personalized printing with unique names, numbers, or text on each piece',
          tooltipText: 'Select this option if you need your order to have a unique name, number, or word on each card.',
          pricingModel: 'CUSTOM',
          configuration: {
            type: 'variable_data',
            basePrice: 60,
            pricePerPiece: 0.02,
            displayPrice: '$60.00 + $0.02/piece',
            conditionalFields: {
              locationsCount: {
                label: 'How many locations for the variables?',
                type: 'number',
                min: 1,
                max: 10,
                helpText: 'Enter the number of variables you are going to have on each piece. If only a first name for example, this number should be 1.',
                required: true
              },
              locationsInput: {
                label: 'Where are the locations for the variables?',
                type: 'dynamic_text',
                helpText: 'Enter the location(s) or word(s) that will be replaced with variable words.',
                placeholder: '[FirstName], [Number], [CustomText]',
                required: true
              }
            },
            requiresCheckbox: true,
            showConditionalOnCheck: true
          },
          additionalTurnaroundDays: 1,
          sortOrder: 13,
          isActive: true,
          adminNotes: 'Variable data printing with conditional fields and dynamic pricing'
        }
      })

    }

    process.exit(0)
  } catch (error) {
    console.error('Error creating Variable Data add-on:', error)
    process.exit(1)
  }
}

addVariableDataAddOn()