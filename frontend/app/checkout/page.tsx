'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Bot, CreditCard, Check, ShieldCheck } from 'lucide-react'

interface PlanDetails {
  name: string
  price: number
  currency: string
  features: string[]
}

const PLAN_DETAILS: Record<string, PlanDetails> = {
  starter: {
    name: 'Starter',
    price: 24.17,
    currency: 'USD',
    features: ['100 billable conversations', 'Basic analytics', 'Live visitors list', 'Operating hours', 'AI Copilot', '50 AI conversations (one-time)', '100 flow visitors reached']
  },
  growth: {
    name: 'Growth',
    price: 49.17,
    currency: 'USD',
    features: ['250 billable conversations', 'Advanced analytics', 'Power features', 'No branding option', 'Permissions', '50 AI conversations (one-time)', '100 flow visitors reached']
  },
  plus: {
    name: 'Plus',
    price: 749,
    currency: 'USD',
    features: ['Custom billable quota', 'Dedicated success manager', 'Custom branding', 'Multiple projects', 'Departments', 'Multilanguage', 'OpenAPI', 'Live chat human support', 'From 300 AI conversations', 'Custom flow limits']
  },
  premium: {
    name: 'Premium',
    price: 0,
    currency: 'USD',
    features: ['Managed AI agent', '50% resolution guarantee', 'Pay per resolution', 'Mobile SDK', 'Priority support + premium', 'Super admin', 'Analytics & monitoring', 'From 3000 AI conversations', 'Expanded flow limits']
  }
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [plan, setPlan] = useState<string>('growth')
  const [planDetails, setPlanDetails] = useState<PlanDetails>(PLAN_DETAILS.growth)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Card details (UI only)
  const [cardNumber, setCardNumber] = useState('')
  const [cardName, setCardName] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCvv, setCardCvv] = useState('')

  useEffect(() => {
    const planParam = searchParams.get('plan') || 'growth'
    setPlan(planParam)
    setPlanDetails(PLAN_DETAILS[planParam] || PLAN_DETAILS.growth)

    // Check if user is authenticated
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Redirect to register with plan parameter
        router.push(`/register?plan=${planParam}`)
        return
      }
      
      setUser(user)
      setLoading(false)
    }

    checkUser()
  }, [searchParams, router])

  const createOrder = (data: any, actions: any) => {
    return actions.order.create({
      purchase_units: [
        {
          amount: {
            value: planDetails.price.toString(),
            currency_code: planDetails.currency,
          },
          description: `AgentDesk ${planDetails.name} Plan`,
        },
      ],
    })
  }

  const onApprove = async (data: any, actions: any) => {
    try {
      const order = await actions.order.capture()
      
      // Save transaction to database
      const supabase = createClient()
      const { error: insertError } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          plan: plan,
          amount: planDetails.price,
          currency: planDetails.currency,
          status: 'success',
          paypal_order_id: order.id,
          full_name: user.user_metadata?.full_name || user.email,
          email: user.email,
          metadata: {
            order_details: order,
          }
        })

      if (insertError) {
        console.error('Error saving transaction:', insertError)
      }

      // Update user subscription tier
      await supabase
        .from('users')
        .update({ subscription_tier: plan })
        .eq('id', user.id)

      // Redirect to success page
      router.push(`/checkout/success?order_id=${order.id}&plan=${plan}`)
    } catch (error: any) {
      console.error('Payment error:', error)
      setError('Payment processing failed. Please try again.')
    }
  }

  const onError = (err: any) => {
    console.error('PayPal error:', err)
    setError('Payment failed. Please try again or contact support.')
  }

  const onCancel = () => {
    router.push('/checkout/cancel')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <div className="text-center">
          <Bot className="h-12 w-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-dark-800">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
        currency: 'ILS',
        intent: 'capture',
      }}
    >
      <div className="min-h-screen bg-dark py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          {/* Header */}
          <div className="text-center mb-12">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="bg-gradient-cyan p-2 rounded-xl shadow-glow">
                <Bot className="h-8 w-8 text-dark" />
              </div>
              <span className="text-3xl font-bold text-primary text-glow">AgentDesk</span>
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">Complete Your Purchase</h1>
            <p className="text-dark-800">Secure checkout powered by PayPal</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Summary */}
            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-2xl">Order Summary</CardTitle>
                  <CardDescription>Review your selected plan</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-dark-50 rounded-xl border border-primary/20">
                    <div>
                      <h3 className="text-xl font-bold text-white">{planDetails.name} Plan</h3>
                      <p className="text-sm text-dark-800">Monthly subscription</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-primary text-glow">
                        ${planDetails.price}
                      </div>
                      <p className="text-xs text-dark-800">per month</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <Check className="h-5 w-5 text-primary" />
                      Included Features
                    </h4>
                    <ul className="space-y-2">
                      {planDetails.features.map((feature, index) => (
                        <li key={index} className="flex items-start space-x-2 text-dark-800">
                          <Check className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-dark-100">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-dark-800">Subtotal</span>
                      <span className="text-white">${planDetails.price}</span>
                    </div>
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-dark-800">VAT (17%)</span>
                      <span className="text-white">${(planDetails.price * 0.17).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center text-xl font-bold">
                      <span className="text-white">Total</span>
                      <span className="text-primary text-glow">${(planDetails.price * 1.17).toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-3 p-4 bg-dark-50 rounded-xl border border-primary/20">
                <ShieldCheck className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-white mb-1">Secure Payment</h4>
                  <p className="text-sm text-dark-800">
                    Your payment information is encrypted and secure. We use PayPal's industry-standard security.
                  </p>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-6 w-6 text-primary" />
                    Payment Method
                  </CardTitle>
                  <CardDescription>Choose your preferred payment option</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Credit Card Form (UI Only) */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-white">Credit Card (Coming Soon)</h3>
                    <Input
                      label="Card Number"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      disabled
                    />
                    <Input
                      label="Cardholder Name"
                      type="text"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      disabled
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Expiry Date"
                        type="text"
                        placeholder="MM/YY"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        disabled
                      />
                      <Input
                        label="CVV"
                        type="text"
                        placeholder="123"
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                        disabled
                      />
                    </div>
                    <p className="text-xs text-dark-800 italic">
                      Direct credit card payment will be available soon. Please use PayPal below.
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-dark-100"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-dark-50 text-dark-800">Or pay with PayPal</span>
                    </div>
                  </div>

                  {/* PayPal Button */}
                  <div className="space-y-3">
                    <PayPalButtons
                      createOrder={createOrder}
                      onApprove={onApprove}
                      onError={onError}
                      onCancel={onCancel}
                      style={{
                        layout: 'vertical',
                        color: 'blue',
                        shape: 'rect',
                        label: 'pay',
                      }}
                    />
                  </div>

                  <div className="text-center">
                    <Link href="/pricing" className="text-primary hover:text-primary/80 transition-smooth text-sm">
                      ← Back to Pricing
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </PayPalScriptProvider>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <Bot className="h-12 w-12 text-primary animate-pulse" />
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

