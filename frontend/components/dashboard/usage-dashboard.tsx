'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { MessageSquare, Mail, Phone, AlertTriangle, TrendingUp, Calendar } from 'lucide-react'

interface UsageData {
  sms_sent: number
  whatsapp_sent: number
  email_sent: number
  sms_limit: number | null
  whatsapp_limit: number | null
  email_limit: number | null
}

interface UsageDashboardProps {
  botId?: string
  planType?: 'starter' | 'pro' | 'enterprise'
}

export function UsageDashboard({ botId, planType = 'starter' }: UsageDashboardProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState<string>('')
  const supabase = createClient()

  useEffect(() => {
    if (botId) {
      fetchUsage()
    }
  }, [botId])

  const fetchUsage = async () => {
    if (!botId) return // Skip if no botId provided

    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      // Get current month (first day)
      const now = new Date()
      const monthKey = new Date(now.getFullYear(), now.getMonth(), 1)
        .toISOString()
        .split('T')[0]
      
      setCurrentMonth(monthKey)

      // Fetch usage data
      const { data, error } = await supabase
        .from('monthly_usage')
        .select('*')
        .eq('user_id', user.id)
        .eq('bot_id', botId)
        .eq('month', monthKey)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching usage:', error)
        return
      }

      // If no usage data exists, create default
      if (!data) {
        setUsage({
          sms_sent: 0,
          whatsapp_sent: 0,
          email_sent: 0,
          sms_limit: planType === 'pro' ? 250 : null,
          whatsapp_limit: planType === 'pro' ? 100 : null,
          email_limit: planType === 'pro' ? 500 : 100,
        })
      } else {
        setUsage(data)
      }
    } catch (error) {
      console.error('Error fetching usage:', error)
    } finally {
      setLoading(false)
    }
  }

  const getUsagePercentage = (current: number, limit: number | null): number => {
    if (limit === null) return 0 // Unlimited
    return limit > 0 ? (current / limit) * 100 : 0
  }

  const getUsageColor = (percentage: number): string => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 75) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatLimit = (limit: number | null): string => {
    return limit === null ? '∞' : limit.toString()
  }

  // Don't render if no botId is provided
  if (!botId) {
    return null
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Message Usage</CardTitle>
          <CardDescription>Loading usage data...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-dark-100 rounded"></div>
            <div className="h-20 bg-dark-100 rounded"></div>
            <div className="h-20 bg-dark-100 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!usage) {
    return null
  }

  // Only show if user is on Pro or Enterprise plan
  if (planType === 'starter') {
    return null
  }

  const smsPercentage = getUsagePercentage(usage.sms_sent, usage.sms_limit)
  const whatsappPercentage = getUsagePercentage(usage.whatsapp_sent, usage.whatsapp_limit)
  const emailPercentage = getUsagePercentage(usage.email_sent, usage.email_limit)

  const hasWarning = smsPercentage >= 75 || whatsappPercentage >= 75 || emailPercentage >= 75

  return (
    <Card className="border-primary/30">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Monthly Usage</CardTitle>
              <CardDescription>
                {new Date(currentMonth).toLocaleDateString('he-IL', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </CardDescription>
            </div>
          </div>
          {hasWarning && (
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm font-medium">Approaching Limit</span>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* SMS Usage */}
        {(planType === 'pro' || planType === 'enterprise') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-white">SMS Messages</span>
              </div>
              <span className="text-sm text-dark-800">
                {usage.sms_sent} / {formatLimit(usage.sms_limit)}
              </span>
            </div>
            <Progress 
              value={smsPercentage} 
              className="h-2"
              indicatorClassName={getUsageColor(smsPercentage)}
            />
            {smsPercentage >= 90 && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                You've used {smsPercentage.toFixed(0)}% of your monthly SMS quota
              </p>
            )}
          </div>
        )}

        {/* WhatsApp Usage */}
        {(planType === 'pro' || planType === 'enterprise') && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-white">WhatsApp Messages</span>
              </div>
              <span className="text-sm text-dark-800">
                {usage.whatsapp_sent} / {formatLimit(usage.whatsapp_limit)}
              </span>
            </div>
            <Progress 
              value={whatsappPercentage} 
              className="h-2"
              indicatorClassName={getUsageColor(whatsappPercentage)}
            />
            {whatsappPercentage >= 90 && (
              <p className="text-xs text-red-400 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3" />
                You've used {whatsappPercentage.toFixed(0)}% of your monthly WhatsApp quota
              </p>
            )}
          </div>
        )}

        {/* Email Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-purple-400" />
              <span className="text-sm font-medium text-white">Email Messages</span>
            </div>
            <span className="text-sm text-dark-800">
              {usage.email_sent} / {formatLimit(usage.email_limit)}
            </span>
          </div>
          <Progress 
            value={emailPercentage} 
            className="h-2"
            indicatorClassName={getUsageColor(emailPercentage)}
          />
          {emailPercentage >= 90 && (
            <p className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle className="h-3 w-3" />
              You've used {emailPercentage.toFixed(0)}% of your monthly email quota
            </p>
          )}
        </div>

        {/* Upgrade CTA for Pro users approaching limits */}
        {planType === 'pro' && (smsPercentage >= 80 || whatsappPercentage >= 80) && (
          <div className="mt-6 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-white mb-1">
                  Need more messages?
                </h4>
                <p className="text-xs text-gray-400">
                  Upgrade to Enterprise for unlimited messaging with your own Twilio account
                </p>
              </div>
              <Button 
                size="sm"
                onClick={() => window.location.href = '/pricing'}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Upgrade
              </Button>
            </div>
          </div>
        )}

        {/* Enterprise unlimited message */}
        {planType === 'enterprise' && (
          <div className="mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-400 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>Unlimited messaging with your Twilio account</span>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
