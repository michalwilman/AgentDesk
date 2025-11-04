'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { MessageCircle, CheckCircle, XCircle, Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface SmsWhatsAppStatusProps {
  botId: string
  config: any
}

export function SmsWhatsAppStatus({ botId, config: initialConfig }: SmsWhatsAppStatusProps) {
  const router = useRouter()
  const [config, setConfig] = useState(initialConfig)
  const [isConfigured, setIsConfigured] = useState(false)

  useEffect(() => {
    // Update config when initialConfig changes
    setConfig(initialConfig)
  }, [initialConfig])

  useEffect(() => {
    // Check if SMS/WhatsApp is configured
    const configured = Boolean(
      config?.twilio_account_sid && 
      config?.twilio_auth_token &&
      (config?.sms_enabled || config?.whatsapp_enabled)
    )
    console.log('🔍 SMS/WhatsApp Status Check:', {
      twilio_account_sid: config?.twilio_account_sid ? '✅ Set' : '❌ Missing',
      twilio_auth_token: config?.twilio_auth_token ? '✅ Set' : '❌ Missing',
      sms_enabled: config?.sms_enabled,
      whatsapp_enabled: config?.whatsapp_enabled,
      configured,
    })
    setIsConfigured(configured)
  }, [config])

  const handleConfigure = () => {
    router.push(`/dashboard/bots/${botId}/actions`)
  }

  return (
    <div className="border-t border-dark-100 pt-4 mt-4">
      <label className="text-sm font-medium text-[#666666] flex items-center mb-3">
        <MessageCircle className="h-4 w-4 mr-2" />
        SMS & WhatsApp Notifications
      </label>
      <div className="bg-dark-50 border border-dark-100 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          {isConfigured ? (
            <>
              <CheckCircle className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-white font-medium">Connected</p>
                <p className="text-sm text-dark-800 mt-1">
                  {config?.sms_enabled && config?.whatsapp_enabled && 'SMS & WhatsApp notifications enabled'}
                  {config?.sms_enabled && !config?.whatsapp_enabled && 'SMS notifications enabled'}
                  {!config?.sms_enabled && config?.whatsapp_enabled && 'WhatsApp notifications enabled'}
                </p>
                {config?.reminder_enabled && (
                  <p className="text-xs text-primary mt-1">
                    📅 24h reminders active
                  </p>
                )}
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-5 w-5 text-dark-800 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-white font-medium">Not Connected</p>
                <p className="text-sm text-dark-800 mt-1">
                  Configure Twilio to send appointment confirmations and reminders via SMS or WhatsApp
                </p>
              </div>
            </>
          )}
        </div>
        <div className="flex gap-2 mt-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleConfigure}
          >
            <Settings className="h-4 w-4 mr-2" />
            {isConfigured ? 'Manage Settings' : 'Configure Now'}
          </Button>
        </div>
      </div>
    </div>
  )
}

