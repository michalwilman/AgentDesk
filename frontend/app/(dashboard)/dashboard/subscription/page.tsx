'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { checkTrialStatus, formatTrialEndDate, type TrialStatus } from '@/lib/subscription/trial-checker'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Clock, 
  CheckCircle, 
  Crown, 
  AlertCircle, 
  CreditCard, 
  Calendar,
  TrendingUp,
  X,
  ArrowRight
} from 'lucide-react'

interface Transaction {
  id: string
  plan: string
  amount: number
  currency: string
  status: string
  created_at: string
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: [
    '100 billable conversations',
    'Basic analytics',
    'Live visitors list',
    'Operating hours',
    'AI Copilot',
    '50 AI conversations (one-time)',
    '100 flow visitors reached'
  ],
  starter: [
    '100 billable conversations',
    'Basic analytics',
    'Live visitors list',
    'Operating hours',
    'AI Copilot',
    '50 AI conversations (one-time)',
    '100 flow visitors reached'
  ],
  growth: [
    '250 billable conversations',
    'Advanced analytics',
    'Power features',
    'No branding option',
    'Permissions',
    '50 AI conversations (one-time)',
    '100 flow visitors reached'
  ],
  plus: [
    'Custom billable quota',
    'Dedicated success manager',
    'Custom branding',
    'Multiple projects',
    'Departments',
    'Multilanguage',
    'OpenAPI',
    'Live chat human support',
    'From 300 AI conversations',
    'Custom flow limits'
  ],
  premium: [
    'Managed AI agent',
    '50% resolution guarantee',
    'Pay per resolution',
    'Mobile SDK',
    'Priority support + premium',
    'Super admin',
    'Analytics & monitoring',
    'From 3000 AI conversations',
    'Expanded flow limits'
  ]
}

const PLAN_PRICES: Record<string, number> = {
  free: 0,
  starter: 24.17,
  growth: 49.17,
  plus: 749,
  premium: 0 // Custom pricing
}

