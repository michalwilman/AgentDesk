import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/dashboard/copy-button'
import { DeleteBotButton } from '@/components/dashboard/delete-bot-button'
import { ChannelConnections } from '@/components/dashboard/channel-connections'
import { TrainedStatus } from '@/components/dashboard/trained-status'
import { GoogleCalendarStatus } from '@/components/dashboard/google-calendar-status'
import { SmsWhatsAppStatus } from '@/components/dashboard/sms-whatsapp-status'
import { ArrowLeft, Code, Pencil, Globe, CheckCircle2, XCircle, Clock, Zap, UserPlus, Calendar } from 'lucide-react'

function formatTimeAgo(dateString: string | null): string {
  if (!dateString) return 'Never'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Just now'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`
  
  return date.toLocaleDateString()
}

export default async function BotDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: bot } = await supabase
    .from('bots')
    .select('*')
    .eq('id', params.id)
    .eq('user_id', user?.id)
    .single()

  if (!bot) {
    notFound()
  }

  // Fetch Google Calendar connection status
  const { data: actionConfig } = await supabase
    .from('bot_actions_config')
    .select('google_calendar_access_token, google_calendar_refresh_token, appointments_enabled')
    .eq('bot_id', params.id)
    .single()

  const isGoogleCalendarConnected = !!(actionConfig?.google_calendar_access_token || actionConfig?.google_calendar_refresh_token)

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL}/widget.js" data-bot-token="${bot.api_token}"></script>`

  return (
    <div className="container max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white">{bot.name}</h1>
        <p className="text-dark-800 mt-1">{bot.description}</p>
      </div>

      <div className="grid gap-6">
        {/* Bot Configuration */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Bot Configuration</CardTitle>
                <CardDescription>Current bot settings</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/dashboard/bots/${bot.id}/actions`}>
                  <Button variant="outline" size="sm">
                    <Zap className="h-4 w-4 mr-2" />
                    Actions
                  </Button>
                </Link>
                <Link href={`/dashboard/leads?bot_id=${bot.id}`}>
                  <Button variant="outline" size="sm">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Leads
                  </Button>
                </Link>
                <Link href={`/dashboard/appointments?bot_id=${bot.id}`}>
                  <Button variant="outline" size="sm">
                    <Calendar className="h-4 w-4 mr-2" />
                    Appointments
                  </Button>
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/knowledge`}>
                  <Button variant="outline" size="sm">
                    Manage Knowledge
                  </Button>
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/analytics`}>
                  <Button variant="outline" size="sm">
                    View Analytics
                  </Button>
                </Link>
                <Link href={`/dashboard/bots/${bot.id}/edit`}>
                  <Button variant="outline" size="sm">
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Bot
                  </Button>
                </Link>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#666666]">Language</label>
                <p className="mt-1 text-white">{bot.language === 'he' ? 'Hebrew' : 'English'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#666666]">Model</label>
                <p className="mt-1 text-white">{bot.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#666666]">Status</label>
                <p className="mt-1">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bot.is_active
                        ? 'bg-primary/20 text-primary border border-primary/20'
                        : 'bg-dark-100 text-dark-800 border border-dark-100'
                    }`}
                  >
                    {bot.is_active ? 'Active' : 'Inactive'}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-[#666666]">Trained</label>
                <p className="mt-1">
                  <TrainedStatus botId={bot.id} />
                </p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-[#666666]">Personality</label>
              <p className="mt-1 text-white">{bot.personality}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-[#666666]">Welcome Message</label>
              <p className="mt-1 text-white">{bot.welcome_message}</p>
            </div>

            {/* WordPress Integration Status */}
            {bot.wordpress_connected && (
              <div className="border-t border-dark-100 pt-4 mt-4">
                <label className="text-sm font-medium text-[#666666] flex items-center mb-3">
                  <Globe className="h-5 w-5 mr-2 text-blue-500" />
                  WordPress Integration
                </label>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-primary font-bold text-base">Connected</p>
                      <p className="text-sm text-primary mt-1 font-medium">
                        Your WordPress plugin is actively connected
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#666666] font-semibold">Site:</span>
                      <a 
                        href={bot.wordpress_site_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {bot.wordpress_site_url}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666] font-semibold">Plugin version:</span>
                      <span className="text-white font-medium">{bot.wordpress_plugin_version}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#666666] font-semibold">Last sync:</span>
                      <span className="text-white flex items-center gap-1 font-medium">
                        <Clock className="h-3 w-3" />
                        {formatTimeAgo(bot.wordpress_last_activity)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {!bot.wordpress_connected && (
              <div className="border-t border-dark-100 pt-4 mt-4">
                <label className="text-sm font-medium text-[#666666] flex items-center mb-3">
                  <Globe className="h-4 w-4 mr-2" />
                  WordPress Integration
                </label>
                <div className="bg-dark-50 border border-dark-100 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <XCircle className="h-5 w-5 text-dark-800 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-white font-medium">Not Connected</p>
                      <p className="text-sm text-dark-800 mt-1">
                        Install the WordPress plugin to show your chatbot on your WordPress site
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Link href="/wordpress-plugin">
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        Download Plugin
                      </Button>
                    </Link>
                    <Link href="/wordpress-plugin">
                      <Button 
                        variant="ghost" 
                        size="sm"
                      >
                        View Instructions
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Google Calendar Integration Status */}
            <GoogleCalendarStatus
              botId={bot.id}
              isConnected={isGoogleCalendarConnected}
              appointmentsEnabled={actionConfig?.appointments_enabled || false}
            />

            {/* SMS & WhatsApp Notifications Status */}
            <SmsWhatsAppStatus
              botId={bot.id}
              config={actionConfig}
            />
          </CardContent>
        </Card>

        {/* Embed Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Code className="h-5 w-5 mr-2" />
              Embed Code
            </CardTitle>
            <CardDescription>
              Copy this code and paste it into your website before the closing &lt;/body&gt; tag
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <pre className="bg-dark text-primary p-4 rounded-lg overflow-x-auto text-sm border border-primary/20">
                {embedCode}
              </pre>
              <CopyButton 
                text={embedCode}
                variant="outline"
                size="sm"
                className="absolute top-2 right-2"
              />
            </div>
          </CardContent>
        </Card>

        {/* API Token */}
        <Card>
          <CardHeader>
            <CardTitle>API Token</CardTitle>
            <CardDescription>Use this token to authenticate API requests</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <code className="flex-1 bg-dark-50 px-3 py-2 rounded text-sm font-mono text-primary border border-primary/20">
                {bot.api_token}
              </code>
              <CopyButton 
                text={bot.api_token}
                variant="outline"
                size="sm"
              />
            </div>
          </CardContent>
        </Card>

        {/* Connect Channels */}
        <Card>
          <CardHeader>
            <CardTitle>Connect Channels</CardTitle>
            <CardDescription>
              Connect your bot to external messaging platforms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChannelConnections bot={bot} />
          </CardContent>
        </Card>

        {/* Delete Bot */}
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Permanently delete this bot and all associated data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DeleteBotButton botId={bot.id} botName={bot.name} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

