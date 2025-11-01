import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CopyButton } from '@/components/dashboard/copy-button'
import { DeleteBotButton } from '@/components/dashboard/delete-bot-button'
import { ChannelConnections } from '@/components/dashboard/channel-connections'
import { TrainedStatus } from '@/components/dashboard/trained-status'
import { ArrowLeft, Code, Pencil, Globe, CheckCircle2, XCircle, Clock } from 'lucide-react'

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

  const embedCode = `<script src="${process.env.NEXT_PUBLIC_WIDGET_URL}/widget.js" data-bot-token="${bot.api_token}"></script>`

  return (
    <div className="max-w-4xl mx-auto">
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
              <Link href={`/dashboard/bots/${bot.id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit Bot
                </Button>
              </Link>
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
                  <Globe className="h-4 w-4 mr-2" />
                  WordPress Integration
                </label>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-primary font-medium">Connected</p>
                      <p className="text-sm text-dark-800 mt-1">
                        Your WordPress plugin is actively connected
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Site:</span>
                      <a 
                        href={bot.wordpress_site_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {bot.wordpress_site_url}
                      </a>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#666666]">Plugin version:</span>
                      <span className="text-white">{bot.wordpress_plugin_version}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-[#666666]">Last sync:</span>
                      <span className="text-white flex items-center gap-1">
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
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                    >
                      <Link href="/wordpress-plugin">
                        Download Plugin
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      asChild
                    >
                      <Link href="/wordpress-plugin">
                        View Instructions
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            )}
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

        {/* Actions */}
        <div className="flex items-center space-x-4">
          <Link href={`/dashboard/bots/${bot.id}/knowledge`} className="flex-1">
            <Button variant="outline" className="w-full">
              Manage Knowledge
            </Button>
          </Link>
          <Link href={`/dashboard/bots/${bot.id}/analytics`} className="flex-1">
            <Button variant="outline" className="w-full">
              View Analytics
            </Button>
          </Link>
        </div>

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

