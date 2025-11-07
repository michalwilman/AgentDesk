'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { 
  DollarSign, 
  MessageSquare, 
  Mail, 
  Phone, 
  TrendingUp,
  Filter,
  Download,
  Calendar
} from 'lucide-react'

interface UsageSummary {
  totalSMS: number
  totalWhatsApp: number
  totalEmail: number
  estimatedCostUSD: string
  estimatedCostILS: string
  totalCustomers: number
}

interface UsageDetail {
  userId: string
  userEmail: string
  userName: string
  planType: string
  botId: string
  botName: string
  month: string
  sms: number
  whatsapp: number
  email: number
  smsLimit: number | null
  whatsappLimit: number | null
  costUSD: string
}

interface UsageData {
  summary: UsageSummary
  details: UsageDetail[]
}

export function UsageStatsTable() {
  const [data, setData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState<string>('')
  const [selectedPlan, setSelectedPlan] = useState<string>('all')
  const supabase = createClient()

  useEffect(() => {
    // Set current month as default
    const now = new Date()
    const monthKey = new Date(now.getFullYear(), now.getMonth(), 1)
      .toISOString()
      .split('T')[0]
    setSelectedMonth(monthKey)
  }, [])

  useEffect(() => {
    if (selectedMonth) {
      fetchUsageData()
    }
  }, [selectedMonth, selectedPlan])

  const fetchUsageData = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) return

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 
        (typeof window !== 'undefined' && window.location.hostname !== 'localhost' 
          ? 'https://agentdesk-backend-production.up.railway.app/api'
          : 'http://localhost:3001/api')

      const params = new URLSearchParams({
        month: selectedMonth,
        ...(selectedPlan !== 'all' && { plan_type: selectedPlan }),
      })

      const response = await fetch(
        `${apiUrl}/admin/usage-stats?${params}`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error('Failed to fetch usage data')
      }

      const usageData = await response.json()
      setData(usageData)
    } catch (error) {
      console.error('Error fetching usage data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlanBadgeColor = (planType: string) => {
    switch (planType) {
      case 'starter':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
      case 'pro':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'enterprise':
        return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    }
  }

  const formatMonth = (monthStr: string) => {
    return new Date(monthStr).toLocaleDateString('he-IL', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const exportToCSV = () => {
    if (!data) return

    const csv = [
      ['Email', 'Name', 'Plan', 'Bot', 'SMS', 'WhatsApp', 'Email', 'Cost (USD)'].join(','),
      ...data.details.map(detail => [
        detail.userEmail,
        detail.userName || 'N/A',
        detail.planType,
        detail.botName || 'N/A',
        detail.sms,
        detail.whatsapp,
        detail.email,
        detail.costUSD,
      ].join(','))
    ].join('\n')

    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `usage-${selectedMonth}.csv`
    a.click()
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 dark:bg-dark-100 rounded"></div>
            <div className="h-40 bg-gray-200 dark:bg-dark-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="border-gray-700 bg-gray-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-blue-400" />
              <CardTitle>Filters</CardTitle>
            </div>
            <Button 
              onClick={exportToCSV} 
              variant="outline"
              size="sm"
              disabled={!data}
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Month Selector */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Month
              </label>
              <input
                type="month"
                value={selectedMonth.substring(0, 7)}
                onChange={(e) => {
                  const date = new Date(e.target.value + '-01')
                  setSelectedMonth(date.toISOString().split('T')[0])
                }}
                className="w-full px-3 py-2 bg-dark-100 border border-dark-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {/* Plan Type Filter */}
            <div>
              <label className="text-sm font-medium text-white mb-2 block">
                Plan Type
              </label>
              <select
                value={selectedPlan}
                onChange={(e) => setSelectedPlan(e.target.value)}
                className="w-full px-3 py-2 bg-dark-100 border border-dark-200 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Plans</option>
                <option value="starter">Starter</option>
                <option value="pro">Pro</option>
                <option value="enterprise">Enterprise</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-green-500/30 bg-gray-900">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-green-400">
                <DollarSign className="h-4 w-4" />
                Total Cost (ILS)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                ₪{data.summary.estimatedCostILS}
              </div>
              <p className="text-sm text-gray-400 mt-1">
                ${data.summary.estimatedCostUSD} USD
              </p>
            </CardContent>
          </Card>

          <Card className="border-blue-500/30 bg-gray-900">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-blue-400">
                <Phone className="h-4 w-4" />
                SMS Messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.summary.totalSMS.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-green-500/30 bg-gray-900">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-green-400">
                <MessageSquare className="h-4 w-4" />
                WhatsApp Messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.summary.totalWhatsApp.toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="border-purple-500/30 bg-gray-900">
            <CardHeader>
              <CardDescription className="flex items-center gap-2 text-purple-400">
                <Mail className="h-4 w-4" />
                Email Messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {data.summary.totalEmail.toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Usage Table */}
      {data && (
        <Card className="border-gray-700 bg-gray-900">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Customer Usage Details</CardTitle>
                <CardDescription>
                  {formatMonth(selectedMonth)} • {data.details.length} customers
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Customer</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-400">Bot</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">SMS</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">WhatsApp</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Email</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-400">Cost (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.details.map((detail, index) => (
                    <tr 
                      key={`${detail.userId}-${detail.botId}-${index}`}
                      className="border-b border-gray-800 hover:bg-gray-800/50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {detail.userName || 'N/A'}
                          </div>
                          <div className="text-xs text-gray-400">{detail.userEmail}</div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getPlanBadgeColor(detail.planType)}`}>
                          {detail.planType}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {detail.botName || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm text-white">
                          {detail.sms}
                        </div>
                        {detail.smsLimit && (
                          <div className="text-xs text-gray-400">
                            / {detail.smsLimit}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="text-sm text-white">
                          {detail.whatsapp}
                        </div>
                        {detail.whatsappLimit && (
                          <div className="text-xs text-gray-400">
                            / {detail.whatsappLimit}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-sm text-white">
                        {detail.email}
                      </td>
                      <td className="py-3 px-4 text-right text-sm font-medium text-green-400">
                        ${detail.costUSD}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {data.details.length === 0 && (
                <div className="text-center py-12">
                  <TrendingUp className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No Usage Data
                  </h3>
                  <p className="text-gray-400">
                    No message usage found for the selected period and filters
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

