'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { checkTrialStatus, type TrialStatus } from '@/lib/subscription/trial-checker'
import { Button } from '@/components/ui/button'
import { AlertCircle, Clock, CreditCard } from 'lucide-react'

export function TrialBanner() {
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
    
    // Check trial status every 5 minutes
    const interval = setInterval(loadTrialStatus, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading || !trialStatus) return null

  // Don't show banner if user has paid subscription
  if (trialStatus.subscriptionTier !== 'free') return null

  // Show warning if trial is ending soon (2 days or less)
  if (trialStatus.isOnTrial && trialStatus.daysRemaining !== null && trialStatus.daysRemaining <= 2) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                  Your free trial ends in {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'day' : 'days'}
                </p>
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  Upgrade now to continue using AgentDesk without interruption
                </p>
              </div>
            </div>
            <Link href="/pricing">
              <Button size="sm" className="bg-yellow-600 hover:bg-yellow-700 text-white">
                Upgrade Now
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Don't show banner during normal trial period
  return null
}

export function TrialExpiredModal() {
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
  }, [])

  if (loading || !trialStatus) return null

  // Show modal only if trial has expired
  if (!trialStatus.trialExpired || trialStatus.subscriptionTier !== 'free') return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-white dark:bg-dark-50 rounded-2xl shadow-2xl max-w-lg w-full mx-4 p-8 border border-primary/20">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-4 rounded-full">
              <AlertCircle className="h-12 w-12 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-white">Trial Period Ended</h2>
            <p className="text-dark-800 text-lg">
              Your 7-day free trial has expired
            </p>
          </div>

          <div className="bg-dark/50 rounded-xl p-4 space-y-2">
            <p className="text-white font-semibold">What happens now?</p>
            <ul className="text-sm text-dark-800 space-y-1 text-left">
              <li>✓ Your bots and data are safe</li>
              <li>✓ Choose a plan to continue using AgentDesk</li>
              <li>✓ Get instant access after upgrading</li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/pricing" className="block">
              <Button size="lg" className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold text-lg">
                <CreditCard className="mr-2 h-5 w-5" />
                View Pricing Plans
              </Button>
            </Link>
            
            <Link href="/support" className="block">
              <Button variant="ghost" size="lg" className="w-full text-white hover:text-primary">
                Contact Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