export default function SubscriptionPage() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [showCancelModal, setShowCancelModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      try {
        const status = await checkTrialStatus()
        setTrialStatus(status)

        // Load transactions if subscribed
        if (status.subscriptionTier !== 'free') {
          const supabase = createClient()
          const { data: { user } } = await supabase.auth.getUser()
          
          if (user) {
            const { data } = await supabase
              .from('transactions')
              .select('*')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(10)
            
            if (data) {
              setTransactions(data)
            }
          }
        }
      } catch (error) {
        console.error('Error loading subscription data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()

    // Refresh every minute
    const interval = setInterval(() => loadData(), 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-dark-800">Loading subscription details...</p>
        </div>
      </div>
    )
  }

  if (!trialStatus) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-white">Unable to load subscription details</p>
        </div>
      </div>
    )
  }

  const isOnTrial = trialStatus.isOnTrial && trialStatus.subscriptionTier === 'free'
  const hasSubscription = trialStatus.subscriptionTier !== 'free'
  const isExpired = trialStatus.trialExpired && !hasSubscription

  const planName = trialStatus.subscriptionTier.charAt(0).toUpperCase() + trialStatus.subscriptionTier.slice(1)
  const planFeatures = PLAN_FEATURES[trialStatus.subscriptionTier] || PLAN_FEATURES['free']
  const planPrice = PLAN_PRICES[trialStatus.subscriptionTier] || 0

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Subscription Management</h1>
        <p className="text-dark-800">View and manage your AgentDesk subscription</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        {/* Current Plan Overview */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Current Plan</CardTitle>
                <CardDescription>Your subscription details and status</CardDescription>
              </div>
              {hasSubscription && (
                <div className="bg-green-500/20 px-3 py-1 rounded-full">
                  <span className="text-green-100 text-sm font-semibold flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    Active
                  </span>
                </div>
              )}
              {isOnTrial && (
                <div className="bg-yellow-500/20 px-3 py-1 rounded-full">
                  <span className="text-yellow-100 text-sm font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Trial
                  </span>
                </div>
              )}
              {isExpired && (
                <div className="bg-red-500/20 px-3 py-1 rounded-full">
                  <span className="text-red-100 text-sm font-semibold flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    Expired
                  </span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Plan Name & Price */}
            <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl border border-primary/20">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Crown className="h-5 w-5 text-primary" />
                  <h3 className="text-xl font-bold text-white">
                    {isOnTrial ? 'Free Trial' : `${planName} Plan`}
                  </h3>
                </div>
                {isOnTrial && (
                  <p className="text-sm text-dark-800">
                    {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'day' : 'days'} remaining
                  </p>
                )}
                {hasSubscription && (
                  <p className="text-sm text-dark-800">Full access to all features</p>
                )}
                {isExpired && (
                  <p className="text-sm text-red-300">Trial has ended - upgrade to continue</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-primary">
                  {planPrice === 0 ? (hasSubscription ? 'Custom' : '$0') : `$${planPrice}`}
                </div>
                {planPrice > 0 && <p className="text-xs text-dark-800">per month</p>}
              </div>
            </div>

            {/* Trial Info */}
            {isOnTrial && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-yellow-400 mt-0.5" />
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-100 mb-1">Trial Period</h4>
                    <div className="text-sm text-yellow-200/80 space-y-1">
                      <p>Started: {trialStatus.trialEndDate ? formatTrialEndDate(new Date(new Date(trialStatus.trialEndDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()) : 'N/A'}</p>
                      <p>Ends: {formatTrialEndDate(trialStatus.trialEndDate)}</p>
                      <p className="font-semibold text-yellow-100 mt-2">
                        ⏰ {trialStatus.daysRemaining} {trialStatus.daysRemaining === 1 ? 'day' : 'days'} left
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Features List */}
            <div>
              <h4 className="font-semibold text-white mb-3 flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Included Features
              </h4>
              <div className="grid md:grid-cols-2 gap-2">
                {planFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-dark-800">
                    <CheckCircle className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {(isOnTrial || isExpired) && (
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Upgrade Plan
                  </Button>
                </Link>
              )}
              
              {hasSubscription && (
                <>
                  <Link href="/pricing" className="block">
                    <Button variant="outline" className="w-full">
                      <ArrowRight className="h-4 w-4 mr-2" />
                      Change Plan
                    </Button>
                  </Link>
                  
                  <Button 
                    variant="ghost" 
                    className="w-full text-red-300 hover:text-red-200 hover:bg-red-500/10"
                    onClick={() => setShowCancelModal(true)}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel Subscription
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          {/* Support Card */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-dark-800">
                Have questions about your subscription?
              </p>
              <Link href="/support">
                <Button variant="outline" size="sm" className="w-full">
                  Contact Support
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Payment History */}
      {hasSubscription && transactions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Payment History
            </CardTitle>
            <CardDescription>Your recent transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-dark-100">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-800">Date</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-800">Plan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-800">Amount</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-dark-800">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-dark-50">
                      <td className="py-3 px-4 text-sm text-white">
                        {new Date(transaction.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-sm text-white capitalize">
                        {transaction.plan}
                      </td>
                      <td className="py-3 px-4 text-sm text-white">
                        ${transaction.amount}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          transaction.status === 'success' 
                            ? 'bg-green-500/20 text-green-100'
                            : 'bg-red-500/20 text-red-100'
                        }`}>
                          {transaction.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cancel Subscription Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="text-xl">Cancel Subscription?</CardTitle>
              <CardDescription>
                Are you sure you want to cancel your subscription?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-100">
                  You'll lose access to all premium features at the end of your current billing period.
                </p>
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowCancelModal(false)}
                >
                  Keep Subscription
                </Button>
                <Button
                  variant="danger"
                  className="flex-1"
                  onClick={() => {
                    // TODO: Implement cancellation logic
                    alert('Cancellation feature coming soon!')
                    setShowCancelModal(false)
                  }}
                >
                  Cancel Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

