'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface DeleteBotButtonProps {
  botId: string
  botName: string
}

export function DeleteBotButton({ botId, botName }: DeleteBotButtonProps) {
  const router = useRouter()
  const [deleting, setDeleting] = useState(false)

  const handleDelete = async () => {
    const confirmed = confirm(
      `Are you sure you want to delete "${botName}"?\n\nThis action cannot be undone. All chat history and knowledge base will be permanently deleted.`
    )

    if (!confirmed) return

    setDeleting(true)

    try {
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/bots/${botId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.message || 'Failed to delete bot')
      }

      // Redirect to dashboard with success message
      router.push('/dashboard?deleted=true')
      router.refresh()
    } catch (error: any) {
      alert(error.message || 'Failed to delete bot')
      setDeleting(false)
    }
  }

  return (
    <Button
      variant="outline"
      className="w-full border-red-300 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-400"
      onClick={handleDelete}
      disabled={deleting}
    >
      <Trash2 className="h-4 w-4 mr-2" />
      {deleting ? 'Deleting...' : 'Delete Bot'}
    </Button>
  )
}

