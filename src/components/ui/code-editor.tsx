'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Copy, Check, Maximize2, Minimize2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CodeEditorProps {
  value: string
  onChange: (value: string) => void
  language: 'css' | 'javascript' | 'html' | 'json'
  height?: string
  className?: string
  readOnly?: boolean
}

export function CodeEditor({
  value,
  onChange,
  language,
  height = '200px',
  className,
  readOnly = false,
}: CodeEditorProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy:', error)
    }
  }

  const getLanguageColor = (lang: string) => {
    switch (lang) {
      case 'css':
        return 'bg-blue-100 text-blue-800'
      case 'javascript':
        return 'bg-yellow-100 text-yellow-800'
      case 'html':
        return 'bg-orange-100 text-orange-800'
      case 'json':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatCode = (code: string, lang: string) => {
    // Basic syntax highlighting (for simple cases)
    // In a production app, you'd use a proper syntax highlighter like Prism.js or Monaco Editor
    if (lang === 'css') {
      return code
        .replace(/([.#][\w-]+)/g, '<span class="text-purple-600">$1</span>')
        .replace(/([\w-]+)(?=\s*:)/g, '<span class="text-blue-600">$1</span>')
        .replace(/(:)([^;]+)(;)/g, '$1<span class="text-green-600">$2</span>$3')
    }
    return code
  }

  return (
    <div className={cn('border rounded-lg overflow-hidden', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b">
        <div className="flex items-center space-x-2">
          <Badge className={getLanguageColor(language)} variant="secondary">
            {language.toUpperCase()}
          </Badge>
          <span className="text-sm text-gray-600">{value.split('\n').length} lines</span>
        </div>
        <div className="flex items-center space-x-2">
          <Button className="h-7 px-2" size="sm" variant="ghost" onClick={handleCopy}>
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button
            className="h-7 px-2"
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
          </Button>
        </div>
      </div>

      {/* Editor */}
      <div className="relative">
        <Textarea
          className={cn(
            'border-0 rounded-none resize-none font-mono text-sm',
            'focus:ring-0 focus:border-0',
            isExpanded ? 'min-h-[400px]' : ''
          )}
          placeholder={`Enter ${language} code here...`}
          readOnly={readOnly}
          style={{ height: isExpanded ? '400px' : height }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />

        {/* Line numbers */}
        <div className="absolute left-0 top-0 bottom-0 w-12 bg-gray-50 border-r text-xs text-gray-400 p-3 pointer-events-none">
          {value.split('\n').map((_, index) => (
            <div key={index} className="leading-6">
              {index + 1}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      {!readOnly && (
        <div className="flex items-center justify-between p-2 bg-gray-50 border-t text-xs text-gray-500">
          <span>Use Tab for indentation, Ctrl+A to select all</span>
          <span>{value.length} characters</span>
        </div>
      )}
    </div>
  )
}

// Syntax highlighting component (basic implementation)
export function SyntaxHighlighter({
  code,
  language,
  className,
}: {
  code: string
  language: string
  className?: string
}) {
  const highlightedCode = formatCode(code, language)

  return (
    <pre
      className={cn('bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm font-mono', className)}
      dangerouslySetInnerHTML={{ __html: highlightedCode }}
    />
  )
}

// Helper function for basic syntax highlighting
function formatCode(code: string, language: string): string {
  let highlighted = code

  if (language === 'css') {
    // CSS property names
    highlighted = highlighted.replace(
      /([\w-]+)(?=\s*:)/g,
      '<span style="color: #0066cc;">$1</span>'
    )

    // CSS values
    highlighted = highlighted.replace(
      /(:)([^;]+)(;)/g,
      '$1<span style="color: #009900;">$2</span>$3'
    )

    // CSS selectors
    highlighted = highlighted.replace(/([.#][\w-]+)/g, '<span style="color: #cc6600;">$1</span>')
  } else if (language === 'javascript') {
    // Keywords
    const keywords = [
      'function',
      'const',
      'let',
      'var',
      'if',
      'else',
      'return',
      'for',
      'while',
      'class',
      'extends',
    ]
    keywords.forEach((keyword) => {
      highlighted = highlighted.replace(
        new RegExp(`\\b${keyword}\\b`, 'g'),
        `<span style="color: #cc0066;">${keyword}</span>`
      )
    })

    // Strings
    highlighted = highlighted.replace(
      /(["'])((?:\\.|(?!\1)[^\\])*?)\1/g,
      '<span style="color: #009900;">$1$2$1</span>'
    )
  }

  return highlighted
}
