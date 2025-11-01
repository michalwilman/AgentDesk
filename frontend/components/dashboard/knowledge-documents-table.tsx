'use client'

import { useEffect, useState } from 'react'
import { FileText, Trash2, Loader2, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Document {
  id: string
  file_name: string
  file_size: number
  file_type: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  word_count: number
  created_at: string
}

interface KnowledgeDocumentsTableProps {
  botId: string
}

export function KnowledgeDocumentsTable({ botId }: KnowledgeDocumentsTableProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    fetchDocuments()
  }, [botId])

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('supabase.auth.token')
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/documents/${botId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDocuments(data.documents || [])
      }
    } catch (error) {
      console.error('Failed to fetch documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    setDeleting(documentId)
    try {
      const token = localStorage.getItem('supabase.auth.token')
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/documents/${documentId}/${botId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      )

      if (response.ok) {
        setDocuments(documents.filter(doc => doc.id !== documentId))
      } else {
        alert('Failed to delete document')
      }
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document')
    } finally {
      setDeleting(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      case 'processing':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed'
      case 'processing':
        return 'Processing...'
      case 'pending':
        return 'Pending'
      case 'failed':
        return 'Failed'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="h-12 w-12 text-dark-800 mx-auto mb-4" />
        <p className="text-dark-800 mb-2">No documents uploaded yet</p>
        <p className="text-sm text-dark-800">
          Upload your first document to start training your bot
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center justify-between p-4 bg-dark-50 rounded-lg border border-dark-100 hover:border-primary/50 transition-colors"
        >
          <div className="flex items-start gap-3 flex-1">
            <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-white font-medium truncate">{doc.file_name}</h4>
                <span className="text-xs text-dark-800 uppercase">{doc.file_type}</span>
              </div>
              <div className="flex items-center gap-4 text-sm text-dark-800">
                <span>{formatFileSize(doc.file_size)}</span>
                {doc.word_count > 0 && (
                  <span>{doc.word_count.toLocaleString()} words</span>
                )}
                <span>{new Date(doc.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                {getStatusIcon(doc.processing_status)}
                <span className={`text-xs ${
                  doc.processing_status === 'completed' ? 'text-green-500' :
                  doc.processing_status === 'failed' ? 'text-red-500' :
                  'text-yellow-500'
                }`}>
                  {getStatusText(doc.processing_status)}
                </span>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDelete(doc.id)}
            disabled={deleting === doc.id}
            className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            {deleting === doc.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      ))}
    </div>
  )
}

