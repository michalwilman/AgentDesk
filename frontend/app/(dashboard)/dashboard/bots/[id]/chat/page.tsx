import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { BotChatPreview } from '@/components/dashboard/bot-chat-preview'
import { ArrowLeft } from 'lucide-react'

export default async function BotChatPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bot } = await supabase
    .from('bots')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user?.id)
    .single()

  if (!bot) {
    notFound()
  }

  return (
    <div className="h-[calc(100vh-8rem)]">
      <div className="mb-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <div className="h-[calc(100%-3rem)]">
        <BotChatPreview
          botName={bot.name}
          botToken={bot.api_token}
          primaryColor={bot.primary_color}
          welcomeMessage={bot.welcome_message}
          language={bot.language}
        />
      </div>
    </div>
  )
}

