import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot as BotIcon, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { SubscriptionBadge } from '@/components/subscription/subscription-badge'
import { CreateBotButton } from '@/components/dashboard/create-bot-button'
import { DashboardHeroCard } from '@/components/dashboard/dashboard-hero-card'
import { DashboardStats } from '@/components/dashboard/dashboard-stats'
import { DashboardActivityChart } from '@/components/dashboard/dashboard-activity-chart'
import { DashboardBotsPerformance } from '@/components/dashboard/dashboard-bots-performance'
import { DashboardRecentActivity } from '@/components/dashboard/dashboard-recent-activity'
import { DashboardAlerts } from '@/components/dashboard/dashboard-alerts'
import { DashboardQuickActions } from '@/components/dashboard/dashboard-quick-actions'
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

  // Get total conversations count
  let totalChats = 0
  if (botIds.length > 0) {
    const { count } = await supabase
      .from('conversations')
      .select('*', { count: 'exact', head: true })
      .in('bot_id', botIds)
    totalChats = count || 0
  }

  // Get total messages count
  let totalMessages = 0
  if (botIds.length > 0) {
    const { count } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .in('bot_id', botIds)
    totalMessages = count || 0
  }

  // Get average satisfaction from bot_analytics
  let avgSatisfaction = null
  if (botIds.length > 0) {
    const { data: analyticsData } = await supabase
      .from('bot_analytics')
      .select('avg_satisfaction')
      .in('bot_id', botIds)
    
    avgSatisfaction = analyticsData && analyticsData.length > 0
      ? analyticsData.reduce((sum, item) => sum + (item.avg_satisfaction || 0), 0) / analyticsData.length
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
    const { data: convData } = await supabase
      .from('conversations')
      .select('created_at')
      .in('bot_id', botIds)
      .gte('created_at', subDays(new Date(), 7).toISOString())
    conversationsData = convData || []

    const { data: msgData } = await supabase
      .from('messages')
      .select('created_at')
      .in('bot_id', botIds)
      .gte('created_at', subDays(new Date(), 7).toISOString())
    messagesData = msgData || []
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

  // Get recent activity
  let recentConversations: any[] = []
  if (botIds.length > 0) {
    const { data } = await supabase
      .from('conversations')
      .select('id, created_at, bot_id')
      .in('bot_id', botIds)
      .order('created_at', { ascending: false })
      .limit(5)
    recentConversations = data || []
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-dark-800 mt-1">Welcome back! Here's what's happening with your bots.</p>
        </div>
        <CreateBotButton 
          hasExistingBot={hasExistingBot} 
          subscriptionStatus={userData?.subscription_status}
        />
      </div>

      {/* Subscription Status Badge */}
      <SubscriptionBadge variant="full" />

      {/* My Bots Section - MOVED TO TOP */}
      {bots && bots.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">My Bots</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className="hover:shadow-md transition-shadow hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{bot.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {bot.description || 'No description'}
                      </CardDescription>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.is_active
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : 'bg-dark-100 text-dark-800 border border-dark-100'
                      }`}
                    >
                      {bot.is_active ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-dark-800">
                      <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                      <span>Language: {bot.language === 'he' ? 'Hebrew' : 'English'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-800">Status:</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        botTrainingStatus[bot.id]
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {botTrainingStatus[bot.id] ? 'Trained' : 'Not Trained'}
                      </span>
                    </div>
                    <div className="text-sm text-[#666666] pt-2 border-t border-dark-100">
                      Created {formatDate(bot.created_at)}
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          Manage
                        </Button>
                      </Link>
                      <Link href={`/dashboard/bots/${bot.id}/chat`} className="flex-1">
                        <Button size="sm" className="w-full">
                          Test Chat
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Bots State */}
      {(!bots || bots.length === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BotIcon className="h-16 w-16 text-primary/40 mb-4" />
            <h3 className="text-xl font-semibold mb-2 text-white">No bots yet</h3>
            <p className="text-dark-800 mb-6 text-center">
              Create your first AI chatbot to get started
            </p>
            <Link href="/dashboard/bots/new">
              <Button>
                Create Your First Bot
              </Button>
            </Link>
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

      {/* Quick Actions */}
      <DashboardQuickActions />
    </div>
  )
}
