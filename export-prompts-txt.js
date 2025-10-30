#!/usr/bin/env node

/**
 * Export all Design Center prompts to readable text file
 * Usage: node export-prompts-txt.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

function formatPrompt(prompt, index) {
  const lines = []

  lines.push('='.repeat(80))
  lines.push(`PROMPT #${index + 1}: ${prompt.name}`)
  lines.push('='.repeat(80))
  lines.push('')

  // Basic Info
  lines.push(`ID: ${prompt.id}`)
  lines.push(`Slug: ${prompt.slug}`)
  lines.push(`Type: ${prompt.isTemplate ? 'TEMPLATE' : 'USER PROMPT'}`)
  lines.push(`Category: ${prompt.category}`)
  lines.push(`Status: ${prompt.status}`)
  lines.push(`Product Type: ${prompt.productType || 'N/A'}`)
  lines.push(`AI Provider: ${prompt.aiProvider}`)
  lines.push(`Aspect Ratio: ${prompt.aspectRatio}`)
  lines.push(`Iteration: ${prompt.currentIteration}`)
  lines.push(`Created: ${new Date(prompt.createdAt).toLocaleString()}`)
  lines.push(`Updated: ${new Date(prompt.updatedAt).toLocaleString()}`)
  lines.push('')

  // Description
  if (prompt.description) {
    lines.push('DESCRIPTION:')
    lines.push(prompt.description)
    lines.push('')
  }

  // Main Prompt
  lines.push('MAIN PROMPT TEXT:')
  lines.push('-'.repeat(80))
  lines.push(prompt.promptText)
  lines.push('-'.repeat(80))
  lines.push('')

  // Style Modifiers
  if (prompt.styleModifiers) {
    lines.push('STYLE MODIFIERS:')
    lines.push(prompt.styleModifiers)
    lines.push('')
  }

  // Technical Specs
  if (prompt.technicalSpecs) {
    lines.push('TECHNICAL SPECIFICATIONS:')
    lines.push(prompt.technicalSpecs)
    lines.push('')
  }

  // Negative Prompt
  if (prompt.negativePrompt) {
    lines.push('NEGATIVE PROMPT (What to avoid):')
    lines.push(prompt.negativePrompt)
    lines.push('')
  }

  // Variables
  if (prompt.variables) {
    lines.push('VARIABLES:')
    lines.push(JSON.stringify(prompt.variables, null, 2))
    lines.push('')
  }

  // Selected Modifiers
  if (prompt.selectedModifiers) {
    lines.push('SELECTED MODIFIERS:')
    lines.push(JSON.stringify(prompt.selectedModifiers, null, 2))
    lines.push('')
  }

  // Reference Images
  if (prompt.referenceImages && Array.isArray(prompt.referenceImages) && prompt.referenceImages.length > 0) {
    lines.push('REFERENCE IMAGES:')
    prompt.referenceImages.forEach((img, i) => {
      lines.push(`  ${i + 1}. ${img}`)
    })
    lines.push('')
  }

  // Test Images
  if (prompt.testImages && prompt.testImages.length > 0) {
    lines.push(`TEST IMAGES (${prompt.testImages.length} generated):`)
    prompt.testImages.forEach((img, i) => {
      lines.push(`  ${i + 1}. ${img.imageUrl} - Rating: ${img.rating || 'Not rated'} - ${new Date(img.createdAt).toLocaleString()}`)
    })
    lines.push('')
  }

  lines.push('')
  lines.push('')

  return lines.join('\n')
}

async function exportPromptsToText() {
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
          take: 5,
        },
      },
    })

    console.log(`✅ Found ${prompts.length} prompts`)

    // Build text content
    const lines = []

    // Header
    lines.push('╔' + '═'.repeat(78) + '╗')
    lines.push('║' + ' '.repeat(78) + '║')
    lines.push('║' + '        GANGRUN PRINTING - DESIGN CENTER PROMPTS EXPORT'.padEnd(78) + '║')
    lines.push('║' + ' '.repeat(78) + '║')
    lines.push('╚' + '═'.repeat(78) + '╝')
    lines.push('')
    lines.push(`Export Date: ${new Date().toLocaleString()}`)
    lines.push(`Total Prompts: ${prompts.length}`)
    lines.push(`Templates: ${prompts.filter(p => p.isTemplate).length}`)
    lines.push(`User Prompts: ${prompts.filter(p => !p.isTemplate).length}`)
    lines.push('')
    lines.push('')

    // Templates Section
    const templates = prompts.filter(p => p.isTemplate)
    if (templates.length > 0) {
      lines.push('╔' + '═'.repeat(78) + '╗')
      lines.push('║' + `  TEMPLATES (${templates.length})`.padEnd(78) + '║')
      lines.push('╚' + '═'.repeat(78) + '╝')
      lines.push('')
      templates.forEach((prompt, index) => {
        lines.push(formatPrompt(prompt, index))
      })
    }

    // User Prompts Section
    const userPrompts = prompts.filter(p => !p.isTemplate)
    if (userPrompts.length > 0) {
      lines.push('')
      lines.push('')
      lines.push('╔' + '═'.repeat(78) + '╗')
      lines.push('║' + `  USER PROMPTS (${userPrompts.length})`.padEnd(78) + '║')
      lines.push('╚' + '═'.repeat(78) + '╝')
      lines.push('')
      userPrompts.forEach((prompt, index) => {
        lines.push(formatPrompt(prompt, index))
      })
    }

    // Footer
    lines.push('')
    lines.push('='.repeat(80))
    lines.push('END OF EXPORT')
    lines.push('='.repeat(80))

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0]
    const filename = `gangrun-prompts-export-${date}.txt`
    const filepath = path.join(__dirname, 'public', filename)

    // Write to file
    fs.writeFileSync(filepath, lines.join('\n'), 'utf8')

    console.log(`\n✅ Export complete!`)
    console.log(`📄 File saved: ${filename}`)
    console.log(`📊 Statistics:`)
    console.log(`   - Total prompts: ${prompts.length}`)
    console.log(`   - Templates: ${templates.length}`)
    console.log(`   - User prompts: ${userPrompts.length}`)
    console.log(`\n🔗 Download URL:`)
    console.log(`   https://gangrunprinting.com/${filename}`)

    return filepath
  } catch (error) {
    console.error('❌ Error exporting prompts:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the export
exportPromptsToText()
  .then((filepath) => {
    console.log(`\n✨ Done! Text file is ready for download.`)
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed to export prompts:', error)
    process.exit(1)
  })
