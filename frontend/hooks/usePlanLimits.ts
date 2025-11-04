import { useState, useEffect } from 'react'
import axios from 'axios'
import { createClient } from '@/lib/supabase/client'

export interface PlanLimits {
  plan_name: string
  max_bots: number
  max_conversations: number
  max_whatsapp_messages: number
  email_notifications: boolean
  google_calendar_sync: boolean
  whatsapp_notifications: boolean
  appointment_reminders: boolean
  lead_collection: boolean
  basic_analytics: boolean
  advanced_analytics: boolean
  remove_branding: boolean
  priority_support: boolean
  webhook_integrations: boolean
  custom_branding: boolean
  bring_own_twilio: boolean
  multiple_team_members: boolean
  api_access: boolean
  sla_guarantee: boolean
}

export interface UsageStats {
  user_id: string
  tracking_month: number
  tracking_year: number
  bots_created: number
  conversations_used: number
  whatsapp_messages_sent: number
  sms_messages_sent: number
}

export interface PlanData {
  plan: string
  limits: PlanLimits | null
  usage: UsageStats | null
}

export function usePlanLimits() {
  const [data, setData] = useState<PlanData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlanLimits()
  }, [])

  const fetchPlanLimits = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await axios.get(`${backendUrl}/api/plan/limits-and-usage`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      })

      setData(response.data)
      setError(null)
    } catch (err) {
      console.error('Error fetching plan limits:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch plan limits')
    } finally {
      setLoading(false)
    }
  }

  // Helper functions
  const canCreateBot = () => {
    if (!data?.limits || !data?.usage) return false
    if (data.limits.max_bots === -1) return true // unlimited
    
    // Count current bots from usage
    return data.usage.bots_created < data.limits.max_bots
  }

  const canSendMessage = () => {
    if (!data?.limits || !data?.usage) return false
    if (data.limits.max_conversations === -1) return true // unlimited
    return data.usage.conversations_used < data.limits.max_conversations
  }

  const canSendWhatsApp = () => {
    if (!data?.limits || !data?.usage) return false
    if (!data.limits.whatsapp_notifications) return false
    if (data.limits.max_whatsapp_messages === -1) return true // unlimited
    return data.usage.whatsapp_messages_sent < data.limits.max_whatsapp_messages
  }

  const hasFeature = (feature: keyof PlanLimits): boolean => {
    if (!data?.limits) return false
    return data.limits[feature] === true
  }

  const getUsagePercentage = (type: 'bots' | 'conversations' | 'whatsapp'): number => {
    if (!data?.limits || !data?.usage) return 0

    switch (type) {
      case 'bots':
        if (data.limits.max_bots === -1) return 0 // unlimited
        return (data.usage.bots_created / data.limits.max_bots) * 100
      case 'conversations':
        if (data.limits.max_conversations === -1) return 0 // unlimited
        return (data.usage.conversations_used / data.limits.max_conversations) * 100
      case 'whatsapp':
        if (data.limits.max_whatsapp_messages === -1) return 0 // unlimited
        return (data.usage.whatsapp_messages_sent / data.limits.max_whatsapp_messages) * 100
      default:
        return 0
    }
  }

  const getRemainingCount = (type: 'bots' | 'conversations' | 'whatsapp'): number | string => {
    if (!data?.limits || !data?.usage) return 0

    switch (type) {
      case 'bots':
        if (data.limits.max_bots === -1) return '∞'
        return data.limits.max_bots - data.usage.bots_created
      case 'conversations':
        if (data.limits.max_conversations === -1) return '∞'
        return data.limits.max_conversations - data.usage.conversations_used
      case 'whatsapp':
        if (data.limits.max_whatsapp_messages === -1) return '∞'
        return data.limits.max_whatsapp_messages - data.usage.whatsapp_messages_sent
      default:
        return 0
    }
  }

  return {
    plan: data?.plan || 'starter',
    limits: data?.limits,
    usage: data?.usage,
    loading,
    error,
    refresh: fetchPlanLimits,
    // Helper functions
    canCreateBot,
    canSendMessage,
    canSendWhatsApp,
    hasFeature,
    getUsagePercentage,
    getRemainingCount,
  }
}

