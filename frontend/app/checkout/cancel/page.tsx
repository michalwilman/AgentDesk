'use client'

import Link from 'next/link'
import { Bot, XCircle, ArrowLeft, MessageCircle, CreditCard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-dark relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl opacity-30"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-30"></div>

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

          {/* Cancel Card */}
          <Card className="shadow-glow animate-fade-in delay-100">
            <CardHeader className="text-center pb-6">
              <div className="mx-auto mb-6">
                <div className="bg-red-500/10 p-6 rounded-full inline-block border-2 border-red-500/20">
                  <XCircle className="h-16 w-16 text-red-500" />
                </div>
              </div>
              <CardTitle className="text-4xl font-bold text-white mb-2">
                Payment Cancelled
              </CardTitle>
              <p className="text-dark-800 text-lg">
                Your payment was not processed
              </p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Message */}
              <div className="bg-dark-50 p-6 rounded-2xl border border-red-500/20 text-center">
                <p className="text-white mb-2">
                  No charges were made to your account.
                </p>
                <p className="text-dark-800 text-sm">
                  You can try again whenever you're ready, or explore our other options.
                </p>
              </div>

              {/* Reasons & Help */}
              <div className="bg-gradient-dark p-6 rounded-2xl border border-primary/20 space-y-4">
                <h3 className="font-semibold text-white text-lg">
                  Common reasons for cancellation:
                </h3>
                <ul className="space-y-2 text-dark-800 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Changed your mind about the plan selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Need to update payment information</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Have questions before purchasing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary">•</span>
                    <span>Technical issues during checkout</span>
                  </li>
                </ul>
              </div>

              {/* Quick Actions */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-dark-50 p-5 rounded-xl border border-primary/20 text-center hover-lift">
                  <CreditCard className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Try Again</h4>
                  <p className="text-xs text-dark-800 mb-4">
                    Ready to complete your purchase?
                  </p>
                  <Link href="/pricing">
                    <Button variant="outline" className="w-full rounded-full" size="sm">
                      View Plans
                    </Button>
                  </Link>
                </div>

                <div className="bg-dark-50 p-5 rounded-xl border border-primary/20 text-center hover-lift">
                  <MessageCircle className="h-8 w-8 text-primary mx-auto mb-3" />
                  <h4 className="font-semibold text-white mb-2">Need Help?</h4>
                  <p className="text-xs text-dark-800 mb-4">
                    Our team is here to assist you
                  </p>
                  <Link href="/support">
                    <Button variant="outline" className="w-full rounded-full" size="sm">
                      Contact Support
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3 pt-4">
                <Link href="/pricing" className="block">
                  <Button className="w-full bg-gradient-cyan hover:shadow-glow-lg transition-smooth rounded-full py-6 text-dark font-semibold text-lg">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Pricing
                  </Button>
                </Link>

                <Link href="/dashboard">
                  <Button variant="outline" className="w-full rounded-full py-3">
                    Go to Dashboard
                  </Button>
                </Link>
              </div>

              {/* FAQ Suggestion */}
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 text-center">
                <p className="text-sm text-dark-800">
                  Have questions about our plans?{' '}
                  <Link href="/pricing#faq" className="text-primary hover:text-primary/80 transition-smooth font-medium">
                    Check our FAQ
                  </Link>
                  {' '}or{' '}
                  <Link href="/support" className="text-primary hover:text-primary/80 transition-smooth font-medium">
                    chat with us
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Info */}
          <div className="text-center mt-6 text-sm text-dark-800 animate-fade-in delay-200">
            <p>
              Start with our{' '}
              <Link href="/register?plan=starter" className="text-primary hover:text-primary/80 transition-smooth">
                free 7-day trial
              </Link>
              {' '}— no credit card required
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

