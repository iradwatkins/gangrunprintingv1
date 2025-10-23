'use client'

import { useState, useCallback, useRef } from 'react'

export interface ChunkedUploadConfig {
  chunkSize?: number // in bytes, default 10MB
  maxRetries?: number // default 5
  timeout?: number // in milliseconds, default 60s
  onProgress?: (progress: number) => void
  onChunkComplete?: (chunkIndex: number, totalChunks: number) => void
  onError?: (error: Error) => void
}

export interface ChunkedUploadResult {
  sessionId: string
  fileName: string
  totalChunks: number
  uploadedChunks: number[]
}

interface ChunkUploadState {
  uploading: boolean
  progress: number
  currentChunk: number
  totalChunks: number
  retryAttempt: number
  error: string | null
  sessionId: string | null
}

const DEFAULT_CHUNK_SIZE = 10 * 1024 * 1024 // 10MB
const DEFAULT_MAX_RETRIES = 5
const DEFAULT_TIMEOUT = 60000 // 60 seconds
const MIN_CHUNK_SIZE = 1 * 1024 * 1024 // 1MB minimum

export function useChunkedUpload(config: ChunkedUploadConfig = {}) {
  const {
    chunkSize: initialChunkSize = DEFAULT_CHUNK_SIZE,
    maxRetries = DEFAULT_MAX_RETRIES,
    timeout = DEFAULT_TIMEOUT,
    onProgress,
    onChunkComplete,
    onError,
  } = config

  const [state, setState] = useState<ChunkUploadState>({
    uploading: false,
    progress: 0,
    currentChunk: 0,
    totalChunks: 0,
    retryAttempt: 0,
    error: null,
    sessionId: null,
  })

  // Track dynamic chunk size (can be reduced on errors)
  const currentChunkSize = useRef(initialChunkSize)
  const abortController = useRef<AbortController | null>(null)
  const totalBytesLoaded = useRef(0)
  const chunkBytesLoaded = useRef(0)

  // Generate unique session ID
  const generateSessionId = () => {
    return `chunk_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Split file into chunks
  const createChunks = (file: File): Blob[] => {
    const chunks: Blob[] = []
    const chunkCount = Math.ceil(file.size / currentChunkSize.current)

    for (let i = 0; i < chunkCount; i++) {
      const start = i * currentChunkSize.current
      const end = Math.min(start + currentChunkSize.current, file.size)
      chunks.push(file.slice(start, end))
    }

    return chunks
  }

  // Upload a single chunk with retry logic
  const uploadChunk = async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    sessionId: string,
    fileName: string,
    file: File
  ): Promise<void> => {
    const formData = new FormData()
    formData.append('chunk', chunk)
    formData.append('chunkIndex', chunkIndex.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('sessionId', sessionId)
    formData.append('fileName', fileName)
    formData.append('fileSize', file.size.toString())
    formData.append('mimeType', file.type)
    formData.append('isLastChunk', (chunkIndex === totalChunks - 1).toString())

    return new Promise((resolve, reject) => {
      abortController.current = new AbortController()
      const xhr = new XMLHttpRequest()

      // Track chunk upload progress
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const chunkProgress = (event.loaded / event.total) * 100
          const overallLoaded = totalBytesLoaded.current + event.loaded
          const overallProgress = (overallLoaded / file.size) * 100

          chunkBytesLoaded.current = event.loaded

          setState((prev) => ({ ...prev, progress: Math.min(overallProgress, 100) }))
          onProgress?.(Math.min(overallProgress, 100))
        }
      })

      // Handle completion
      xhr.onload = () => {
        if (xhr.status === 200) {
          // Update total bytes loaded
          totalBytesLoaded.current += chunk.size
          chunkBytesLoaded.current = 0

          onChunkComplete?.(chunkIndex, totalChunks)
          resolve()
        } else {
          reject(
            new Error(
              `Chunk ${chunkIndex + 1}/${totalChunks} upload failed with status ${xhr.status}`
            )
          )
        }
      }

      // Handle errors
      xhr.onerror = () => {
        reject(new Error(`Network error during chunk ${chunkIndex + 1}/${totalChunks} upload`))
      }

      // Handle timeout
      xhr.ontimeout = () => {
        reject(new Error(`Timeout during chunk ${chunkIndex + 1}/${totalChunks} upload`))
      }

      // Configure and send
      xhr.open('POST', '/api/upload/chunk')
      xhr.timeout = timeout
      xhr.send(formData)

      // Handle abort
      abortController.current.signal.addEventListener('abort', () => {
        xhr.abort()
        reject(new Error('Upload cancelled'))
      })
    })
  }

  // Upload chunk with retry logic
  const uploadChunkWithRetry = async (
    chunk: Blob,
    chunkIndex: number,
    totalChunks: number,
    sessionId: string,
    fileName: string,
    file: File,
    attemptNumber: number = 0
  ): Promise<void> => {
    try {
      await uploadChunk(chunk, chunkIndex, totalChunks, sessionId, fileName, file)
      // Reset retry counter on success
      setState((prev) => ({ ...prev, retryAttempt: 0 }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      // If we haven't exceeded max retries, try again
      if (attemptNumber < maxRetries) {
        // Update retry attempt in state
        setState((prev) => ({
          ...prev,
          retryAttempt: attemptNumber + 1,
          error: `Retry attempt ${attemptNumber + 1}/${maxRetries}: ${errorMessage}`,
        }))

        // Reduce chunk size if this isn't the first retry
        if (attemptNumber > 0 && currentChunkSize.current > MIN_CHUNK_SIZE) {
          const newChunkSize = Math.max(currentChunkSize.current / 2, MIN_CHUNK_SIZE)
          console.log(
            `Reducing chunk size from ${currentChunkSize.current} to ${newChunkSize} bytes`
          )
          currentChunkSize.current = newChunkSize
        }

        // Wait before retrying (exponential backoff)
        const backoffDelay = Math.min(1000 * Math.pow(2, attemptNumber), 10000)
        await new Promise((resolve) => setTimeout(resolve, backoffDelay))

        // Retry
        return uploadChunkWithRetry(
          chunk,
          chunkIndex,
          totalChunks,
          sessionId,
          fileName,
          file,
          attemptNumber + 1
        )
      } else {
        // Max retries exceeded
        throw new Error(
          `Failed to upload chunk ${chunkIndex + 1}/${totalChunks} after ${maxRetries} attempts: ${errorMessage}`
        )
      }
    }
  }

  // Main upload function
  const uploadFile = useCallback(
    async (file: File): Promise<ChunkedUploadResult> => {
      // Reset state
      currentChunkSize.current = initialChunkSize
      totalBytesLoaded.current = 0
      chunkBytesLoaded.current = 0

      const sessionId = generateSessionId()

      setState({
        uploading: true,
        progress: 0,
        currentChunk: 0,
        totalChunks: 0,
        retryAttempt: 0,
        error: null,
        sessionId,
      })

      try {
        // Create chunks
        const chunks = createChunks(file)
        const totalChunks = chunks.length

        setState((prev) => ({ ...prev, totalChunks }))

        console.log(
          `Uploading ${file.name} in ${totalChunks} chunks (chunk size: ${currentChunkSize.current / 1024 / 1024}MB)`
        )

        // Upload each chunk sequentially
        for (let i = 0; i < chunks.length; i++) {
          setState((prev) => ({ ...prev, currentChunk: i + 1 }))

          await uploadChunkWithRetry(chunks[i], i, totalChunks, sessionId, file.name, file)
        }

        // All chunks uploaded successfully
        setState((prev) => ({ ...prev, uploading: false, progress: 100 }))

        return {
          sessionId,
          fileName: file.name,
          totalChunks,
          uploadedChunks: Array.from({ length: totalChunks }, (_, i) => i),
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Upload failed'
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: errorMessage,
        }))
        onError?.(error instanceof Error ? error : new Error(errorMessage))
        throw error
      }
    },
    [initialChunkSize, maxRetries, timeout, onProgress, onChunkComplete, onError]
  )

  // Cancel upload
  const cancelUpload = useCallback(() => {
    if (abortController.current) {
      abortController.current.abort()
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: 'Upload cancelled',
      }))
    }
  }, [])

  // Reset state
  const reset = useCallback(() => {
    setState({
      uploading: false,
      progress: 0,
      currentChunk: 0,
      totalChunks: 0,
      retryAttempt: 0,
      error: null,
      sessionId: null,
    })
    currentChunkSize.current = initialChunkSize
    totalBytesLoaded.current = 0
    chunkBytesLoaded.current = 0
  }, [initialChunkSize])

  return {
    uploadFile,
    cancelUpload,
    reset,
    state,
    isUploading: state.uploading,
    progress: state.progress,
    currentChunk: state.currentChunk,
    totalChunks: state.totalChunks,
    retryAttempt: state.retryAttempt,
    error: state.error,
    sessionId: state.sessionId,
  }
}
