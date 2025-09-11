'use client'

import { useState, useRef } from 'react'
import { Upload, X, FileText, Image, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import toast from '@/lib/toast'

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  preview?: string
  progress: number
  status: 'uploading' | 'completed' | 'error'
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

export default function UploadPage() {
  const [files, setFiles] = useState<UploadedFile[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = (fileList: FileList) => {
    const newFiles = Array.from(fileList).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
      progress: 0,
      status: 'uploading' as const
    }))

    setFiles(prev => [...prev, ...newFiles])
    
    // Simulate upload
    newFiles.forEach((file, index) => {
      setTimeout(() => {
        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, progress: 100, status: 'completed' }
            : f
        ))
      }, (index + 1) * 1000)
    })
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files)
    }
  }

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Upload Files</CardTitle>
          <CardDescription>
            Upload your print files. We support PDF, PNG, JPG, and other common formats.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-gray-300'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileInput}
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
            />
            
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-lg mb-2">Drag & drop files here, or click to select</p>
            <p className="text-sm text-gray-500 mb-4">
              Support for PDF, PNG, JPG, DOC, DOCX (Max 100MB per file)
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              Select Files
            </Button>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-3 p-3 border rounded-lg">
                  {file.type.startsWith('image/') ? (
                    <Image className="w-8 h-8 text-blue-500" />
                  ) : (
                    <FileText className="w-8 h-8 text-gray-500" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{file.name}</p>
                      <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                    </div>
                    
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="h-1 mt-2" />
                    )}
                    
                    {file.status === 'completed' && (
                      <div className="flex items-center gap-1 mt-1 text-sm text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Upload complete
                      </div>
                    )}
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(file.id)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}