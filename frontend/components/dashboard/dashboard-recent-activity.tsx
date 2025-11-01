'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Activity, MessageSquare, FileText, Bot, Settings, Clock } from 'lucide-react'
import Link from 'next/link'

interface ActivityItem {
  id: string
  type: 'conversation' | 'document' | 'bot_created' | 'bot_updated'
  title: string
  description?: string
  timestamp: string
  botId?: string
  botName?: string
}

interface DashboardRecentActivityProps {
  activities: ActivityItem[]
}

export function DashboardRecentActivity({ activities }: DashboardRecentActivityProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'conversation':
        return <MessageSquare className="h-4 w-4 text-primary" />
      case 'document':
        return <FileText className="h-4 w-4 text-blue-500" />
      case 'bot_created':
        return <Bot className="h-4 w-4 text-green-500" />
      case 'bot_updated':
        return <Settings className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-primary" />
    }
  }

  const formatTimeAgo = (timestamp: string): string => {
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now.getTime() - past.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return past.toLocaleDateString()
  }

  if (activities.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
          <CardDescription>Latest updates and events</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-dark-800">
            <Activity className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No recent activity yet</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
        <CardDescription>Latest updates and events</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-lg border border-dark-100 hover:border-primary/40 transition-colors bg-dark-50/50"
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-dark-100 flex items-center justify-center mt-0.5">
                {getIcon(activity.type)}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-xs text-dark-800 mt-0.5 line-clamp-1">
                        {activity.description}
                      </p>
                    )}
                    {activity.botName && (
                      <p className="text-xs text-primary mt-1">
                        {activity.botName}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-dark-800 whitespace-nowrap">
                    <Clock className="h-3 w-3" />
                    {formatTimeAgo(activity.timestamp)}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* View All Link */}
        {activities.length > 0 && (
          <div className="mt-4 text-center">
            <Link 
              href="/dashboard/activity" 
              className="text-sm text-primary hover:underline"
            >
              View all activity →
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

