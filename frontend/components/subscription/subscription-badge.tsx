'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { checkTrialStatus, type TrialStatus } from '@/lib/subscription/trial-checker'
import { Clock, CheckCircle, Crown, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SubscriptionBadgeProps {
  variant?: 'compact' | 'full'
  className?: string
}

export function SubscriptionBadge({ variant = 'compact', className }: SubscriptionBadgeProps) {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadTrialStatus() {
      try {
        const status = await checkTrialStatus()
        setTrialStatus(status)
      } catch (error) {
        console.error('Error loading trial status:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrialStatus()
    
    // Auto-refresh every 60 seconds to update countdown
    const interval = setInterval(loadTrialStatus, 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !trialStatus) {
    return null
  }

  // Determine badge style and content based on status
  const isOnTrial = trialStatus.isOnTrial && trialStatus.subscriptionTier === 'free'
  const hasSubscription = trialStatus.subscriptionTier !== 'free'
  const isExpired = trialStatus.trialExpired && !hasSubscription

  // Compact variant (for nav bar)
  if (variant === 'compact') {
    if (isExpired) {
      return (
        <Link href="/dashboard/subscription">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105",
            "bg-red-500/20 border border-red-500/40 text-red-100",
            className
          )}>
            <AlertCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Trial Expired</span>
          </div>
        </Link>
      )
    }

    if (isOnTrial) {
      return (
        <Link href="/dashboard/subscription">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105",
            "bg-yellow-500/20 border border-yellow-500/40 text-yellow-100",
            className
          )}>
            <Clock className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              Trial: {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'day' : 'days'} left
            </span>
            <span className="sm:hidden">{trialStatus.daysRemaining}d</span>
          </div>
        </Link>
      )
    }

    if (hasSubscription) {
      const planName = trialStatus.subscriptionTier.charAt(0).toUpperCase() + trialStatus.subscriptionTier.slice(1)
      return (
        <Link href="/dashboard/subscription">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105",
            "bg-green-500/20 border border-green-500/40 text-green-100",
            className
          )}>
            <CheckCircle className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Subscribed: {planName}</span>
            <span className="sm:hidden">Pro</span>
          </div>
        </Link>
      )
    }
  }

  // Full variant (for My Bots page)
  if (variant === 'full') {
    if (isExpired) {
      return (
        <Link href="/dashboard/subscription">
          <div className={cn(
            "flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]",
            "bg-red-500/10 border-2 border-red-500/30 hover:border-red-500/50",
            className
          )}>
            <div className="flex items-center gap-3">
              <div className="bg-red-500/20 p-2.5 rounded-full">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-red-100">Trial Expired</div>
                <div className="text-xs text-red-200/80">Upgrade to continue using AgentDesk</div>
              </div>
            </div>
            <div className="text-xs text-red-200 font-medium px-3 py-1 bg-red-500/20 rounded-full">
              Upgrade Now →
            </div>
          </div>
        </Link>
      )
    }

    if (isOnTrial) {
      return (
        <Link href="/dashboard/subscription">
          <div className={cn(
            "flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]",
            "bg-yellow-500/10 border-2 border-yellow-500/30 hover:border-yellow-500/50",
            className
          )}>
            <div className="flex items-center gap-3">
              <div className="bg-yellow-500/20 p-2.5 rounded-full">
                <Clock className="h-5 w-5 text-yellow-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-yellow-100">
                  Free Trial Active: {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'day' : 'days'} remaining
                </div>
                <div className="text-xs text-yellow-200/80">
                  Upgrade anytime for unlimited access
                </div>
              </div>
            </div>
            <div className="text-xs text-yellow-200 font-medium px-3 py-1 bg-yellow-500/20 rounded-full">
              View Plans →
            </div>
          </div>
        </Link>
      )
    }

    if (hasSubscription) {
      const planName = trialStatus.subscriptionTier.charAt(0).toUpperCase() + trialStatus.subscriptionTier.slice(1)
      return (
        <Link href="/dashboard/subscription">
          <div className={cn(
            "flex items-center justify-between gap-4 p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02]",
            "bg-green-500/10 border-2 border-green-500/30 hover:border-green-500/50",
            className
          )}>
            <div className="flex items-center gap-3">
              <div className="bg-green-500/20 p-2.5 rounded-full">
                <Crown className="h-5 w-5 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-green-100">
                  {planName} Plan Active
                </div>
                <div className="text-xs text-green-200/80">
                  You have full access to all features
                </div>
              </div>
            </div>
            <div className="text-xs text-green-200 font-medium px-3 py-1 bg-green-500/20 rounded-full">
              Manage →
            </div>
          </div>
        </Link>
      )
    }
  }

  return null
}

