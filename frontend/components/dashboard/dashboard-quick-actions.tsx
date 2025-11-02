'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Settings, HelpCircle, CreditCard, FileText, UserPlus, Calendar } from 'lucide-react'
import Link from 'next/link'

interface DashboardQuickActionsProps {
  hasExistingBot?: boolean
}

export function DashboardQuickActions({ hasExistingBot = false }: DashboardQuickActionsProps) {
  const [showBotLimitAlert, setShowBotLimitAlert] = useState(false)
  
  const actions = [
    {
      label: 'Create New Bot',
      icon: Plus,
      href: '/dashboard/bots/new',
      variant: 'primary' as const,
      description: 'Set up a new AI chatbot',
    },
    {
      label: 'View Leads',
      icon: UserPlus,
      href: '/dashboard/leads',
      variant: 'outline' as const,
      description: 'See all captured leads',
    },
    {
      label: 'Appointments',
      icon: Calendar,
      href: '/dashboard/appointments',
      variant: 'outline' as const,
      description: 'Manage scheduled meetings',
    },
    {
      label: 'View Analytics',
      icon: BarChart3,
      href: '/dashboard/analytics',
      variant: 'outline' as const,
      description: 'See detailed statistics',
    },
    {
      label: 'Documentation',
      icon: FileText,
      href: '/docs',
      variant: 'outline' as const,
      description: 'Learn how to use AgentDesk',
    },
    {
      label: 'Billing',
      icon: CreditCard,
      href: '/dashboard/billing',
      variant: 'outline' as const,
      description: 'Manage subscription',
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/dashboard/settings',
      variant: 'outline' as const,
      description: 'Configure your account',
    },
    {
      label: 'Help & Support',
      icon: HelpCircle,
      href: '/support',
      variant: 'outline' as const,
      description: 'Get help when you need it',
    },
  ]

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and shortcuts</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Bot Limit Alert */}
        {showBotLimitAlert && (
          <div className="mb-4 p-4 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
            <h3 className="text-yellow-500 font-semibold mb-2">Bot Limit Reached</h3>
            <p className="text-sm text-white mb-3">
              You already have a bot. Upgrade your plan to create more bots and unlock additional features.
            </p>
            <Link href="/pricing">
              <Button variant="outline" size="sm">
                View Plans →
              </Button>
            </Link>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            const isCreateBot = action.label === 'Create New Bot'
            const isDisabled = isCreateBot && hasExistingBot
            
            return (
              <div key={action.label} className="relative">
                {isCreateBot && hasExistingBot ? (
                  <Button
                    variant={action.variant}
                    className="w-full h-auto flex flex-col items-center gap-2 py-4 px-3 opacity-50 cursor-not-allowed"
                    title="Only 1 bot allowed per subscription"
                    onClick={(e) => {
                      e.preventDefault()
                      setShowBotLimitAlert(true)
                      setTimeout(() => setShowBotLimitAlert(false), 5000)
                    }}
                    disabled={isDisabled}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="text-xs text-center leading-tight">
                      {action.label}
                    </span>
                  </Button>
                ) : (
                  <Link href={action.href}>
                    <Button
                      variant={action.variant}
                      className="w-full h-auto flex flex-col items-center gap-2 py-4 px-3"
                      title={action.description}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="text-xs text-center leading-tight">
                        {action.label}
                      </span>
                    </Button>
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

