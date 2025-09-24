#!/usr/bin/env node

/**
 * Script to replace remaining unknown types with contextual placeholders
 */

import * as fs from 'fs'
import * as path from 'path'

const PATTERNS = [
  {
    // API error handlers
    regex: /catch\s*\(\s*error:\s*unknown\s*\/\/\s*TODO:\s*Define proper type\s*\)/g,
    replacement: 'catch (error)'
  },
  {
    // Database errors in Prisma contexts
    regex: /error:\s*unknown\s*\/\/\s*TODO:\s*Define proper type/g,
    context: /prisma|database|tx\./i,
    replacement: 'error: Error'
  },
  {
    // Request/Response objects in API routes
    regex: /:\s*unknown\s*\/\/\s*TODO:\s*Define proper type/g,
    context: /request|response|body|params|query/i,
    replacement: ': Record<string, unknown>'
  },
  {
    // Array parameters
    regex: /:\s*unknown\s*\/\/\s*TODO:\s*Define proper type\[\]/g,
    replacement: ': unknown[]'
  },
  {
    // Generic objects
    regex: /:\s*unknown\s*\/\/\s*TODO:\s*Define proper type/g,
    replacement: ': Record<string, unknown>'
  }
]

function getAllFiles(dir: string, files: string[] = []): string[] {
  const items = fs.readdirSync(dir, { withFileTypes: true })

  for (const item of items) {
    const fullPath = path.join(dir, item.name)
    if (item.isDirectory()) {
      if (!item.name.includes('node_modules') && !item.name.startsWith('.')) {
        getAllFiles(fullPath, files)
      }
    } else if (item.isFile() && (item.name.endsWith('.ts') || item.name.endsWith('.tsx'))) {
      files.push(fullPath)
    }
  }

  return files
}

function processFile(filePath: string): number {
  let content = fs.readFileSync(filePath, 'utf-8')
  const originalContent = content
  let replacements = 0

  for (const pattern of PATTERNS) {
    if (pattern.context) {
      // Only apply if context matches
      if (!pattern.context.test(content)) {
        continue
      }
    }

    const matches = content.match(pattern.regex)
    if (matches) {
      replacements += matches.length
      content = content.replace(pattern.regex, pattern.replacement)
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf-8')
    console.log(`✅ Fixed ${replacements} types in ${filePath}`)
  }

  return replacements
}

function main() {
  console.log('🔍 Searching for unknown types to replace...\n')

  const srcDir = path.join(process.cwd(), 'src')
  const files = getAllFiles(srcDir)

  let totalReplacements = 0
  let filesFixed = 0

  for (const file of files) {
    const replacements = processFile(file)
    if (replacements > 0) {
      totalReplacements += replacements
      filesFixed++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log(`✅ Replaced ${totalReplacements} unknown types in ${filesFixed} files`)
  console.log('='.repeat(50))

  // Count remaining
  const remaining = files.reduce((acc, file) => {
    const content = fs.readFileSync(file, 'utf-8')
    const matches = content.match(/unknown\s*\/\/\s*TODO:\s*Define proper type/g)
    return acc + (matches ? matches.length : 0)
  }, 0)

  if (remaining > 0) {
    console.log(`⚠️  ${remaining} unknown types still need manual attention`)
    console.log('These likely require specific domain types to be defined.')
  } else {
    console.log('🎉 All unknown types have been replaced!')
  }
}

main()