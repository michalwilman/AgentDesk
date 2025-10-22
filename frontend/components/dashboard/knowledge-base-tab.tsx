'use client'

import { useState, useEffect } from 'react'
import { Upload, Globe, RefreshCw } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import FileUploadZone from './file-upload-zone'
import DocumentsTable from './documents-table'
import WebsiteCrawlingTab from './website-crawling-tab'
import { documentsApi, Document, getMaxFileSizeForTier } from '@/lib/api/documents'
import { Button } from '@/components/ui/button'

interface KnowledgeBaseTabProps {
  botId: string
  language: string
}

export default function KnowledgeBaseTab({
  botId,
  language,
}: KnowledgeBaseTabProps) {
  const [activeTab, setActiveTab] = useState<'documents' | 'crawling'>('documents')
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({})
  const [deleting, setDeleting] = useState<string>('')
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [userTier, setUserTier] = useState<string>('free')

  const isHebrew = language === 'he'

  // Load user subscription tier
  useEffect(() => {
    const loadUserTier = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          const { data: userData } = await supabase
            .from('users')
            .select('subscription_tier')
            .eq('id', user.id)
            .single()

          if (userData?.subscription_tier) {
            setUserTier(userData.subscription_tier)
          }
        }
      } catch (err) {
        console.error('Failed to load user tier:', err)
        // Default to free tier on error
        setUserTier('free')
      }
    }

    loadUserTier()
  }, [])

  useEffect(() => {
    loadDocuments()
  }, [botId])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await documentsApi.getDocuments(
        botId,
        session.access_token,
      )
      setDocuments(response.documents)
    } catch (err: any) {
      console.error('Failed to load documents:', err)
      setError(err.message || 'Failed to load documents')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (files: File[]) => {
    setUploading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      let uploadedCount = 0

      for (const file of files) {
        try {
          await documentsApi.uploadDocument(
            botId,
            file,
            session.access_token,
            (progress) => {
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: progress,
              }))
            },
          )
          uploadedCount++
        } catch (err: any) {
          console.error(`Failed to upload ${file.name}:`, err)
          throw new Error(
            err.response?.data?.message || `Failed to upload ${file.name}`,
          )
        }
      }

      setSuccess(
        isHebrew
          ? `${uploadedCount} קבצים הועלו בהצלחה`
          : `${uploadedCount} file(s) uploaded successfully`,
      )

      // Reload documents
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to upload documents')
    } finally {
      setUploading(false)
      setUploadProgress({})
    }
  }

  const handleDelete = async (documentId: string) => {
    setDeleting(documentId)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      await documentsApi.deleteDocument(
        documentId,
        botId,
        session.access_token,
      )

      setSuccess(isHebrew ? 'המסמך נמחק בהצלחה' : 'Document deleted successfully')

      // Reload documents
      await loadDocuments()
    } catch (err: any) {
      setError(err.message || 'Failed to delete document')
    } finally {
      setDeleting('')
    }
  }

  const getMaxFileSize = () => {
    // Get max size based on user tier and Supabase project limits
    return getMaxFileSizeForTier(userTier)
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-primary/20">
        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'documents'
              ? 'text-primary border-b-2 border-primary'
              : 'text-[#666666] hover:text-white'
          }`}
        >
          <Upload className="h-4 w-4" />
          {isHebrew ? 'העלאת מסמכים' : 'Upload Documents'}
        </button>
        <button
          onClick={() => setActiveTab('crawling')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === 'crawling'
              ? 'text-primary border-b-2 border-primary'
              : 'text-[#666666] hover:text-white'
          }`}
        >
          <Globe className="h-4 w-4" />
          {isHebrew ? 'סריקת אתרים' : 'Website Crawling'}
        </button>
      </div>

      {/* Success/Error Messages */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
          {success}
        </div>
      )}

      {/* Upload Progress */}
      {Object.keys(uploadProgress).length > 0 && (
        <div className="space-y-2">
          {Object.entries(uploadProgress).map(([fileName, progress]) => (
            <div key={fileName} className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-white truncate max-w-xs">{fileName}</span>
                <span className="text-[#666666]">{progress}%</span>
              </div>
              <div className="w-full bg-dark-50 rounded-full h-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {/* Upload Section */}
          <div>
            <h3 className="text-lg font-medium text-white mb-4">
              {isHebrew ? 'העלה מסמכים חדשים' : 'Upload New Documents'}
            </h3>
            <FileUploadZone
              onFileSelect={handleFileUpload}
              language={language}
              maxSizeMB={getMaxFileSize()}
              multiple={true}
              disabled={uploading}
            />
          </div>

          {/* Documents List */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-white">
                {isHebrew ? 'מסמכים קיימים' : 'Existing Documents'}
                {documents.length > 0 && (
                  <span className="ml-2 text-sm text-[#666666]">
                    ({documents.length})
                  </span>
                )}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={loadDocuments}
                disabled={loading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`}
                />
              </Button>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <DocumentsTable
                documents={documents}
                language={language}
                onDelete={handleDelete}
                isDeleting={deleting}
              />
            )}
          </div>
        </div>
      )}

      {activeTab === 'crawling' && (
        <WebsiteCrawlingTab botId={botId} language={language} />
      )}
    </div>
  )
}

