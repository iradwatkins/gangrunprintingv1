/**
 * Safe JSON parsing utilities with BOM detection and removal
 */

export function parseJsonSafely<T = any>(text: string, context?: string): T {
  try {
    // Remove BOM (Byte Order Mark) if present
    let cleanText = text
    if (text.charCodeAt(0) === 0xfeff) {
      cleanText = text.slice(1)
    }

    // Additional cleanup for common issues
    cleanText = cleanText.trim()

    // Check if it looks like HTML instead of JSON
    if (cleanText.startsWith('<!DOCTYPE') || cleanText.startsWith('<html')) {
      throw new Error('Received HTML response instead of JSON')
    }

    return JSON.parse(cleanText)
  } catch (error) {
    // Enhanced error reporting for JSON parsing issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown parsing error'
    const preview = text.substring(0, 200)
    const charCodes = text
      .substring(0, 10)
      .split('')
      .map((c) => c.charCodeAt(0))
      .join(', ')

    console.error('JSON parsing failed:', {
      error: errorMessage,
      preview,
      charCodes,
      context,
    })

    throw new Error(`JSON parse error${context ? ` for ${context}` : ''}: ${errorMessage}`)
  }
}

/**
 * Safe fetch wrapper that handles BOM and JSON parsing
 */
export async function safeFetch<T = any>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options)

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 200)}`)
  }

  const text = await response.text()
  return parseJsonSafely<T>(text, url)
}

/**
 * Convert a Response object to JSON safely
 */
export async function responseToJsonSafely<T = any>(
  response: Response,
  context?: string
): Promise<T> {
  const text = await response.text()
  return parseJsonSafely<T>(text, context || response.url)
}
