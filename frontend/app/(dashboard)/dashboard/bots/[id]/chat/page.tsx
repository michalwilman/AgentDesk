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
    <div className="fixed inset-0 bg-gradient-dark">
      {/* Header Bar */}
      <div className="absolute top-0 left-0 right-0 bg-dark-50 border-b border-primary/20 px-6 py-4 z-10 shadow-glow">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
        <div className="mt-2">
          <h1 className="text-xl font-semibold text-white">Test Chat - {bot.name}</h1>
          <p className="text-sm text-dark-800">Preview how your bot looks and interacts</p>
        </div>
      </div>

      {/* Floating Widget Preview */}
      <BotChatPreview
        botId={bot.id}
        botName={bot.name}
        botToken={bot.api_token}
        primaryColor={bot.primary_color}
        welcomeMessage={bot.welcome_message}
        language={bot.language}
        avatarUrl={bot.avatar_url}
      />

      {/* Demo Content - Shows how widget appears on a real site */}
      <div className="pt-32 px-8 max-w-4xl mx-auto">
        <div className="bg-[#141414] rounded-lg shadow-glow border border-primary/20 p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            {bot.language === 'he' ? 'דף הדגמה' : 'Demo Page'}
          </h2>
          <p className="text-dark-800 mb-4">
            {bot.language === 'he' 
              ? 'זהו דף הדגמה שמראה איך הבוט שלך יופיע באתר אמיתי. הבוט מוצג כחלון צף בפינה הימנית התחתונה.'
              : 'This is a demo page showing how your bot will appear on a real website. The bot is displayed as a floating widget in the bottom-right corner.'}
          </p>
          <div className="space-y-3 text-dark-800">
            <p>
              {bot.language === 'he'
                ? '• הבוט נפתח כחלון צף מעוגל'
                : '• The bot opens as a rounded floating window'}
            </p>
            <p>
              {bot.language === 'he'
                ? '• בועות הודעה מעוגלות עם אווטאר'
                : '• Rounded message bubbles with avatar'}
            </p>
            <p>
              {bot.language === 'he'
                ? '• צבעים מותאמים אישית'
                : '• Custom brand colors'}
            </p>
            <p>
              {bot.language === 'he'
                ? '• תמיכה מלאה בעברית (RTL)'
                : '• Full Hebrew support (RTL)'}
            </p>
          </div>
        </div>

        <div className="bg-[#141414] rounded-lg shadow-glow border border-primary/20 p-8">
          <h3 className="text-xl font-semibold text-white mb-3">
            {bot.language === 'he' ? 'מידע נוסף' : 'Additional Information'}
          </h3>
          <p className="text-dark-800">
            {bot.language === 'he'
              ? 'נסה לשוחח עם הבוט בפינה - הוא משתמש במידע שהוספת במסד הידע שלו.'
              : 'Try chatting with the bot in the corner - it uses the knowledge base you\'ve added.'}
          </p>
        </div>
      </div>
    </div>
  )
}

