'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { useSearchParams } from 'next/navigation'
import { 
  UserPlus, 
  Calendar, 
  Mail, 
  FileText, 
  MessageCircle, 
  Zap,
  Save,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Eye,
  EyeOff
} from 'lucide-react'

interface ActionsConfigFormProps {
  bot: any
  config: any
}

export function ActionsConfigForm({ bot, config: initialConfig }: ActionsConfigFormProps) {
  const [config, setConfig] = useState(initialConfig || {})
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [googleConnected, setGoogleConnected] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showAccountSid, setShowAccountSid] = useState(false)
  const [showAuthToken, setShowAuthToken] = useState(false)
  const [showWhatsAppNumber, setShowWhatsAppNumber] = useState(false)
  const searchParams = useSearchParams()
  const supabase = createClient()

  // Check Google Calendar connection status on mount
  useEffect(() => {
    checkGoogleConnectionStatus()
    
    // Check for OAuth callback messages
    const googleConnectedParam = searchParams?.get('google_connected')
    const googleErrorParam = searchParams?.get('google_error')
    
    if (googleConnectedParam === 'true') {
      setMessage({ type: 'success', text: 'Google Calendar connected successfully!' })
      checkGoogleConnectionStatus()
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (googleErrorParam === 'true') {
      setMessage({ type: 'error', text: 'Failed to connect Google Calendar. Please try again.' })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [searchParams])

  const checkGoogleConnectionStatus = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${backendUrl}/api/actions/google/status?bot_id=${bot.id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      )
      
      const data = await response.json()
      setGoogleConnected(data.connected || false)
    } catch (error) {
      console.error('Error checking Google connection:', error)
    }
  }

  const handleConnectGoogle = async () => {
    setGoogleLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()
      
      // Redirect to Google OAuth flow
      window.location.href = `${backendUrl}/api/actions/google/authorize?bot_id=${bot.id}`
    } catch (error) {
      console.error('Error connecting to Google:', error)
      setMessage({ type: 'error', text: 'Failed to initiate Google connection' })
      setGoogleLoading(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return
    }
    
    setGoogleLoading(true)
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch(
        `${backendUrl}/api/actions/google/disconnect?bot_id=${bot.id}`,
        {
          headers: {
            Authorization: `Bearer ${session?.access_token}`,
          },
        }
      )
      
      const data = await response.json()
      
      if (data.success) {
        setGoogleConnected(false)
        updateConfig('appointments_enabled', false)
        setMessage({ type: 'success', text: 'Google Calendar disconnected successfully' })
      } else {
        throw new Error('Failed to disconnect')
      }
    } catch (error) {
      console.error('Error disconnecting Google:', error)
      setMessage({ type: 'error', text: 'Failed to disconnect Google Calendar' })
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleSave = async () => {
    console.log('🔵 Save button clicked!')
    console.log('📦 Config to save:', config)
    
    setLoading(true)
    setMessage(null)

    try {
      console.log('🚀 Calling Supabase upsert...')
      const { data, error } = await supabase
        .from('bot_actions_config')
        .upsert([{ bot_id: bot.id, ...config }], { onConflict: 'bot_id' })
        .select()

      console.log('📥 Supabase response:', { data, error })

      if (error) {
        console.error('❌ Supabase error:', error)
        throw new Error(error.message || 'Failed to save configuration')
      }

      console.log('✅ Save successful!')
      setMessage({ type: 'success', text: '✅ Configuration saved successfully!' })
      
      // Reload page after 1.5 seconds to show updated status
      setTimeout(() => {
        console.log('🔄 Reloading page...')
        window.location.reload()
      }, 1500)
    } catch (error) {
      console.error('💥 Error saving config:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to save configuration'
      setMessage({ type: 'error', text: `❌ ${errorMessage}` })
    } finally {
      setLoading(false)
    }
  }

  const updateConfig = (field: string, value: any) => {
    setConfig((prev: any) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-500/20 text-green-500 border border-green-500/30'
              : 'bg-red-500/20 text-red-500 border border-red-500/30'
          }`}
        >
          <AlertCircle className="h-5 w-5" />
          <span>{message.text}</span>
        </div>
      )}

      {/* Lead Collection */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserPlus className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Lead Collection</CardTitle>
                <CardDescription>
                  Automatically capture customer information when they express interest
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.lead_collection_enabled || false}
              onCheckedChange={(checked) => updateConfig('lead_collection_enabled', checked)}
            />
          </div>
        </CardHeader>
        {config.lead_collection_enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Notification Email (optional)</Label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={config.lead_notification_email || ''}
                onChange={(e) => updateConfig('lead_notification_email', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-dark-800 mt-1">
                Get notified when a new lead is captured
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Appointment Scheduling</CardTitle>
                <CardDescription>
                  Let the bot schedule meetings automatically via Google Calendar
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.appointments_enabled || false}
              onCheckedChange={(checked) => updateConfig('appointments_enabled', checked)}
              disabled={!googleConnected}
            />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Google Calendar Connection Status */}
          <div className="space-y-3">
            {googleConnected ? (
              <>
                <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="text-sm font-medium text-white">Google Calendar Connected</p>
                      <p className="text-xs text-dark-800">Your bot can now schedule appointments</p>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDisconnectGoogle}
                    disabled={googleLoading}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Disconnect
                  </Button>
                </div>
                
                {/* Show Calendar Error if exists and is newer than last success */}
                {config.google_calendar_last_error && (
                  !config.google_calendar_last_success_time ||
                  new Date(config.google_calendar_last_error_time || 0) > new Date(config.google_calendar_last_success_time || 0)
                ) && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-500">Calendar Sync Error</p>
                        <p className="text-xs text-red-400 mt-1">{config.google_calendar_last_error}</p>
                        <p className="text-xs text-dark-800 mt-1">
                          Last occurred: {new Date(config.google_calendar_last_error_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Show Email Error if exists and is newer than last success */}
                {config.email_last_error && (
                  !config.email_last_success_time ||
                  new Date(config.email_last_error_time || 0) > new Date(config.email_last_success_time || 0)
                ) && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-red-500">Email Sending Error</p>
                        <p className="text-xs text-red-400 mt-1">{config.email_last_error}</p>
                        <p className="text-xs text-dark-800 mt-1">
                          Last occurred: {new Date(config.email_last_error_time).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-3">
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400">
                    📌 Connect your Google Calendar to enable appointment scheduling
                  </p>
                </div>
                <Button
                  onClick={handleConnectGoogle}
                  disabled={googleLoading}
                  className="w-full"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  {googleLoading ? 'Connecting...' : 'Connect Google Calendar'}
                </Button>
              </div>
            )}
          </div>

          {/* Additional Settings (only show when connected and enabled) */}
          {googleConnected && config.appointments_enabled && (
            <div>
              <Label>Default Meeting Duration (minutes)</Label>
              <Input
                type="number"
                min="15"
                step="15"
                value={config.appointment_duration_default || 30}
                onChange={(e) => updateConfig('appointment_duration_default', parseInt(e.target.value))}
                className="mt-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Mail className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Email Sending</CardTitle>
                <CardDescription>
                  Send automated emails to customers via Resend
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.email_enabled || false}
              onCheckedChange={(checked) => updateConfig('email_enabled', checked)}
            />
          </div>
        </CardHeader>
        {config.email_enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Email Provider API Key</Label>
              <Input
                type="password"
                placeholder="re_xxxxx (Resend API Key)"
                value={config.email_api_key || ''}
                onChange={(e) => updateConfig('email_api_key', e.target.value)}
                className="mt-2"
              />
              <p className="text-sm text-dark-800 mt-1">
                Get your API key from{' '}
                <a href="https://resend.com" target="_blank" rel="noopener" className="text-primary hover:underline">
                  resend.com
                </a>
              </p>
            </div>
            <div>
              <Label>From Email Address</Label>
              <Input
                type="email"
                placeholder="bot@yourdomain.com"
                value={config.email_from_address || ''}
                onChange={(e) => updateConfig('email_from_address', e.target.value)}
                className="mt-2"
              />
            </div>
            <div>
              <Label>From Name</Label>
              <Input
                type="text"
                placeholder="Support Team"
                value={config.email_from_name || ''}
                onChange={(e) => updateConfig('email_from_name', e.target.value)}
                className="mt-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* PDF Generation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>PDF Generation</CardTitle>
                <CardDescription>
                  Generate quotes, proposals, and documents automatically
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.pdf_enabled || false}
              onCheckedChange={(checked) => updateConfig('pdf_enabled', checked)}
            />
          </div>
        </CardHeader>
        {config.pdf_enabled && (
          <CardContent>
            <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400">
                ✅ PDF templates are pre-configured: Quote, Proposal, Invoice
              </p>
            </div>
          </CardContent>
        )}
      </Card>

      {/* SMS & WhatsApp Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>SMS & WhatsApp Notifications</CardTitle>
              <CardDescription>
                Send appointment confirmations and reminders via SMS or WhatsApp using Twilio
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Twilio Configuration */}
          <div className="space-y-4 p-4 bg-dark-100 rounded-lg">
            <h4 className="text-sm font-semibold text-white">Twilio Configuration</h4>
            
            <div>
              <Label>Twilio Account SID</Label>
              <div className="relative mt-2">
                <Input
                  type={showAccountSid ? "text" : "password"}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  value={config.twilio_account_sid || ''}
                  onChange={(e) => updateConfig('twilio_account_sid', e.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowAccountSid(!showAccountSid)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-800 hover:text-primary transition-colors"
                  aria-label={showAccountSid ? "Hide Account SID" : "Show Account SID"}
                >
                  {showAccountSid ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <Label>Twilio Auth Token</Label>
              <div className="relative mt-2">
                <Input
                  type={showAuthToken ? "text" : "password"}
                  placeholder="Auth Token"
                  value={config.twilio_auth_token || ''}
                  onChange={(e) => updateConfig('twilio_auth_token', e.target.value)}
                  className="pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-800 hover:text-primary transition-colors"
                  aria-label={showAuthToken ? "Hide Auth Token" : "Show Auth Token"}
                >
                  {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <p className="text-xs text-dark-800">
              Get your credentials from{' '}
              <a href="https://console.twilio.com" target="_blank" rel="noopener" className="text-primary hover:underline">
                console.twilio.com
              </a>
            </p>
          </div>

          {/* SMS Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">SMS Notifications</h4>
                <p className="text-xs text-dark-800 mt-1">
                  Send appointment confirmations via SMS
                </p>
              </div>
              <Switch
                checked={config.sms_enabled || false}
                onCheckedChange={(checked) => updateConfig('sms_enabled', checked)}
                disabled={!config.twilio_account_sid || !config.twilio_auth_token}
              />
            </div>

            {config.sms_enabled && (
              <div>
                <Label>Twilio Phone Number</Label>
                <Input
                  type="tel"
                  placeholder="+1234567890 (E.164 format)"
                  value={config.twilio_phone_number || ''}
                  onChange={(e) => updateConfig('twilio_phone_number', e.target.value)}
                  className="mt-2"
                />
                <p className="text-xs text-dark-800 mt-1">
                  Your Twilio phone number in E.164 format (e.g., +1234567890)
                </p>
              </div>
            )}
          </div>

          {/* WhatsApp Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">WhatsApp Notifications</h4>
                <p className="text-xs text-dark-800 mt-1">
                  Send appointment confirmations via WhatsApp
                </p>
              </div>
              <Switch
                checked={config.whatsapp_enabled || false}
                onCheckedChange={(checked) => updateConfig('whatsapp_enabled', checked)}
                disabled={!config.twilio_account_sid || !config.twilio_auth_token}
              />
            </div>

            {config.whatsapp_enabled && (
              <div>
                <Label>Twilio WhatsApp Number</Label>
                <div className="relative mt-2">
                  <Input
                    type={showWhatsAppNumber ? "tel" : "password"}
                    placeholder="+1234567890 (E.164 format)"
                    value={config.twilio_whatsapp_number || ''}
                    onChange={(e) => updateConfig('twilio_whatsapp_number', e.target.value)}
                    className="pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowWhatsAppNumber(!showWhatsAppNumber)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-dark-800 hover:text-primary transition-colors"
                    aria-label={showWhatsAppNumber ? "Hide WhatsApp Number" : "Show WhatsApp Number"}
                  >
                    {showWhatsAppNumber ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <p className="text-xs text-dark-800 mt-1">
                  Your Twilio WhatsApp-enabled number (must be configured in Twilio)
                </p>
              </div>
            )}
          </div>

          {/* Reminder Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-white">24h Reminders</h4>
                <p className="text-xs text-dark-800 mt-1">
                  Send automatic reminders 24 hours before appointments
                </p>
              </div>
              <Switch
                checked={config.reminder_enabled !== false} // Default to true
                onCheckedChange={(checked) => updateConfig('reminder_enabled', checked)}
                disabled={!config.sms_enabled && !config.whatsapp_enabled}
              />
            </div>

            {(config.sms_enabled || config.whatsapp_enabled) && (
              <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-400">
                  💡 Reminders are sent daily at 08:00 AM for appointments scheduled in the next 24 hours
                </p>
              </div>
            )}
          </div>

          {/* Show SMS Error if exists and is newer than last success */}
          {config.sms_last_error && (
            !config.sms_last_success_time ||
            new Date(config.sms_last_error_time || 0) > new Date(config.sms_last_success_time || 0)
          ) && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-500">SMS/WhatsApp Error</p>
                  <p className="text-xs text-red-400 mt-1">{config.sms_last_error}</p>
                  <p className="text-xs text-dark-800 mt-1">
                    Last occurred: {new Date(config.sms_last_error_time).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Webhooks */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Zap className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Webhooks & Automations</CardTitle>
                <CardDescription>
                  Trigger Make.com, Zapier, or custom webhooks
                </CardDescription>
              </div>
            </div>
            <Switch
              checked={config.webhooks_enabled || false}
              onCheckedChange={(checked) => updateConfig('webhooks_enabled', checked)}
            />
          </div>
        </CardHeader>
        {config.webhooks_enabled && (
          <CardContent className="space-y-4">
            <div>
              <Label>Webhook URL</Label>
              <Input
                type="url"
                placeholder="https://hook.make.com/xxxxx"
                value={config.webhook_urls?.[0]?.url || ''}
                onChange={(e) => updateConfig('webhook_urls', [{ url: e.target.value, events: ['*'] }])}
                className="mt-2"
              />
              <p className="text-sm text-dark-800 mt-1">
                Supports Make.com, Zapier, n8n, and custom webhooks
              </p>
            </div>
            <div>
              <Label>Webhook Secret (optional)</Label>
              <Input
                type="password"
                placeholder="Secret for signature verification"
                value={config.webhook_secret || ''}
                onChange={(e) => updateConfig('webhook_secret', e.target.value)}
                className="mt-2"
              />
            </div>
          </CardContent>
        )}
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading} size="lg">
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Configuration'}
        </Button>
      </div>
    </div>
  )
}

