'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { MessageSquare, ExternalLink, Check, X } from 'lucide-react'

interface Bot {
  id: string
  telegram_token?: string | null
  telegram_bot_username?: string | null
}

interface ChannelConnectionsProps {
  bot: Bot
}

export function ChannelConnections({ bot }: ChannelConnectionsProps) {
  // Telegram state
  const [telegramToken, setTelegramToken] = useState(bot.telegram_token || '')
  const [telegramUsername, setTelegramUsername] = useState(bot.telegram_bot_username || '')
  const [telegramLoading, setTelegramLoading] = useState(false)
  const [telegramSuccess, setTelegramSuccess] = useState(false)

  // Check connection status
  const isTelegramConnected = Boolean(bot.telegram_token && bot.telegram_bot_username)

  const handleTelegramSave = async () => {
    setTelegramLoading(true)
    setTelegramSuccess(false)

    try {
      const response = await fetch(`/api/bots/${bot.id}/channels`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegram_token: telegramToken,
          telegram_bot_username: telegramUsername,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save Telegram configuration')
      }

      setTelegramSuccess(true)
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error) {
      console.error('Error saving Telegram config:', error)
      alert('Failed to save Telegram configuration. Please try again.')
    } finally {
      setTelegramLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Telegram Section */}
      <Card className="p-6 border-primary/20">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-[#0088cc]/20 rounded-lg">
              <MessageSquare className="h-6 w-6 text-[#0088cc]" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Connect to Telegram</h3>
              <p className="text-sm text-dark-800">
                {isTelegramConnected ? (
                  <span className="flex items-center text-primary">
                    <Check className="h-4 w-4 mr-1" />
                    Connected
                  </span>
                ) : (
                  <span className="flex items-center text-dark-800">
                    <X className="h-4 w-4 mr-1" />
                    Not Connected
                  </span>
                )}
              </p>
            </div>
          </div>
          {isTelegramConnected && bot.telegram_bot_username && (
            <a
              href={`https://t.me/${bot.telegram_bot_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-sm text-primary hover:underline"
            >
              Open Bot
              <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          )}
        </div>

        <div className="space-y-4">
          <div className="bg-dark-50 p-4 rounded-lg border border-dark-100 text-sm text-dark-800">
            <p className="font-medium text-white mb-2">Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Open Telegram and search for <span className="font-mono text-primary">@BotFather</span></li>
              <li>Send <span className="font-mono text-primary">/newbot</span> and follow the instructions</li>
              <li>Copy the API token and username provided</li>
              <li>Paste them below and click Save</li>
            </ol>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[#666666] mb-2">
                Bot API Token
              </label>
              <Input
                type="text"
                placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
                value={telegramToken}
                onChange={(e) => setTelegramToken(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#666666] mb-2">
                Bot Username (without @)
              </label>
              <Input
                type="text"
                placeholder="my_awesome_bot"
                value={telegramUsername}
                onChange={(e) => setTelegramUsername(e.target.value)}
              />
            </div>

            <Button
              onClick={handleTelegramSave}
              disabled={!telegramToken || !telegramUsername || telegramLoading}
              className="w-full"
            >
              {telegramLoading ? 'Saving...' : telegramSuccess ? 'Saved!' : 'Save Telegram Configuration'}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}

