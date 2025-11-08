'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ContactSalesModal } from '@/components/modals/contact-sales-modal'
import { Check, Zap, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

interface Plan {
  id: string
  name: string
  displayName: string
  price: string
  priceMonthly: number
  features: string[]
  highlighted?: boolean
  description: string
  badge?: string
}

const plans: Plan[] = [
  {
    id: 'starter',
    name: 'starter',
    displayName: 'Starter',
    price: '$24.17',
    priceMonthly: 24.17,
    description: 'Perfect for small businesses with automated appointment booking, email & WhatsApp notifications.',
    features: [
      '1 AI Bot',
      '100 AI conversations/month',
      'Email notifications (included)',
      'Google Calendar sync',
      'WhatsApp notifications (up to 500/mo)',
      '24h appointment reminders',
      'Lead collection & management',
      'Basic analytics',
    ],
  },
  {
    id: 'growth',
    name: 'growth',
    displayName: 'Growth',
    price: '$49.17',
    priceMonthly: 49.17,
    description: 'For growing teams needing unlimited WhatsApp, advanced analytics, and custom branding.',
    highlighted: true,
    badge: 'Most Popular',
    features: [
      '3 AI Bots',
      '250 AI conversations/month',
      'Everything in Starter, plus:',
      '250 SMS + 100 WhatsApp messages/month',
      'Managed by AgentDesk',
      'Advanced analytics',
      'Remove AgentDesk branding',
      'Priority support',
      'Webhook integrations',
    ],
  },
  {
    id: 'plus',
    name: 'plus',
    displayName: 'Plus',
    price: '$749',
    priceMonthly: 749,
    description: 'Enterprise-grade features with dedicated support, API access, and optional Twilio integration.',
    features: [
      'Unlimited AI Bots',
      'Custom AI conversation quota',
      'Everything in Growth, plus:',
      'Bring your own Twilio (optional)',
      'Custom branding & white label',
      'Dedicated success manager',
      'Multiple team members',
      'API access (OpenAPI)',
      'SLA guarantee',
      'Custom flow limits',
    ],
  },
  {
    id: 'premium',
    name: 'premium',
    displayName: 'Premium',
    price: 'Custom',
    priceMonthly: 0,
    description: 'Managed AI agent with premium support and advanced features.',
    features: [
      'Managed AI agent',
      '50% resolution guarantee',
      'Pay per resolution',
      'Mobile SDK',
      'Priority support + premium',
      'Super admin',
      'Analytics & monitoring',
      'From 3000 AI conversations',
      'Expanded flow limits',
    ],
  },
]

export default function UpgradePage() {
  const searchParams = useSearchParams()
  const suggestedPlan = searchParams?.get('plan')
  const [currentPlan, setCurrentPlan] = useState<string>('starter')
  const [loading, setLoading] = useState(true)
  const [showContactSalesModal, setShowContactSalesModal] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userName, setUserName] = useState('')
  const supabase = createClient()

  useEffect(() => {
    fetchCurrentPlan()
  }, [])

  const fetchCurrentPlan = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Set user email
        setUserEmail(user.email || '')

        const { data: userData } = await supabase
          .from('users')
          .select('subscription_tier, full_name')
          .eq('id', user.id)
          .single()
        
        if (userData?.subscription_tier) {
          setCurrentPlan(userData.subscription_tier)
        }
        
        if (userData?.full_name) {
          setUserName(userData.full_name)
        }
      }
    } catch (error) {
      console.error('Error fetching current plan:', error)
    } finally {
      setLoading(false)
    }
  }

  const isPlanAvailable = (planId: string) => {
    const planOrder = ['starter', 'growth', 'plus', 'premium']
    const currentIndex = planOrder.indexOf(currentPlan)
    const targetIndex = planOrder.indexOf(planId)
    return targetIndex > currentIndex
  }

  const handleSelectPlan = (planName: string) => {
    if (planName === 'premium') {
      // Open contact sales modal for premium plan
      setShowContactSalesModal(true)
    } else {
      // Redirect to checkout for other plans
      window.location.href = `/checkout?plan=${planName}`
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-dark py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center text-primary hover:text-primary/80 mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">
            Upgrade Your Plan
          </h1>
          <p className="text-lg text-dark-800">
            {suggestedPlan 
              ? `Unlock SMS & WhatsApp messaging with ${plans.find(p => p.name === suggestedPlan)?.displayName || 'a higher'} plan`
              : 'Choose the perfect plan for your business needs'}
          </p>
          <div className="mt-4 inline-block px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <p className="text-sm text-blue-400">
              Current Plan: <span className="font-semibold text-white capitalize">{currentPlan}</span>
            </p>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = plan.name === currentPlan
            const canUpgrade = isPlanAvailable(plan.name)
            const isSuggested = plan.name === suggestedPlan

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.highlighted || isSuggested
                    ? 'border-2 border-primary shadow-glow-lg'
                    : 'border border-dark-200'
                } ${isCurrentPlan ? 'opacity-60' : ''}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-cyan text-dark px-4 py-1 rounded-full text-sm font-semibold shadow-glow">
                      {plan.badge}
                    </span>
                  </div>
                )}
                {isSuggested && !plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Suggested
                    </span>
                  </div>
                )}
                {isCurrentPlan && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-green-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <CardHeader className="text-center pt-8">
                  <CardTitle className="text-2xl font-bold text-white">
                    {plan.displayName}
                  </CardTitle>
                  <CardDescription className="text-sm text-dark-800 mt-2 min-h-[60px]">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <div className="text-4xl font-bold text-primary">
                      {plan.price}
                    </div>
                    {plan.priceMonthly > 0 && (
                      <div className="text-dark-800 text-sm">/month</div>
                    )}
                    {plan.price === 'Custom' && (
                      <div className="text-dark-800 text-sm">pricing</div>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-dark-800">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrentPlan ? (
                    <Button
                      disabled
                      className="w-full bg-dark-200 text-dark-800 cursor-not-allowed"
                    >
                      Current Plan
                    </Button>
                  ) : canUpgrade ? (
                    <Button
                      onClick={() => handleSelectPlan(plan.name)}
                      className={`w-full ${
                        plan.highlighted || isSuggested
                          ? 'bg-gradient-cyan hover:shadow-glow-lg'
                          : 'bg-primary hover:bg-primary/90'
                      }`}
                    >
                      <Zap className="h-4 w-4 mr-2" />
                      {plan.name === 'premium' ? 'Contact Sales' : `Upgrade to ${plan.displayName}`}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full bg-dark-200 text-dark-800 cursor-not-allowed"
                    >
                      Lower Tier
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-12 text-center">
          <div className="bg-dark-50 border border-dark-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-white mb-2">
              Need help choosing?
            </h3>
            <p className="text-dark-800 mb-4">
              Our team is here to help you find the perfect plan for your business.
            </p>
            <Button 
              variant="outline" 
              className="border-primary text-primary hover:bg-primary hover:text-white"
              onClick={() => setShowContactSalesModal(true)}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </div>

      {/* Contact Sales Modal */}
      <ContactSalesModal 
        open={showContactSalesModal}
        onOpenChange={setShowContactSalesModal}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  )
}

