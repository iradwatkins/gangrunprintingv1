#!/usr/bin/env node

/**
 * Export prompts in simple, readable English
 * Usage: node export-prompts-simple.js
 */

const { PrismaClient } = require('@prisma/client')
const fs = require('fs')
const path = require('path')

const prisma = new PrismaClient()

async function exportSimple() {
  try {
    console.log('Fetching prompts...')

    const prompts = await prisma.promptTemplate.findMany({
      orderBy: [
        { isTemplate: 'desc' },
        { name: 'asc' },
      ],
    })

    console.log(`Found ${prompts.length} prompts`)

    const lines = []

    // Header
    lines.push('GANGRUN PRINTING - ALL PROMPTS')
    lines.push('=' .repeat(80))
    lines.push('')
    lines.push(`Exported: ${new Date().toLocaleString()}`)
    lines.push(`Total: ${prompts.length} prompts`)
    lines.push('')
    lines.push('')

    // Templates first
    const templates = prompts.filter(p => p.isTemplate)
    if (templates.length > 0) {
      lines.push('━'.repeat(80))
      lines.push(`TEMPLATES (${templates.length})`)
      lines.push('━'.repeat(80))
      lines.push('')

      templates.forEach((prompt, i) => {
        lines.push(`${i + 1}. ${prompt.name.toUpperCase()}`)
        lines.push('')
        if (prompt.description) {
          lines.push(prompt.description)
          lines.push('')
        }
        lines.push('PROMPT:')
        lines.push(prompt.promptText)
        lines.push('')

        if (prompt.styleModifiers) {
          lines.push('STYLE:')
          lines.push(prompt.styleModifiers)
          lines.push('')
        }

        if (prompt.technicalSpecs) {
          lines.push('TECHNICAL DETAILS:')
          lines.push(prompt.technicalSpecs)
          lines.push('')
        }

        if (prompt.negativePrompt) {
          lines.push('AVOID:')
          lines.push(prompt.negativePrompt)
          lines.push('')
        }

        lines.push('-'.repeat(80))
        lines.push('')
      })
    }

    // User prompts
    const userPrompts = prompts.filter(p => !p.isTemplate)
    if (userPrompts.length > 0) {
      lines.push('')
      lines.push('━'.repeat(80))
      lines.push(`YOUR CUSTOM PROMPTS (${userPrompts.length})`)
      lines.push('━'.repeat(80))
      lines.push('')

      userPrompts.forEach((prompt, i) => {
        lines.push(`${i + 1}. ${prompt.name.toUpperCase()}`)
        lines.push('')
        if (prompt.description) {
          lines.push(prompt.description)
          lines.push('')
        }
        lines.push('PROMPT:')
        lines.push(prompt.promptText)
        lines.push('')

        if (prompt.styleModifiers) {
          lines.push('STYLE:')
          lines.push(prompt.styleModifiers)
          lines.push('')
        }

        if (prompt.technicalSpecs) {
          lines.push('TECHNICAL DETAILS:')
          lines.push(prompt.technicalSpecs)
          lines.push('')
        }

        if (prompt.negativePrompt) {
          lines.push('AVOID:')
          lines.push(prompt.negativePrompt)
          lines.push('')
        }

        lines.push('-'.repeat(80))
        lines.push('')
      })
    }

    // Footer
    lines.push('')
    lines.push('END OF PROMPTS')
    lines.push('=' .repeat(80))

    const date = new Date().toISOString().split('T')[0]
    const filename = `prompts-${date}.txt`
    const filepath = path.join(__dirname, 'public', filename)

    fs.writeFileSync(filepath, lines.join('\n'), 'utf8')

    console.log(`\nSaved: ${filename}`)
    console.log(`Download: https://gangrunprinting.com/${filename}`)

    return filepath
  } catch (error) {
    console.error('Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

exportSimple()
  .then(() => {
    console.log('\nDone!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('Failed:', error)
    process.exit(1)
  })
