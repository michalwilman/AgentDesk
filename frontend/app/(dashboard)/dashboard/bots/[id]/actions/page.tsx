import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { ActionsConfigForm } from '@/components/dashboard/actions-config-form'
import { UsageDashboard } from '@/components/dashboard/usage-dashboard'

export default async function BotActionsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get bot details
  const { data: bot, error: botError } = await supabase
    .from('bots')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (botError || !bot) {
    redirect('/dashboard')
  }

  // Get user's plan type
  const { data: userData } = await supabase
    .from('users')
    .select('plan_type')
    .eq('id', user.id)
    .single()

  const planType = (userData?.plan_type || 'starter') as 'starter' | 'pro' | 'enterprise'

  // Get bot actions config
  let { data: actionsConfig } = await supabase
    .from('bot_actions_config')
    .select('*')
    .eq('bot_id', params.id)
    .single()

  // Create default config if doesn't exist
  if (!actionsConfig) {
    const { data: newConfig } = await supabase
      .from('bot_actions_config')
      .insert([{ bot_id: params.id }])
      .select()
      .single()
    
    actionsConfig = newConfig
  }

  return (
    <div className="space-y-6">
      <Link href={`/dashboard/bots/${params.id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Bot
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-white">Bot Actions</h1>
        <p className="text-dark-800 mt-2">
          Configure what actions {bot.name} can perform automatically
        </p>
      </div>

      {/* Usage Dashboard */}
      {planType !== 'starter' && (
        <UsageDashboard botId={params.id} planType={planType} />
      )}

      <ActionsConfigForm bot={bot} config={actionsConfig} />
    </div>
  )
}

