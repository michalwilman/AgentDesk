import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AnalyticsCharts } from '@/components/dashboard/analytics-charts'
import { TopQuestions } from '@/components/dashboard/top-questions'
import { TrafficSources } from '@/components/dashboard/traffic-sources'
import { ExportReportButton } from '@/components/dashboard/export-report-button'
import { ArrowLeft, BarChart3, MessageSquare, Star, Clock, TrendingUp, TrendingDown } from 'lucide-react'

export default async function AnalyticsPage({ params }: { params: { id: string } }) {
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

  // Get analytics data
  const { data: analytics } = await supabase
    .from('bot_analytics')
    .select('*')
    .eq('bot_id', params.id)
    .single()

  // Get recent conversations
  const { data: conversations, count: conversationsCount } = await supabase
    .from('conversations')
    .select('*', { count: 'exact' })
    .eq('bot_id', params.id)
    .order('created_at', { ascending: false })
    .limit(10)

  // Get total messages
  const { count: messagesCount } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('bot_id', params.id)

  // Get messages for the last 7 days for chart
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('created_at, role')
    .eq('bot_id', params.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  // Get conversations for the last 7 days
  const { data: recentConversations } = await supabase
    .from('conversations')
    .select('created_at, source, metadata')
    .eq('bot_id', params.id)
    .gte('created_at', sevenDaysAgo.toISOString())
    .order('created_at', { ascending: true })

  const totalChats = conversationsCount || analytics?.total_chats || 0
  const totalMessages = messagesCount || analytics?.total_messages || 0
  const avgSatisfaction = analytics?.avg_satisfaction || null
  const avgResponseTime = 1.2 // This would come from actual metrics

  // Calculate trends (would be calculated from historical data)
  const chatsTrend = 23
  const messagesTrend = 15
  const satisfactionTrend = 0.3

  const handleExportReport = () => {
    // This would trigger a download
    const reportData = {
      bot_id: params.id,
      bot_name: bot.name,
      total_conversations: totalChats,
      total_messages: totalMessages,
      avg_satisfaction: avgSatisfaction,
      generated_at: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${bot.name}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <Link href={`/dashboard/bots/${params.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Bot
          </Button>
        </Link>
      </div>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="h-8 w-8 text-primary" />
          Bot Analytics
        </h1>
        <p className="text-dark-800 mt-1">Monitor your bot's performance</p>
      </div>

      {/* Time Range Selector */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-dark-800">
              Showing data for: <span className="text-white font-medium">Last 7 Days</span>
            </div>
            <div className="text-xs text-dark-800">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {/* Total Conversations */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Conversations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {totalChats.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {chatsTrend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{chatsTrend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">{chatsTrend}%</span>
                </>
              )}
              <span className="text-dark-800 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Total Messages */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Total Messages
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {totalMessages.toLocaleString()}
            </div>
            <div className="flex items-center gap-1 text-sm">
              {messagesTrend > 0 ? (
                <>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-green-500">+{messagesTrend}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">{messagesTrend}%</span>
                </>
              )}
              <span className="text-dark-800 ml-1">from last week</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Satisfaction */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Star className="h-4 w-4" />
              Avg Satisfaction
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {avgSatisfaction ? `${avgSatisfaction.toFixed(1)}/5.0` : 'N/A'}
            </div>
            {avgSatisfaction && (
              <div className="flex items-center gap-1 text-sm">
                {satisfactionTrend > 0 ? (
                  <>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                    <span className="text-green-500">+{satisfactionTrend}</span>
                  </>
                ) : (
                  <>
                    <TrendingDown className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{satisfactionTrend}</span>
                  </>
                )}
                <span className="text-dark-800 ml-1">from last week</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Avg Response Time */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Avg Response Time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white mb-2">
              {avgResponseTime}s
            </div>
            <div className="text-sm text-dark-800">
              Lightning fast ⚡
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Charts */}
      <AnalyticsCharts 
        messages={recentMessages || []}
        conversations={recentConversations || []}
      />

      {/* Two Column Layout */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Top Questions */}
        <TopQuestions botId={params.id} />

        {/* Traffic Sources */}
        <TrafficSources conversations={recentConversations || []} />
      </div>

      {/* Recent Activity */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Recent Conversations</CardTitle>
              <CardDescription>
                Latest interactions with your bot
              </CardDescription>
            </div>
            <ExportReportButton
              botId={params.id}
              botName={bot.name}
              totalChats={totalChats}
              totalMessages={totalMessages}
              avgSatisfaction={avgSatisfaction}
              conversations={conversations || []}
            />
          </div>
        </CardHeader>
        <CardContent>
          {conversations && conversations.length > 0 ? (
            <div className="space-y-4">
              {conversations.map((conv: any) => (
                <div
                  key={conv.id}
                  className="flex items-center justify-between p-4 bg-dark-50 rounded-lg border border-dark-100"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <MessageSquare className="h-4 w-4 text-primary" />
                      <span className="text-white font-medium">
                        Conversation #{conv.id.slice(0, 8)}
                      </span>
                      {conv.source && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          {conv.source}
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-dark-800">
                      Started: {new Date(conv.created_at).toLocaleString()}
                    </div>
                  </div>
                  <Link href={`/dashboard/bots/${params.id}/chat?conversation=${conv.id}`}>
                    <Button variant="outline" size="sm">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-dark-800 mx-auto mb-4" />
              <p className="text-dark-800 mb-2">No conversations yet</p>
              <p className="text-sm text-dark-800">
                Conversations will appear here once users start chatting with your bot
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
