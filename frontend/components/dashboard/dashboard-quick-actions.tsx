'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, BarChart3, Settings, HelpCircle, CreditCard, FileText, UserPlus, Calendar } from 'lucide-react'
import Link from 'next/link'
import { usePlanLimits } from '@/hooks/usePlanLimits'

interface DashboardQuickActionsProps {
  hasExistingBot?: boolean
}

export function DashboardQuickActions({ hasExistingBot = false }: DashboardQuickActionsProps) {
  const [showBotLimitAlert, setShowBotLimitAlert] = useState(false)
  const { canCreateBot, plan, limits, usage } = usePlanLimits()
  
  // Check if user is at bot limit
  const isAtBotLimit = !canCreateBot()
  
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
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
          {actions.map((action) => {
            const Icon = action.icon
            const isCreateBot = action.label === 'Create New Bot'
            
            // Hide Create Bot button if user has reached their bot limit
            if (isCreateBot && isAtBotLimit) {
              return null
            }
            
            return (
              <div key={action.label} className="relative">
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
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

