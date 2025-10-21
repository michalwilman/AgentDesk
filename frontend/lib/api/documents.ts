import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'

export interface Document {
  id: string
  file_name: string
  file_size: number
  file_type: string
  processing_status: 'pending' | 'processing' | 'completed' | 'failed'
  word_count: number
  created_at: string
  metadata?: {
    original_name?: string
    mime_type?: string
    upload_date?: string
    error?: string
  }
}

export interface UploadDocumentResponse {
  message: string
  document: Document
}

export interface GetDocumentsResponse {
  documents: Document[]
  count: number
}

export interface DeleteDocumentResponse {
  message: string
}

export const documentsApi = {
  /**
   * Upload a document for a bot
   */
  async uploadDocument(
    botId: string,
    file: File,
    token: string,
    onProgress?: (progress: number) => void,
  ): Promise<UploadDocumentResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('botId', botId)

    const response = await axios.post<UploadDocumentResponse>(
      `${API_URL}/documents/upload`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            )
            onProgress(progress)
          }
        },
      },
    )

    return response.data
  },

  /**
   * Get all documents for a bot
   */
  async getDocuments(
    botId: string,
    token: string,
  ): Promise<GetDocumentsResponse> {
    const response = await axios.get<GetDocumentsResponse>(
      `${API_URL}/documents/${botId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  },

  /**
   * Delete a document
   */
  async deleteDocument(
    documentId: string,
    botId: string,
    token: string,
  ): Promise<DeleteDocumentResponse> {
    const response = await axios.delete<DeleteDocumentResponse>(
      `${API_URL}/documents/${documentId}/${botId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    )

    return response.data
  },
}

/**
 * Format file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Get file type icon/color based on file extension
 */
export function getFileTypeInfo(fileType: string): {
  icon: string
  color: string
} {
  const typeMap: Record<string, { icon: string; color: string }> = {
    pdf: { icon: '📄', color: '#DC2626' },
    text: { icon: '📝', color: '#2563EB' },
    doc: { icon: '📘', color: '#1D4ED8' },
    docx: { icon: '📘', color: '#1D4ED8' },
  }

  return typeMap[fileType] || { icon: '📎', color: '#6B7280' }
}

/**
 * Get maximum file size for a subscription tier
 * Takes into account both tier limits and Supabase project limits
 * 
 * @param tier - User subscription tier (free, pro, business, enterprise)
 * @returns Maximum file size in MB
 */
export function getMaxFileSizeForTier(tier: string): number {
  // Supabase project limit (should match backend SUPABASE_MAX_FILE_SIZE)
  // Default to 50MB for free tier, update when upgrading Supabase plan
  const SUPABASE_PROJECT_LIMIT_MB = 50

  // Tier-based limits (ideal limits)
  const tierLimits: Record<string, number> = {
    free: 5,      // 5MB
    pro: 20,      // 20MB
    business: 100, // 100MB
    enterprise: 100, // 100MB
  }

  const tierLimit = tierLimits[tier] || tierLimits.free

  // Return minimum between tier limit and project limit
  return Math.min(tierLimit, SUPABASE_PROJECT_LIMIT_MB)
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } {
  const allowedTypes = [
    'application/pdf',
    'text/plain',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ]

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'Invalid file type. Supported: PDF, TXT, DOC, DOCX',
    }
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    }
  }

  return { valid: true }
}

