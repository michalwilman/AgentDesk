'use client'

import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import Link from 'next/link'
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

  // If user is at their bot limit, don't show the button at all
  if (isAtLimit) {
    return null
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

