'use client'

import { Button } from '@/components/ui/button'
import { Plus, Lock } from 'lucide-react'
import Link from 'next/link'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { usePlanLimits } from '@/hooks/usePlanLimits'
import { useLanguage } from '@/lib/contexts/LanguageContext'

interface CreateBotButtonProps {
  hasExistingBot?: boolean
  subscriptionStatus?: string
}

export function CreateBotButton({ hasExistingBot, subscriptionStatus }: CreateBotButtonProps = {}) {
  const { canCreateBot, plan, limits, usage, loading } = usePlanLimits()
  const { t } = useLanguage()

  // Show loading state
  if (loading) {
    return (
      <Button disabled className="gap-2">
        <Plus className="h-4 w-4" />
        {t('dashboard.createNewBot')}
      </Button>
    )
  }

  // Check if user can create bot based on plan limits
  const isAtLimit = !canCreateBot()

  // If user is at their bot limit, show disabled button with tooltip
  if (isAtLimit) {
    const currentCount = usage?.bots_created || 0
    const maxBots = limits?.max_bots || 1

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button disabled className="gap-2">
                <Lock className="h-4 w-4" />
                {t('dashboard.createNewBot')}
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Bot Limit Reached</p>
              <p className="text-sm">
                You've created {currentCount} of {maxBots} bot{maxBots > 1 ? 's' : ''} in your {plan} plan.
                Upgrade to create more bots.
              </p>
              <Link href="/pricing" className="block">
                <Button size="sm" className="w-full mt-2">
                  View Plans →
                </Button>
              </Link>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  // User can create a bot
  return (
    <Link href="/dashboard/bots/new">
      <Button className="gap-2">
        <Plus className="h-4 w-4" />
        {t('dashboard.createNewBot')}
      </Button>
    </Link>
  )
}

