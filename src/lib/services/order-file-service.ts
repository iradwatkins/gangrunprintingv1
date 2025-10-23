/**
 * Order File Service
 * Handles operations related to order file management
 */

interface TempFile {
  fileId: string
  originalName: string
  size: number
  mimeType: string
  thumbnailUrl?: string
  isImage: boolean
}

/**
 * Associate temporarily uploaded files with an order
 * Called after order creation to convert temporary uploads to OrderFile records
 *
 * @param orderId - The ID of the order to associate files with
 * @param tempFiles - Array of temporary file metadata
 * @returns Promise with success status and created file records
 */
export async function associateTemporaryFilesWithOrder(
  orderId: string,
  tempFiles: TempFile[]
): Promise<{ success: boolean; files?: any[]; error?: string }> {
  try {
    if (!tempFiles || tempFiles.length === 0) {
      return { success: true, files: [] }
    }

    const response = await fetch(`/api/orders/${orderId}/files/associate-temp`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tempFiles }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to associate files')
    }

    const result = await response.json()
    return {
      success: true,
      files: result.files,
    }
  } catch (error) {
    console.error('Error associating temporary files with order:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get uploaded files from sessionStorage
 * Used during checkout to retrieve files uploaded by customer
 *
 * @param productId - The product ID to get uploads for
 * @returns Array of temporary file metadata or empty array
 */
export function getUploadedFilesFromSession(productId: string): TempFile[] {
  if (typeof window === 'undefined') return []

  try {
    const stored = sessionStorage.getItem(`uploaded_images_${productId}`)
    if (!stored) return []

    const files = JSON.parse(stored)
    return Array.isArray(files) ? files : []
  } catch (error) {
    console.error('Error reading uploaded files from session:', error)
    return []
  }
}

/**
 * Clear uploaded files from sessionStorage after successful order creation
 *
 * @param productId - The product ID to clear uploads for
 */
export function clearUploadedFilesFromSession(productId: string): void {
  if (typeof window === 'undefined') return

  try {
    sessionStorage.removeItem(`uploaded_images_${productId}`)
  } catch (error) {
    console.error('Error clearing uploaded files from session:', error)
  }
}
