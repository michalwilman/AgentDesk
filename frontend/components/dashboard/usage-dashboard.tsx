'use client'

import { useState } from 'react'
import { Bot, MessageCircle, MessageSquare, TrendingUp, Zap, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import Link from 'next/link'

export function UsageDashboard() {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const {
    plan,
    limits,
    usage,
    loading,
    getUsagePercentage,
    getRemainingCount,
  } = usePlanLimits()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Usage This Month
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-dark-800">Loading...</div>
        </CardContent>
      </Card>
    )
  }

  if (!limits || !usage) {
    return null
  }

  const planNames: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    plus: 'Plus',
    premium: 'Premium',
  }

  const planPrices: Record<string, string> = {
    starter: '$24.17/mo',
    growth: '$49.17/mo',
    plus: '$749/mo',
    premium: 'Custom',
  }

  const botsPercentage = getUsagePercentage('bots')
  const conversationsPercentage = getUsagePercentage('conversations')
  const whatsappPercentage = getUsagePercentage('whatsapp')

  const botsRemaining = getRemainingCount('bots')
  const conversationsRemaining = getRemainingCount('conversations')
  const whatsappRemaining = getRemainingCount('whatsapp')

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-primary'
  }

  const getStatusIcon = (remaining: number | string) => {
    if (remaining === '∞') return <Zap className="h-4 w-4 text-primary inline ml-1" />
    if (typeof remaining === 'number' && remaining === 0) return '⚠️'
    return '✅'
  }

  return (
    <Card className="shadow-glow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1.5">
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Your Usage This Month
            </CardTitle>
            <CardDescription>
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-8 w-8 p-0"
          >
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {/* Collapsed Summary */}
      {!isExpanded && (
        <CardContent className="py-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-dark-800">
              <span className="flex items-center gap-1">
                <Bot className="h-3 w-3" /> {usage.bots_created}/{limits.max_bots === -1 ? '∞' : limits.max_bots}
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3 w-3" /> {usage.conversations_used}/{limits.max_conversations === -1 ? '∞' : limits.max_conversations}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" /> {usage.whatsapp_messages_sent}/{limits.max_whatsapp_messages === -1 ? '∞' : limits.max_whatsapp_messages}
              </span>
            </div>
            <span className="text-primary font-medium">{planNames[plan]}</span>
          </div>
        </CardContent>
      )}
      
      {/* Expanded Details */}
      {isExpanded && (
        <CardContent className="space-y-6">
        {/* Bots Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Bot className="h-4 w-4 text-primary" />
              <span className="font-medium text-white">AI Bots</span>
            </div>
            <span className="text-dark-800">
              {usage.bots_created} / {limits.max_bots === -1 ? '∞' : limits.max_bots}
            </span>
          </div>
          {limits.max_bots !== -1 && (
            <>
              <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(botsPercentage)} transition-all duration-300`}
                  style={{ width: `${Math.min(botsPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-dark-800">
                {getStatusIcon(botsRemaining)} {botsRemaining === 0 ? 'Limit reached' : `${botsRemaining} bot(s) remaining`}
              </div>
            </>
          )}
          {limits.max_bots === -1 && (
            <div className="text-xs text-primary flex items-center gap-1">
              <Zap className="h-3 w-3" /> Unlimited bots
            </div>
          )}
          {botsRemaining === 0 && (
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="w-full mt-2">
                Upgrade to create more bots
              </Button>
            </Link>
          )}
        </div>

        {/* Conversations Usage */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="font-medium text-white">AI Conversations</span>
            </div>
            <span className="text-dark-800">
              {usage.conversations_used} / {limits.max_conversations === -1 ? '∞' : limits.max_conversations}
            </span>
          </div>
          {limits.max_conversations !== -1 && (
            <>
              <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getProgressColor(conversationsPercentage)} transition-all duration-300`}
                  style={{ width: `${Math.min(conversationsPercentage, 100)}%` }}
                />
              </div>
              <div className="text-xs text-dark-800">
                {getStatusIcon(conversationsRemaining)} {conversationsRemaining === 0 ? 'Limit reached' : `${conversationsRemaining} conversation(s) remaining`}
              </div>
            </>
          )}
          {limits.max_conversations === -1 && (
            <div className="text-xs text-primary flex items-center gap-1">
              <Zap className="h-3 w-3" /> Unlimited conversations
            </div>
          )}
          {typeof conversationsRemaining === 'number' && conversationsRemaining <= 10 && conversationsRemaining > 0 && (
            <Link href="/pricing">
              <Button size="sm" variant="outline" className="w-full mt-2">
                Upgrade for more conversations
              </Button>
            </Link>
          )}
        </div>

        {/* WhatsApp Usage */}
        {limits.whatsapp_notifications && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <span className="font-medium text-white">WhatsApp Messages</span>
              </div>
              <span className="text-dark-800">
                {usage.whatsapp_messages_sent} / {limits.max_whatsapp_messages === -1 ? '∞' : limits.max_whatsapp_messages}
              </span>
            </div>
            {limits.max_whatsapp_messages !== -1 && (
              <>
                <div className="h-2 bg-dark-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${getProgressColor(whatsappPercentage)} transition-all duration-300`}
                    style={{ width: `${Math.min(whatsappPercentage, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-dark-800">
                  {getStatusIcon(whatsappRemaining)} {whatsappRemaining === 0 ? 'Limit reached' : `${whatsappRemaining} message(s) remaining`}
                </div>
              </>
            )}
            {limits.max_whatsapp_messages === -1 && (
              <div className="text-xs text-primary flex items-center gap-1">
                <Zap className="h-3 w-3" /> Unlimited WhatsApp messages
              </div>
            )}
            {typeof whatsappRemaining === 'number' && whatsappRemaining <= 50 && whatsappRemaining > 0 && (
              <Link href="/pricing">
                <Button size="sm" variant="outline" className="w-full mt-2">
                  Upgrade for unlimited WhatsApp
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Plan Info */}
        <div className="pt-4 border-t border-dark-100 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-800">Current Plan:</span>
            <span className="font-semibold text-white">{planNames[plan] || plan}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-dark-800">Price:</span>
            <span className="font-semibold text-primary">{planPrices[plan] || 'N/A'}</span>
          </div>
          <Link href="/pricing" className="block">
            <Button className="w-full mt-3 bg-gradient-cyan hover:shadow-glow-lg transition-smooth">
              {plan === 'starter' ? 'Upgrade Your Plan' : 'View All Plans'}
            </Button>
          </Link>
        </div>
        </CardContent>
      )}
    </Card>
  )
}

