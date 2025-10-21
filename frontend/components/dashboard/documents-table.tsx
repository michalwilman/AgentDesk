'use client'

import { useState } from 'react'
import { Trash2, FileText, AlertCircle, CheckCircle, Clock, Loader } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Document, formatFileSize, getFileTypeInfo } from '@/lib/api/documents'

interface DocumentsTableProps {
  documents: Document[]
  language: string
  onDelete: (documentId: string) => void
  isDeleting?: string
}

export default function DocumentsTable({
  documents,
  language,
  onDelete,
  isDeleting,
}: DocumentsTableProps) {
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const isHebrew = language === 'he'

  // Sort documents
  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0

    if (sortBy === 'name') {
      comparison = a.file_name.localeCompare(b.file_name)
    } else if (sortBy === 'date') {
      comparison =
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    } else if (sortBy === 'size') {
      comparison = a.file_size - b.file_size
    }

    return sortOrder === 'asc' ? comparison : -comparison
  })

  const handleSort = (column: 'name' | 'date' | 'size') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder('desc')
    }
  }

  const handleDelete = (documentId: string) => {
    if (deleteConfirm === documentId) {
      onDelete(documentId)
      setDeleteConfirm(null)
    } else {
      setDeleteConfirm(documentId)
      // Reset confirmation after 3 seconds
      setTimeout(() => setDeleteConfirm(null), 3000)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat(isHebrew ? 'he-IL' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getStatusBadge = (status: Document['processing_status']) => {
    const statusConfig = {
      pending: {
        icon: Clock,
        text: isHebrew ? 'ממתין' : 'Pending',
        color: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
      },
      processing: {
        icon: Loader,
        text: isHebrew ? 'מעבד' : 'Processing',
        color: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      },
      completed: {
        icon: CheckCircle,
        text: isHebrew ? 'הושלם' : 'Completed',
        color: 'text-green-500 bg-green-500/10 border-green-500/20',
      },
      failed: {
        icon: AlertCircle,
        text: isHebrew ? 'נכשל' : 'Failed',
        color: 'text-red-500 bg-red-500/10 border-red-500/20',
      },
    }

    const config = statusConfig[status]
    const Icon = config.icon

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.color}`}
      >
        <Icon className="h-3.5 w-3.5" />
        {config.text}
      </span>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4">
        <div className="p-4 rounded-full bg-dark-50 mb-4">
          <FileText className="h-8 w-8 text-[#666666]" />
        </div>
        <h3 className="text-lg font-medium text-white mb-2">
          {isHebrew ? 'אין מסמכים עדיין' : 'No documents yet'}
        </h3>
        <p className="text-sm text-[#666666] text-center max-w-md">
          {isHebrew
            ? 'העלה מסמכים כדי להתחיל לבנות את בסיס הידע של הבוט שלך'
            : "Upload documents to start building your bot's knowledge base"}
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-primary/20">
            <th
              className="px-4 py-3 text-left text-sm font-medium text-white cursor-pointer hover:bg-dark-50 transition-colors"
              onClick={() => handleSort('name')}
            >
              <div className="flex items-center gap-2">
                {isHebrew ? 'שם קובץ' : 'File Name'}
                {sortBy === 'name' && (
                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">
              {isHebrew ? 'סוג' : 'Type'}
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-white cursor-pointer hover:bg-dark-50 transition-colors"
              onClick={() => handleSort('size')}
            >
              <div className="flex items-center gap-2">
                {isHebrew ? 'גודל' : 'Size'}
                {sortBy === 'size' && (
                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">
              {isHebrew ? 'סטטוס' : 'Status'}
            </th>
            <th className="px-4 py-3 text-left text-sm font-medium text-white">
              {isHebrew ? 'מילים' : 'Words'}
            </th>
            <th
              className="px-4 py-3 text-left text-sm font-medium text-white cursor-pointer hover:bg-dark-50 transition-colors"
              onClick={() => handleSort('date')}
            >
              <div className="flex items-center gap-2">
                {isHebrew ? 'תאריך' : 'Date'}
                {sortBy === 'date' && (
                  <span className="text-xs">{sortOrder === 'asc' ? '↑' : '↓'}</span>
                )}
              </div>
            </th>
            <th className="px-4 py-3 text-right text-sm font-medium text-white">
              {isHebrew ? 'פעולות' : 'Actions'}
            </th>
          </tr>
        </thead>
        <tbody>
          {sortedDocuments.map((doc) => {
            const fileInfo = getFileTypeInfo(doc.file_type)
            return (
              <tr
                key={doc.id}
                className="border-b border-primary/10 hover:bg-dark-50 transition-colors"
              >
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{fileInfo.icon}</span>
                    <span className="text-sm text-white truncate max-w-xs">
                      {doc.file_name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span
                    className="inline-block px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{ backgroundColor: fileInfo.color }}
                  >
                    {doc.file_type.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {formatFileSize(doc.file_size)}
                </td>
                <td className="px-4 py-3">{getStatusBadge(doc.processing_status)}</td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {doc.word_count ? doc.word_count.toLocaleString() : '-'}
                </td>
                <td className="px-4 py-3 text-sm text-[#666666]">
                  {formatDate(doc.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(doc.id)}
                    disabled={isDeleting === doc.id}
                    className={`${
                      deleteConfirm === doc.id
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'text-red-500 hover:bg-red-500/10'
                    }`}
                  >
                    {isDeleting === doc.id ? (
                      <Loader className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    {deleteConfirm === doc.id && (
                      <span className="ml-2">
                        {isHebrew ? 'לחץ שוב לאישור' : 'Click again'}
                      </span>
                    )}
                  </Button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

