'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import axios from 'axios'

interface TrainedStatusProps {
  botId: string
}

export function TrainedStatus({ botId }: TrainedStatusProps) {
  const [hasTrained, setHasTrained] = useState(false)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkTrainedStatus = async () => {
      try {
        const supabase = createClient()
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (!session) {
          return
        }

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001/api'}/bots/${botId}/has-knowledge`,
          {
            headers: {
              Authorization: `Bearer ${session.access_token}`,
            },
          }
        )

        setHasTrained(response.data.hasTrained)
      } catch (error) {
        console.error('Failed to check trained status:', error)
        setHasTrained(false)
      } finally {
        setLoading(false)
      }
    }

    checkTrainedStatus()
  }, [botId])

  const handleClick = () => {
    if (hasTrained) {
      // Navigate to knowledge base tab
      router.push(`/dashboard/bots/${botId}/edit?tab=knowledge`)
    }
  }

  if (loading) {
    return (
      <span className="px-2 py-1 rounded-full text-xs font-medium bg-dark-100 text-dark-800 border border-dark-100 animate-pulse">
        ...
      </span>
    )
  }

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium ${
        hasTrained
          ? 'bg-primary/20 text-primary border border-primary/20 cursor-pointer hover:bg-primary/30 transition-colors'
          : 'bg-dark-100 text-dark-800 border border-dark-100'
      }`}
      onClick={handleClick}
      role={hasTrained ? 'button' : undefined}
      title={hasTrained ? 'Click to view knowledge base' : undefined}
    >
      {hasTrained ? 'Yes' : 'No'}
    </span>
  )
}

