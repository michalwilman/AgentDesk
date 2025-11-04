'use client'

import { Clock, Zap, CreditCard } from 'lucide-react'
import { useTrialStatus } from '@/hooks/useTrialStatus'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function TrialCountdown() {
  const { trialStatus, loading } = useTrialStatus()

  if (loading || !trialStatus || !trialStatus.is_trial) {
    return null
  }

  if (trialStatus.status === 'expired') {
    return (
      <Link href="/pricing">
        <Button size="sm" variant="destructive" className="gap-2">
          <CreditCard className="h-4 w-4" />
          Trial Expired - Upgrade Now
        </Button>
      </Link>
    )
  }

  const { days_remaining = 0, hours_remaining = 0 } = trialStatus

  const getUrgencyColor = () => {
    if (days_remaining === 0) return 'text-red-500 bg-red-500/10 border-red-500/20'
    if (days_remaining <= 2) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
    return 'text-primary bg-primary/10 border-primary/20'
  }

  const getUrgencyIcon = () => {
    if (days_remaining <= 2) return '⚠️'
    return '⏰'
  }

  return (
    <Link href="/pricing">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${getUrgencyColor()} hover:shadow-lg transition-all cursor-pointer`}>
        <Clock className="h-4 w-4" />
        <span className="text-sm font-medium">
          {getUrgencyIcon()} Trial: {days_remaining}d {hours_remaining}h left
        </span>
        <Zap className="h-4 w-4" />
      </div>
    </Link>
  )
}

