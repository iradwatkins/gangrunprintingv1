import { prisma } from '@/lib/prisma'
import { getMinioClient, BUCKETS } from '@/lib/minio-client'
import { logger } from '@/lib/logger-safe'
import { randomUUID } from 'crypto'

/**
 * File Migration Service
 * Handles moving files from temporary storage to permanent MinIO storage
 * and updating database records with new URLs
 */
export class FileMigrationService {
  /**
   * Move a file from temporary storage to permanent storage
   */
  static async migrateFileToPermantent(
    tempFileId: string,
    sessionId: string,
    orderId: string,
    fileType: 'CUSTOMER_ARTWORK' | 'ADMIN_PROOF' | 'PRODUCTION_FILE' = 'CUSTOMER_ARTWORK'
  ): Promise<{ permanentUrl: string; thumbnailUrl?: string }> {
    try {
      const client = await getMinioClient()

      // Generate permanent file paths
      const permanentFileId = randomUUID()
      const year = new Date().getFullYear()
      const month = String(new Date().getMonth() + 1).padStart(2, '0')

      // Organized folder structure: files/{year}/{month}/{order-id}/{file-type}/{file-id}
      const permanentPath = `files/${year}/${month}/${orderId}/${fileType.toLowerCase()}/${permanentFileId}`
      const permanentThumbnailPath = `files/${year}/${month}/${orderId}/${fileType.toLowerCase()}/thumbnails/${permanentFileId}.jpg`

      // List all files in the temp directory to find the actual file
      const tempFilePath = `temp/${sessionId}/files/`
      const tempThumbnailPath = `temp/${sessionId}/thumbnails/${tempFileId}.jpg`

      // Find the actual temporary file by listing objects with the file ID prefix
      const tempFiles = await client.listObjects(BUCKETS.UPLOADS, tempFilePath, false)

      let actualTempFile: string | null = null
      let fileExtension = ''

      // Find the file that matches our temp file ID
      for await (const obj of tempFiles) {
        if (obj.name && obj.name.includes(tempFileId)) {
          actualTempFile = obj.name
          const lastDot = obj.name.lastIndexOf('.')
          if (lastDot > 0) {
            fileExtension = obj.name.substring(lastDot)
          }
          break
        }
      }

      if (!actualTempFile) {
        throw new Error(`Temporary file not found: ${tempFileId}`)
      }

      const fullPermanentPath = permanentPath + fileExtension

      // Copy file from temporary to permanent storage
      await client.copyObject(
        BUCKETS.UPLOADS, // destination bucket
        fullPermanentPath, // destination path
        BUCKETS.UPLOADS, // source bucket
        actualTempFile // source path (full path including prefix)
      )

      // Set metadata for permanent file
      await client.putObjectMetadata(BUCKETS.UPLOADS, fullPermanentPath, {
        'file-type': fileType,
        'order-id': orderId,
        'migrated-at': new Date().toISOString(),
        'permanent-file': 'true',
        'temp-file-id': tempFileId,
      })

      const permanentUrl = `/api/files/permanent/${permanentFileId}${fileExtension}`

      // Handle thumbnail if it exists
      let thumbnailUrl: string | undefined
      try {
        // Check if thumbnail exists
        await client.statObject(BUCKETS.UPLOADS, tempThumbnailPath)

        // Copy thumbnail to permanent storage
        await client.copyObject(
          BUCKETS.UPLOADS,
          permanentThumbnailPath,
          BUCKETS.UPLOADS,
          tempThumbnailPath
        )

        thumbnailUrl = `/api/files/permanent/thumbnails/${permanentFileId}.jpg`
      } catch {
        // Thumbnail doesn't exist, skip
      }

      logger.info('File migrated to permanent storage', {
        tempFileId,
        permanentFileId,
        orderId,
        fileType,
        permanentPath: fullPermanentPath,
      })

      return { permanentUrl, thumbnailUrl }
    } catch (error) {
      logger.error('Failed to migrate file to permanent storage', {
        tempFileId,
        sessionId,
        orderId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw new Error(`File migration failed: ${error}`)
    }
  }

  /**
   * Clean up temporary files after successful migration
   */
  static async cleanupTemporaryFiles(sessionId: string, tempFileIds: string[]): Promise<void> {
    try {
      const client = await getMinioClient()

      // List all files in the session temp directory
      const tempDirectoryPath = `temp/${sessionId}/`
      const tempFiles = await client.listObjects(BUCKETS.UPLOADS, tempDirectoryPath, true)

      const filesToDelete: string[] = []

      // Find all files that match the temp file IDs
      for await (const obj of tempFiles) {
        if (obj.name) {
          // Check if this file belongs to one of our temp file IDs
          const matchingFileId = tempFileIds.find((id) => obj.name!.includes(id))
          if (matchingFileId) {
            filesToDelete.push(obj.name)
          }
        }
      }

      // Delete all matching files
      for (const filePath of filesToDelete) {
        try {
          await client.removeObject(BUCKETS.UPLOADS, filePath)
          logger.debug('Deleted temporary file', { path: filePath })
        } catch (deleteError) {
          logger.warn('Failed to delete temporary file', {
            path: filePath,
            error: deleteError instanceof Error ? deleteError.message : String(deleteError),
          })
        }
      }

      logger.info('Temporary files cleaned up', {
        sessionId,
        requestedFiles: tempFileIds.length,
        deletedFiles: filesToDelete.length,
      })
    } catch (error) {
      logger.error('Failed to cleanup temporary files', {
        sessionId,
        tempFileIds,
        error: error instanceof Error ? error.message : String(error),
      })
      // Don't throw - cleanup failure shouldn't fail the main operation
    }
  }

  /**
   * Migrate all files for an order and update database records
   */
  static async migrateOrderFiles(
    orderId: string,
    tempFiles: Array<{
      fileId: string
      sessionId: string
      orderFileId: string
      fileType: 'CUSTOMER_ARTWORK' | 'ADMIN_PROOF' | 'PRODUCTION_FILE'
    }>
  ): Promise<void> {
    const migrationResults: Array<{
      orderFileId: string
      permanentUrl: string
      thumbnailUrl?: string
    }> = []

    try {
      // Migrate each file
      for (const tempFile of tempFiles) {
        const { permanentUrl, thumbnailUrl } = await this.migrateFileToPermantent(
          tempFile.fileId,
          tempFile.sessionId,
          orderId,
          tempFile.fileType
        )

        migrationResults.push({
          orderFileId: tempFile.orderFileId,
          permanentUrl,
          thumbnailUrl,
        })
      }

      // Update database records with permanent URLs
      for (const result of migrationResults) {
        await prisma.orderFile.update({
          where: { id: result.orderFileId },
          data: {
            fileUrl: result.permanentUrl,
            thumbnailUrl: result.thumbnailUrl,
            metadata: {
              migratedAt: new Date().toISOString(),
              migrationStatus: 'completed',
            },
          },
        })
      }

      // Clean up temporary files
      const sessionIds = [...new Set(tempFiles.map((f) => f.sessionId))]
      for (const sessionId of sessionIds) {
        const tempFileIds = tempFiles.filter((f) => f.sessionId === sessionId).map((f) => f.fileId)
        await this.cleanupTemporaryFiles(sessionId, tempFileIds)
      }

      logger.info('Order files migration completed', {
        orderId,
        migratedFiles: migrationResults.length,
      })
    } catch (error) {
      logger.error('Order files migration failed', {
        orderId,
        error: error instanceof Error ? error.message : String(error),
      })

      // Rollback: update failed files in database
      for (const result of migrationResults) {
        try {
          await prisma.orderFile.update({
            where: { id: result.orderFileId },
            data: {
              metadata: {
                migrationStatus: 'failed',
                migrationError: error instanceof Error ? error.message : String(error),
              },
            },
          })
        } catch {
          // Ignore rollback errors
        }
      }

      throw error
    }
  }

  /**
   * Get permanent file from MinIO using file ID
   */
  static async getPermanentFile(fileId: string): Promise<{ stream: any; metadata: any }> {
    try {
      const client = await getMinioClient()

      // Find the file by searching in the organized structure
      // This is a simplified approach - in production you'd store the full path in the database
      const currentYear = new Date().getFullYear()
      const searchPaths = [
        `files/${currentYear}/**/customer_artwork/${fileId}.*`,
        `files/${currentYear}/**/admin_proof/${fileId}.*`,
        `files/${currentYear}/**/production_file/${fileId}.*`,
      ]

      // For now, return the file stream and metadata
      // In a real implementation, you'd index the file paths in the database
      throw new Error(
        'File retrieval implementation pending - need to store full paths in database'
      )
    } catch (error) {
      logger.error('Failed to retrieve permanent file', {
        fileId,
        error: error instanceof Error ? error.message : String(error),
      })
      throw error
    }
  }
}
