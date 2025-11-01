'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Bot, MessageSquare, Star, CheckCircle2, XCircle } from 'lucide-react'
import Link from 'next/link'

interface BotPerformance {
  id: string
  name: string
  is_active: boolean
  is_trained: boolean
  language: string
  total_chats: number
  avg_satisfaction: number | null
}

interface DashboardBotsPerformanceProps {
  bots: BotPerformance[]
}

export function DashboardBotsPerformance({ bots }: DashboardBotsPerformanceProps) {
  if (bots.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-primary" />
            Bots Performance
          </CardTitle>
          <CardDescription>Performance metrics for your bots</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-dark-800">
            <Bot className="h-12 w-12 mx-auto mb-3 opacity-40" />
            <p>No bots yet. Create your first bot to see performance metrics.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          Bots Performance
        </CardTitle>
        <CardDescription>Performance metrics for your bots</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {bots.map((bot) => (
            <Link 
              key={bot.id} 
              href={`/dashboard/bots/${bot.id}`}
              className="block"
            >
              <div className="flex items-center justify-between p-4 rounded-lg border border-dark-100 hover:border-primary/40 transition-colors bg-dark-50/50 hover:bg-dark-50">
                <div className="flex items-center gap-3 flex-1">
                  {/* Bot Icon */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      bot.is_active ? 'bg-primary/20' : 'bg-dark-100'
                    }`}
                  >
                    <Bot className={`h-5 w-5 ${bot.is_active ? 'text-primary' : 'text-dark-800'}`} />
                  </div>

                  {/* Bot Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white truncate">{bot.name}</h3>
                      {bot.is_active ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-dark-800">
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {bot.total_chats} chats
                      </span>
                      {bot.avg_satisfaction && (
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3 text-yellow-500" />
                          {bot.avg_satisfaction.toFixed(1)}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                        bot.is_trained 
                          ? 'bg-green-500/20 text-green-500' 
                          : 'bg-yellow-500/20 text-yellow-500'
                      }`}>
                        {bot.is_trained ? 'Trained' : 'Not Trained'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Language Badge */}
                <div className="ml-3">
                  <div className="px-3 py-1 rounded-full bg-dark-100 text-xs text-dark-800 font-medium">
                    {bot.language === 'he' ? '🇮🇱 Hebrew' : '🇺🇸 English'}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

