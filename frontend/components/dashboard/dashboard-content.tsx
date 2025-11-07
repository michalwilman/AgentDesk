'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { CreateBotForm } from './create-bot-form'
import { useLanguage } from '@/lib/contexts/LanguageContext'

interface Bot {
  id: string
  name: string
  description: string | null
  is_active: boolean
  language: string
  created_at: string
}

interface DashboardContentProps {
  bots: Bot[] | null
  hasExistingBot: boolean
  subscriptionStatus?: string
  botTrainingStatus: Record<string, boolean>
}

export function DashboardContent({ 
  bots, 
  hasExistingBot, 
  subscriptionStatus,
  botTrainingStatus 
}: DashboardContentProps) {
  const { t, dir } = useLanguage()

  return (
    <div className="space-y-8" dir={dir}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">{t('dashboard.title')}</h1>
        <p className="text-dark-800 mt-1">
          {t('dashboard.welcome')}! {t('dashboard.description')}
        </p>
      </div>

      {/* My Bots Section */}
      {bots && bots.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">{t('dashboard.myBots')}</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bots.map((bot) => (
              <Card key={bot.id} className="hover:shadow-md transition-shadow hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{bot.name}</CardTitle>
                      <CardDescription className="mt-1">
                        {bot.description || t('bot.noDescription')}
                      </CardDescription>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        bot.is_active
                          ? 'bg-primary/20 text-primary border border-primary/20'
                          : 'bg-dark-100 text-dark-800 border border-dark-100'
                      }`}
                    >
                      {bot.is_active ? t('bots.active') : t('bots.inactive')}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center text-sm text-dark-800">
                      <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                      <span>{t('bot.language')}: {bot.language === 'he' ? 'עברית' : 'English'}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-dark-800">{t('bot.status')}:</span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        botTrainingStatus[bot.id]
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {botTrainingStatus[bot.id] ? t('bot.trained') : t('bot.notTrained')}
                      </span>
                    </div>
                    <div className="text-sm text-[#666666] pt-2 border-t border-dark-100">
                      {t('bots.createdAt')} {formatDate(bot.created_at)}
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                      <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full">
                          {t('bots.settings')}
                        </Button>
                      </Link>
                      <Link href={`/dashboard/bots/${bot.id}/chat`} className="flex-1">
                        <Button size="sm" className="w-full">
                          {t('bot.testChat')}
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* No Bots State - Show inline form for first bot creation */}
      {(!bots || bots.length === 0) && (
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 text-center">
            <h3 className="text-2xl font-semibold text-white mb-2">
              {t('dashboard.noBots')}
            </h3>
            <p className="text-dark-800">
              {t('dashboard.noBotsDescription')}
            </p>
          </div>
          <Card className="border-primary/30">
            <CardHeader>
              <CardTitle>{t('bot.create')}</CardTitle>
              <CardDescription>
                Set up your first AI chatbot with custom settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateBotForm embedded onSuccess={() => {
                // Refresh the page after successful creation
                window.location.reload()
              }} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

