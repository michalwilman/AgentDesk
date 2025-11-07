import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Bot as BotIcon } from 'lucide-react'
import { SubscriptionBadge } from '@/components/subscription/subscription-badge'
import { DashboardHeroCard } from '@/components/dashboard/dashboard-hero-card'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardActivityChart } from '@/components/dashboard/dashboard-activity-chart'
import { DashboardBotsPerformance } from '@/components/dashboard/dashboard-bots-performance'
import { DashboardRecentActivity } from '@/components/dashboard/dashboard-recent-activity'
import { DashboardAlerts } from '@/components/dashboard/dashboard-alerts'
import { UsageDashboard } from '@/components/dashboard/usage-dashboard'
import { DashboardContent } from '@/components/dashboard/dashboard-content'
import { format, subDays } from 'date-fns'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's bots
  const { data: bots } = await supabase
    .from('bots')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  // Get user subscription status
  const { data: userData } = await supabase
    .from('users')
    .select('trial_ends_at, subscription_status')
    .eq('id', user?.id)
    .single()

  // Calculate stats
  const activeBots = bots?.filter(bot => bot.is_active).length || 0
  const totalBots = bots?.length || 0
  const hasExistingBot = totalBots > 0
  const botIds = bots?.map(b => b.id) || []

  // Get analytics data from bot_analytics table (pre-aggregated)
  let totalChats = 0
  let totalMessages = 0
  
  if (botIds.length > 0) {
    for (const botId of botIds) {
      const { data: analytics } = await supabase
        .from('bot_analytics')
        .select('total_chats, total_messages')
        .eq('bot_id', botId)
        .single()
      
      if (analytics) {
        totalChats += analytics.total_chats || 0
        totalMessages += analytics.total_messages || 0
      }
    }
  }

  // Get average satisfaction from bot_analytics for ALL user's bots
  let avgSatisfaction = null
  if (botIds.length > 0) {
    const satisfactionValues = await Promise.all(
      botIds.map(async (botId) => {
        const { data } = await supabase
          .from('bot_analytics')
          .select('avg_satisfaction')
          .eq('bot_id', botId)
          .single()
        return data?.avg_satisfaction || null
      })
    )
    const validSatisfactions = satisfactionValues.filter(v => v !== null)
    avgSatisfaction = validSatisfactions.length > 0
      ? validSatisfactions.reduce((sum, val) => sum + val, 0) / validSatisfactions.length
      : null
  }

  // Get activity data for chart (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return format(date, 'MMM dd')
  })

  let conversationsData: any[] = []
  let messagesData: any[] = []
  
  if (botIds.length > 0) {
    // Query each bot separately and combine results
    const allConversations = await Promise.all(
      botIds.map(async (botId) => {
        const { data } = await supabase
          .from('conversations')
          .select('created_at')
          .eq('bot_id', botId)
          .gte('created_at', subDays(new Date(), 7).toISOString())
        return data || []
      })
    )
    conversationsData = allConversations.flat()

    const allMessages = await Promise.all(
      botIds.map(async (botId) => {
        const { data } = await supabase
          .from('messages')
          .select('created_at')
          .eq('bot_id', botId)
          .gte('created_at', subDays(new Date(), 7).toISOString())
        return data || []
      })
    )
    messagesData = allMessages.flat()
  }

  // Aggregate data by day
  const activityData = last7Days.map(date => {
    const conversations = conversationsData?.filter(c => 
      format(new Date(c.created_at), 'MMM dd') === date
    ).length || 0
    
    const messages = messagesData?.filter(m => 
      format(new Date(m.created_at), 'MMM dd') === date
    ).length || 0

    return { date, conversations, messages }
  })

  // Check training status for all bots (based on knowledge embeddings)
  const botTrainingStatus: { [key: string]: boolean } = {}
  for (const bot of bots || []) {
    const { count: embeddingsCount } = await supabase
      .from('knowledge_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('bot_id', bot.id)
    
    botTrainingStatus[bot.id] = !!(embeddingsCount && embeddingsCount > 0)
  }

  // Get bots performance data
  const botsPerformance = await Promise.all(
    (bots || []).map(async (bot) => {
      const { count: botChats } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('bot_id', bot.id)

      const { data: botAnalytics } = await supabase
        .from('bot_analytics')
        .select('avg_satisfaction')
        .eq('bot_id', bot.id)
        .single()

      return {
        id: bot.id,
        name: bot.name,
        is_active: bot.is_active,
        is_trained: botTrainingStatus[bot.id], // Real training status from embeddings
        language: bot.language,
        total_chats: botChats || 0,
        avg_satisfaction: botAnalytics?.avg_satisfaction || null,
      }
    })
  )

  // Get recent activity from ALL user's bots
  let recentConversations: any[] = []
  if (botIds.length > 0) {
    const allRecentConversations = await Promise.all(
      botIds.map(async (botId) => {
        const { data } = await supabase
          .from('conversations')
          .select('id, created_at, bot_id')
          .eq('bot_id', botId)
          .order('created_at', { ascending: false })
          .limit(5)
        return data || []
      })
    )
    // Flatten, sort by date, and take top 5
    recentConversations = allRecentConversations
      .flat()
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 5)
  }

  const recentActivity = (recentConversations || []).map(conv => {
    const bot = bots?.find(b => b.id === conv.bot_id)
    return {
      id: conv.id,
      type: 'conversation' as const,
      title: 'New conversation started',
      description: 'A visitor started a new chat',
      timestamp: conv.created_at,
      botId: conv.bot_id,
      botName: bot?.name,
    }
  })

  // Generate alerts
  const alerts = []
  
  // Check for untrained bots (check if they have knowledge embeddings)
  const untrainedBots = []
  for (const bot of bots || []) {
    const { count: embeddingsCount } = await supabase
      .from('knowledge_embeddings')
      .select('*', { count: 'exact', head: true })
      .eq('bot_id', bot.id)
    
    if (!embeddingsCount || embeddingsCount === 0) {
      untrainedBots.push(bot)
    }
  }
  
  if (untrainedBots.length > 0) {
    alerts.push({
      id: 'untrained-bots',
      type: 'warning' as const,
      title: `${untrainedBots.length} bot${untrainedBots.length > 1 ? 's' : ''} need${untrainedBots.length === 1 ? 's' : ''} training`,
      description: 'Add knowledge base content to improve bot responses',
      actionLabel: 'Train Bots',
      actionUrl: `/dashboard/bots/${untrainedBots[0].id}/knowledge`,
      dismissible: true,
    })
  }

  // Check for trial status
  if (userData?.subscription_status === 'trial' && userData?.trial_ends_at) {
    const trialEndsAt = new Date(userData.trial_ends_at)
    const daysLeft = Math.ceil((trialEndsAt.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysLeft <= 7 && daysLeft > 0) {
      alerts.push({
        id: 'trial-ending',
        type: 'info' as const,
        title: `Free trial ends in ${daysLeft} day${daysLeft > 1 ? 's' : ''}`,
        description: 'Upgrade now to continue using all features',
        actionLabel: 'View Plans',
        actionUrl: '/pricing',
        dismissible: false,
      })
    }
  }

  // Check for inactive bots
  const inactiveBots = bots?.filter(bot => !bot.is_active) || []
  if (inactiveBots.length > 0) {
    alerts.push({
      id: 'inactive-bots',
      type: 'warning' as const,
      title: `${inactiveBots.length} inactive bot${inactiveBots.length > 1 ? 's' : ''}`,
      description: 'Activate your bots to start receiving conversations',
      actionLabel: 'Manage Bots',
      actionUrl: '/dashboard',
      dismissible: true,
    })
  }

  return (
    <div className="space-y-8">
      {/* Subscription Status Badge */}
      <SubscriptionBadge variant="full" />

      {/* Usage Dashboard */}
      <UsageDashboard />

      {/* Main Dashboard Content with Translations */}
      <DashboardContent 
        bots={bots}
        hasExistingBot={hasExistingBot}
        subscriptionStatus={userData?.subscription_status}
        botTrainingStatus={botTrainingStatus}
      />

      {/* Overview Stats - Quick Summary */}
      {bots && bots.length > 0 && (
        <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/30">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-sm text-dark-800 mb-1">Total Bots</div>
                <div className="text-3xl font-bold text-white">{totalBots}</div>
              </div>
              <div>
                <div className="text-sm text-dark-800 mb-1">Active Bots</div>
                <div className="text-3xl font-bold text-primary">{activeBots}</div>
              </div>
              <div>
                <div className="text-sm text-dark-800 mb-1">Total Conversations</div>
                <div className="text-3xl font-bold text-white">{totalChats}</div>
              </div>
              <div>
                <div className="text-sm text-dark-800 mb-1">Total Messages</div>
                <div className="text-3xl font-bold text-white">{totalMessages}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Hero Card with Circular Display + Stats Grid */}
      {bots && bots.length > 0 && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Hero Card - Takes center position */}
          <div className="lg:col-span-1">
            <DashboardHeroCard
              totalChats={totalChats || 0}
              trend={23}
              label="Total Conversations"
              sublabel="All time chats"
            />
          </div>

          {/* Stats Grid - Takes remaining space */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
              {/* Total Messages */}
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#666666]">
                    Total Messages
                  </CardTitle>
                  <MessageSquare className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {(totalMessages || 0).toLocaleString()}
                  </div>
                  <p className="text-xs text-dark-800">
                    Messages exchanged
                  </p>
                </CardContent>
              </Card>

              {/* Active Bots */}
              <Card className="border-primary/20 hover:border-primary/40 transition-colors">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#666666]">
                    Active Bots
                  </CardTitle>
                  <BotIcon className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {activeBots}/{totalBots}
                  </div>
                  <p className="text-xs text-dark-800">
                    {activeBots === totalBots ? 'All bots active' : `${totalBots - activeBots} inactive`}
                  </p>
                </CardContent>
              </Card>

              {/* Average Satisfaction */}
              <Card className="border-primary/20 hover:border-primary/40 transition-colors md:col-span-2">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-[#666666]">
                    Average Satisfaction
                  </CardTitle>
                  <span className="text-2xl">⭐</span>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {avgSatisfaction ? avgSatisfaction.toFixed(1) : 'N/A'}
                    {avgSatisfaction && <span className="text-lg text-dark-800">/5.0</span>}
                  </div>
                  <p className="text-xs text-dark-800">
                    {avgSatisfaction ? 'Customer rating' : 'No ratings yet'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Activity Chart */}
      {bots && bots.length > 0 && (
        <DashboardActivityChart data={activityData} />
      )}

      {/* Two Column Layout */}
      {bots && bots.length > 0 && (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Bots Performance */}
          <DashboardBotsPerformance bots={botsPerformance} />

          {/* Recent Activity */}
          <DashboardRecentActivity activities={recentActivity} />
        </div>
      )}

      {/* Alerts */}
      {alerts.length > 0 && (
        <DashboardAlerts alerts={alerts} />
      )}
    </div>
  )
}
