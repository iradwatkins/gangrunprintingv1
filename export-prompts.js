#!/usr/bin/env node

/**
 * Export all Design Center prompts to JSON file
 * Usage: node export-prompts.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportPrompts() {
  try {
    console.log('🔍 Fetching all prompts from database...')

    // Fetch all prompt templates from the database
    const prompts = await prisma.promptTemplate.findMany({
      orderBy: [
        { isTemplate: 'desc' }, // Templates first
        { category: 'asc' },
        { name: 'asc' },
      ],
      include: {
        testImages: {
          select: {
            id: true,
            imageUrl: true,
            rating: true,
            createdAt: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 5, // Include last 5 test images per prompt
        },
      },
    })

    console.log(`✅ Found ${prompts.length} prompts`)

    // Format the export data
    const exportData = {
      exportDate: new Date().toISOString(),
      totalPrompts: prompts.length,
      templates: prompts.filter((p) => p.isTemplate).length,
      userPrompts: prompts.filter((p) => !p.isTemplate).length,
      prompts: prompts.map((prompt) => ({
        id: prompt.id,
        name: prompt.name,
        slug: prompt.slug,
        description: prompt.description,
        category: prompt.category,
        status: prompt.status,
        isTemplate: prompt.isTemplate,

        // Prompt content
        promptText: prompt.promptText,
        productType: prompt.productType,
        styleModifiers: prompt.styleModifiers,
        technicalSpecs: prompt.technicalSpecs,
        negativePrompt: prompt.negativePrompt,

        // Variables and modifiers
        variables: prompt.variables,
        selectedModifiers: prompt.selectedModifiers,

        // AI configuration
        aiProvider: prompt.aiProvider,
        aspectRatio: prompt.aspectRatio,
        referenceImages: prompt.referenceImages,

        // Metadata
        currentIteration: prompt.currentIteration,
        createdAt: prompt.createdAt,
        updatedAt: prompt.updatedAt,

        // Test images
        testImages: prompt.testImages,
      })),
    }

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `gangrun-prompts-export-${date}.json`
    const filepath = path.join(__dirname, filename)

    // Write to file
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2))

    console.log(`\n✅ Export complete!`)
    console.log(`📄 File saved: ${filename}`)
    console.log(`📊 Statistics:`)
    console.log(`   - Total prompts: ${exportData.totalPrompts}`)
    console.log(`   - Templates: ${exportData.templates}`)
    console.log(`   - User prompts: ${exportData.userPrompts}`)
    console.log(`\n🔗 Download link:`)
    console.log(`   scp root@72.60.28.175:${filepath} .`)

    return filepath
  } catch (error) {
    console.error('❌ Error exporting prompts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the export
exportPrompts()
  .then((filepath) => {
    console.log(`\n✨ Done! File is ready for download.`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to export prompts:', error)
    process.exit(1)
  })
