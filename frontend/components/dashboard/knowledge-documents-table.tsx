'use client'

import { useEffect, useState } from 'react'
import { FileText, Trash2, Loader2, CheckCircle2, AlertCircle, Clock, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

interface Document {
  id: string
  file_name: string
  file_size: number
  file_type: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  word_count: number
  created_at: string
  source_url: string
  content: string
}

interface KnowledgeDocumentsTableProps {
  botId: string
}

export function KnowledgeDocumentsTable({ botId }: KnowledgeDocumentsTableProps) {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    fetchDocuments()
  }, [botId])

  const fetchDocuments = async () => {
    try {
      // Fetch from scraped_content table
      const { data, error } = await supabase
        .from('scraped_content')
        .select('*')
        .eq('bot_id', botId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching documents:', error)
      } else {
        // Transform the data to match our interface
        const transformedDocs = (data || []).map(doc => ({
          id: doc.id,
          file_name: doc.source_url === 'document' ? 'Uploaded Document' : doc.source_url,
          file_size: doc.content?.length || 0,
          file_type: doc.source_url === 'document' ? 'Document' : 'Website',
          processing_status: 'completed' as const,
          word_count: doc.word_count || 0,
          created_at: doc.created_at,
          source_url: doc.source_url,
          content: doc.content || '',
        }))
        setDocuments(transformedDocs)
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
      // Delete from scraped_content
      const { error: contentError } = await supabase
        .from('scraped_content')
        .delete()
        .eq('id', documentId)

      if (contentError) {
        console.error('Error deleting content:', contentError)
        alert('Failed to delete document')
        return
      }

      // Delete associated embeddings
      const { error: embeddingsError } = await supabase
        .from('knowledge_embeddings')
        .delete()
        .eq('content_id', documentId)

      if (embeddingsError) {
        console.error('Error deleting embeddings:', embeddingsError)
      }

      // Update local state
      setDocuments(documents.filter(doc => doc.id !== documentId))
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
      {documents.map((doc) => {
        const isWebsite = doc.source_url !== 'document'
        const displayName = isWebsite ? doc.source_url : doc.file_name
        
        return (
          <div
            key={doc.id}
            className="flex items-center justify-between p-4 bg-dark-50 rounded-lg border border-dark-100 hover:border-primary/50 transition-colors"
          >
            <div className="flex items-start gap-3 flex-1">
              {isWebsite ? (
                <Globe className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
              ) : (
                <FileText className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-white font-medium truncate">{displayName}</h4>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    isWebsite 
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                      : 'bg-primary/20 text-primary border border-primary/30'
                  }`}>
                    {isWebsite ? 'Website Crawl' : 'Manual Upload'}
                  </span>
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
        )
      })}
    </div>
  )
}

