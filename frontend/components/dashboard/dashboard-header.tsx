'use client'

import { useLanguage } from '@/lib/contexts/LanguageContext'
import { CreateBotButton } from './create-bot-button'

interface DashboardHeaderProps {
  userName?: string
  botsCount: number
}

export function DashboardHeader({ userName, botsCount }: DashboardHeaderProps) {
  const { t } = useLanguage()

  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white">
          {t('dashboard.welcome')}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="text-dark-800 mt-1">
          {botsCount === 0 
            ? t('dashboard.noBotsDescription')
            : `${botsCount} ${t('dashboard.myBots')}`
          }
        </p>
      </div>
      <CreateBotButton />
    </div>
  )
}

