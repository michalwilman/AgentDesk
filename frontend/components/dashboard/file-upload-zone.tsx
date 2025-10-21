'use client'

import { useState, useCallback } from 'react'
import { Upload, File, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { validateFile, formatFileSize } from '@/lib/api/documents'

interface FileUploadZoneProps {
  onFileSelect: (files: File[]) => void
  language: string
  maxSizeMB?: number
  multiple?: boolean
  disabled?: boolean
}

export default function FileUploadZone({
  onFileSelect,
  language,
  maxSizeMB = 5,
  multiple = true,
  disabled = false,
}: FileUploadZoneProps) {
  const [dragActive, setDragActive] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [error, setError] = useState<string>('')

  const isHebrew = language === 'he'

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      setError('')

      if (disabled) return

      const files = Array.from(e.dataTransfer.files)
      processFiles(files)
    },
    [disabled],
  )

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      e.preventDefault()
      setError('')

      if (disabled || !e.target.files) return

      const files = Array.from(e.target.files)
      processFiles(files)
    },
    [disabled],
  )

  const processFiles = (files: File[]) => {
    const validFiles: File[] = []
    let errorMessage = ''

    for (const file of files) {
      const validation = validateFile(file, maxSizeMB)
      if (validation.valid) {
        validFiles.push(file)
      } else {
        errorMessage = validation.error || 'Invalid file'
        break
      }
    }

    if (errorMessage) {
      setError(errorMessage)
      return
    }

    if (!multiple && validFiles.length > 1) {
      setError(isHebrew ? 'ניתן להעלות קובץ אחד בלבד' : 'Only one file allowed')
      return
    }

    setSelectedFiles(multiple ? [...selectedFiles, ...validFiles] : validFiles)
  }

  const removeFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    setSelectedFiles(newFiles)
  }

  const handleUpload = () => {
    if (selectedFiles.length > 0) {
      onFileSelect(selectedFiles)
      setSelectedFiles([])
    }
  }

  return (
    <div className="space-y-4">
      {/* Drag & Drop Zone */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-primary/20 hover:border-primary/40'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={handleChange}
          accept=".pdf,.txt,.doc,.docx"
          multiple={multiple}
          disabled={disabled}
        />

        <div className="flex flex-col items-center space-y-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="h-8 w-8 text-primary" />
          </div>

          <div>
            <p className="text-lg font-medium text-white mb-1">
              {isHebrew
                ? 'גרור קבצים לכאן או לחץ לבחירה'
                : 'Drag files here or click to select'}
            </p>
            <p className="text-sm text-[#666666]">
              {isHebrew
                ? `תומך ב-PDF, TXT, DOC, DOCX (עד ${maxSizeMB}MB)`
                : `Supports PDF, TXT, DOC, DOCX (up to ${maxSizeMB}MB)`}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Selected Files List */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-white">
            {isHebrew
              ? `${selectedFiles.length} קבצים נבחרו`
              : `${selectedFiles.length} file(s) selected`}
          </p>

          <div className="space-y-2">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg bg-dark-50 border border-primary/20"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <File className="h-5 w-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#666666]">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="p-1 rounded hover:bg-red-500/10 text-red-500 transition-colors flex-shrink-0"
                  title={isHebrew ? 'הסר' : 'Remove'}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>

          <Button
            onClick={handleUpload}
            className="w-full"
            disabled={disabled}
          >
            {isHebrew
              ? `העלה ${selectedFiles.length} קבצים`
              : `Upload ${selectedFiles.length} file(s)`}
          </Button>
        </div>
      )}
    </div>
  )
}

