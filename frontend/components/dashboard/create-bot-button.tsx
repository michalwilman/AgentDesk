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

interface CreateBotButtonProps {
  hasExistingBot: boolean
  subscriptionStatus?: string
}

export function CreateBotButton({ hasExistingBot, subscriptionStatus }: CreateBotButtonProps) {
  // If user already has a bot and is on free/trial plan, show disabled button with tooltip
  if (hasExistingBot && (subscriptionStatus === 'trial' || subscriptionStatus === 'free' || !subscriptionStatus)) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div>
              <Button disabled className="gap-2">
                <Lock className="h-4 w-4" />
                Create Bot
              </Button>
            </div>
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <div className="space-y-2">
              <p className="font-semibold">Bot Limit Reached</p>
              <p className="text-sm">
                You already have a bot. Upgrade your plan to create more bots and unlock additional features.
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
        Create Bot
      </Button>
    </Link>
  )
}

