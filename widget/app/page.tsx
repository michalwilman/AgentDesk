'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { ChatWidget } from '@/components/chat-widget'

export default function WidgetPage() {
  const searchParams = useSearchParams()
  const [botToken, setBotToken] = useState<string | null>(null)

  useEffect(() => {
    // Get bot token from URL parameter
    const token = searchParams.get('botToken')
    if (token) {
      setBotToken(token)
    }
  }, [searchParams])

  if (!botToken) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-center">
          <p className="text-gray-600">No bot token provided</p>
        </div>
      </div>
    )
  }

  return <ChatWidget botToken={botToken} />
}

