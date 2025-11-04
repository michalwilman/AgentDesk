'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Bot, CheckCircle, ArrowRight, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

function SuccessContent() {
  const searchParams = useSearchParams()
  const [orderId, setOrderId] = useState('')
  const [plan, setPlan] = useState('')
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    setOrderId(searchParams.get('order_id') || '')
    setPlan(searchParams.get('plan') || 'pro')
    setShowConfetti(true)

    // Hide confetti after animation
    const timer = setTimeout(() => setShowConfetti(false), 5000)
    return () => clearTimeout(timer)
  }, [searchParams])

  const planNames: Record<string, string> = {
    starter: 'Starter',
    growth: 'Growth',
    plus: 'Plus',
    premium: 'Premium',
  }

  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse delay-100"></div>

      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${3 + Math.random() * 2}s`,
              }}
            >
              <Sparkles className="h-4 w-4 text-primary opacity-60" />
            </div>
          ))}
        </div>
      )}

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-12">
        <div className="max-w-2xl w-full">
          {/* Header */}
          <div className="text-center mb-8 animate-fade-in">
            <Link href="/" className="inline-flex items-center space-x-2 mb-6">
              <div className="bg-gradient-cyan p-2 rounded-xl shadow-glow">
                <Bot className="h-8 w-8 text-dark" />
              </div>
              <span className="text-3xl font-bold text-primary text-glow">AgentDesk</span>
            </Link>
          </div>

          {/* Success Card */}
          <Card className="shadow-glow-lg animate-fade-in delay-100">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6 relative">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse"></div>
                <div className="relative bg-gradient-cyan p-6 rounded-full inline-block shadow-glow-lg">
                  <CheckCircle className="h-16 w-16 text-dark" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-white mb-2">
                Payment Successful! 🎉
              </CardTitle>
              <p className="text-dark-800 text-lg">
                Welcome to the {planNames[plan]} plan
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Order Details */}
              <div className="bg-dark-50 p-6 rounded-2xl border border-primary/20 space-y-3">
                <h3 className="font-semibold text-white text-lg mb-4">Order Details</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-dark-800 mb-1">Plan</p>
                    <p className="text-white font-medium">{planNames[plan]} Plan</p>
                  </div>
                  <div>
                    <p className="text-dark-800 mb-1">Order ID</p>
                    <p className="text-white font-medium font-mono text-xs break-all">
                      {orderId || 'Processing...'}
                    </p>
                  </div>
                  <div>
                    <p className="text-dark-800 mb-1">Status</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-green-500 font-medium">Completed</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-dark-800 mb-1">Date</p>
                    <p className="text-white font-medium">
                      {new Date().toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* What's Next */}
              <div className="bg-gradient-dark p-6 rounded-2xl border border-primary/20 space-y-4">
                <h3 className="font-semibold text-white text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-primary" />
                  What's Next?
                </h3>
                <ul className="space-y-3 text-dark-800">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>Your subscription has been activated</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>A confirmation email has been sent to your inbox</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <span>You can now create and manage your AI bots from the dashboard</span>
                  </li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4">
                <Link href="/dashboard" className="block">
                  <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold text-lg group">
                    Go to Dashboard
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <div className="grid grid-cols-2 gap-3">
                  <Link href="/dashboard/bots/new">
                    <Button variant="outline" className="w-full rounded-full py-3">
                      Create Your First Bot
                    </Button>
                  </Link>
                  <Link href="/support">
                    <Button variant="outline" className="w-full rounded-full py-3">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Help Text */}
              <div className="text-center pt-4 border-t border-dark-100">
                <p className="text-sm text-dark-800">
                  Need help getting started?{' '}
                  <Link href="/support" className="text-primary hover:text-primary/80 transition-smooth">
                    Visit our support center
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center mt-6 text-sm text-dark-800 animate-fade-in delay-200">
            <p>Thank you for choosing AgentDesk! 🚀</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-dark">
        <Bot className="h-12 w-12 text-primary animate-pulse" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}

