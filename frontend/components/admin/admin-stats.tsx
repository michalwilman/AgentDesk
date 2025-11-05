'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Bot, MessageSquare, TrendingUp, UserCheck, Clock } from 'lucide-react'
import { getSystemStats, AdminStats as AdminStatsType } from '@/lib/admin/admin-api'

export function AdminStats() {
  const [stats, setStats] = useState<AdminStatsType | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchStats() {
      try {
        const data = await getSystemStats()
        setStats(data)
      } catch (error) {
        console.error('Failed to fetch stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-red-600">Failed to load statistics</p>
        </CardContent>
      </Card>
    )
  }

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.total_users,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Users',
      value: stats.active_users,
      icon: UserCheck,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Trial Users',
      value: stats.trial_users,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
    },
    {
      title: 'Paid Users',
      value: stats.paid_users,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Total Bots',
      value: stats.total_bots,
      icon: Bot,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Active Bots',
      value: stats.active_bots,
      icon: Bot,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Chats Today',
      value: stats.chats_today,
      icon: MessageSquare,
      color: 'text-pink-600',
      bgColor: 'bg-pink-50',
    },
    {
      title: 'Messages Today',
      value: stats.messages_today,
      icon: MessageSquare,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => {
          const Icon = stat.icon

          return (
            <Card key={stat.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Additional Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Growth</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">This Week</span>
                <span className="font-semibold">{stats.signups_this_week} signups</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold">{stats.signups_this_month} signups</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Conversion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Trial → Paid</span>
                <span className="font-semibold">
                  {stats.trial_users > 0
                    ? ((stats.paid_users / (stats.paid_users + stats.trial_users)) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bot Activation</span>
                <span className="font-semibold">
                  {stats.total_bots > 0
                    ? ((stats.active_bots / stats.total_bots) * 100).toFixed(1)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

