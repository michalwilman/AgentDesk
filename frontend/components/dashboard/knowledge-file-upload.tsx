'use client'

import { useState } from 'react'
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface KnowledgeFileUploadProps {
  botId: string
}

export function KnowledgeFileUpload({ botId }: KnowledgeFileUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    setUploading(true)
    setMessage(null)

    try {
      const file = files[0]
      
      // Validate file type
      const allowedTypes = [
        'application/pdf',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload PDF, TXT, DOC, or DOCX files.')
      }

      // Validate file size (5MB for free tier)
      const maxSize = 5 * 1024 * 1024
      if (file.size > maxSize) {
        throw new Error('File size exceeds 5MB limit.')
      }

      // Create form data
      const formData = new FormData()
      formData.append('file', file)
      formData.append('botId', botId)

      // Get auth token
      const token = localStorage.getItem('supabase.auth.token')
      if (!token) {
        throw new Error('Not authenticated')
      }

      // Upload file
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Failed to upload file')
      }

      const data = await response.json()
      setMessage({ type: 'success', text: `File "${file.name}" uploaded successfully! Processing...` })
      
      // Refresh the page after 2 seconds to show the new document
      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload file' })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (!uploading) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  return (
    <div className="space-y-4">
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-primary bg-primary/5' : 'border-dark-100'}
          ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer hover:border-primary/50'}
        `}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => !uploading && document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          className="hidden"
          accept=".pdf,.txt,.doc,.docx"
          onChange={(e) => handleFileSelect(e.target.files)}
          disabled={uploading}
        />

        <div className="flex flex-col items-center gap-4">
          {uploading ? (
            <>
              <Loader2 className="h-12 w-12 text-primary animate-spin" />
              <div>
                <p className="text-white font-medium">Uploading...</p>
                <p className="text-sm text-dark-800 mt-1">Please wait while we process your file</p>
              </div>
            </>
          ) : (
            <>
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-white font-medium mb-1">
                  Drag & drop your file here, or click to browse
                </p>
                <p className="text-sm text-dark-800">
                  Supported formats: PDF, TXT, DOC, DOCX (Max 5MB)
                </p>
              </div>
              <Button variant="outline" size="sm" type="button">
                <FileText className="h-4 w-4 mr-2" />
                Choose File
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className={`
          flex items-start gap-3 p-4 rounded-lg border
          ${message.type === 'success' 
            ? 'bg-green-500/10 border-green-500/20 text-green-500' 
            : 'bg-red-500/10 border-red-500/20 text-red-500'
          }
        `}>
          {message.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 flex-shrink-0 mt-0.5" />
          ) : (
            <XCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          )}
          <p className="text-sm">{message.text}</p>
        </div>
      )}
    </div>
  )
}

