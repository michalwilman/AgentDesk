'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Bot, Star, TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardStatsProps {
  totalChats: number
  totalMessages: number
  activeBots: number
  totalBots: number
  avgSatisfaction: number | null
  chatsTrend?: number
  messagesTrend?: number
  satisfactionTrend?: number
}

export function DashboardStats({
  totalChats,
  totalMessages,
  activeBots,
  totalBots,
  avgSatisfaction,
  chatsTrend = 0,
  messagesTrend = 0,
  satisfactionTrend = 0,
}: DashboardStatsProps) {
  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`
    }
    return num.toString()
  }

  const TrendIndicator = ({ value }: { value: number }) => {
    if (value === 0) return null
    
    return (
      <div className={`flex items-center gap-1 text-xs ${value > 0 ? 'text-green-500' : 'text-red-500'}`}>
        {value > 0 ? (
          <TrendingUp className="h-3 w-3" />
        ) : (
          <TrendingDown className="h-3 w-3" />
        )}
        <span>{value > 0 ? '+' : ''}{value}%</span>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Conversations */}
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#666666]">
            Total Conversations
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-1">
            {formatNumber(totalChats)}
          </div>
          <TrendIndicator value={chatsTrend} />
          <p className="text-xs text-dark-800 mt-1">
            All time conversations
          </p>
        </CardContent>
      </Card>

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
            {formatNumber(totalMessages)}
          </div>
          <TrendIndicator value={messagesTrend} />
          <p className="text-xs text-dark-800 mt-1">
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
          <Bot className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-1">
            {activeBots}/{totalBots}
          </div>
          <p className="text-xs text-dark-800 mt-1">
            {activeBots === totalBots ? 'All bots active' : `${totalBots - activeBots} inactive`}
          </p>
        </CardContent>
      </Card>

      {/* Average Satisfaction */}
      <Card className="border-primary/20 hover:border-primary/40 transition-colors">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-[#666666]">
            Avg. Satisfaction
          </CardTitle>
          <Star className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-white mb-1">
            {avgSatisfaction ? avgSatisfaction.toFixed(1) : 'N/A'}
            {avgSatisfaction && <span className="text-lg text-dark-800">/5.0</span>}
          </div>
          {avgSatisfaction && <TrendIndicator value={satisfactionTrend} />}
          <p className="text-xs text-dark-800 mt-1">
            {avgSatisfaction ? 'Customer rating' : 'No ratings yet'}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

