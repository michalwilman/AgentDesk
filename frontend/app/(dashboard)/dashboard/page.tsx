import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Bot as BotIcon, MessageSquare } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Fetch user's bots
  const { data: bots } = await supabase
    .from('bots')
    .select('*')
    .eq('user_id', user?.id)
    .order('created_at', { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Bots</h1>
          <p className="text-gray-600 mt-1">Manage your AI chatbots</p>
        </div>
        {(!bots || bots.length === 0) && (
          <Link href="/dashboard/bots/new">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Bot
            </Button>
          </Link>
        )}
      </div>

      {!bots || bots.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BotIcon className="h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold mb-2">No bots yet</h3>
            <p className="text-gray-600 mb-6 text-center">
              Create your first AI chatbot to get started
            </p>
            <Link href="/dashboard/bots/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Bot
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{bot.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {bot.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      bot.is_active
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {bot.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    <span>Language: {bot.language === 'he' ? 'Hebrew' : 'English'}</span>
                  </div>
                  <div className="text-sm text-gray-500">
                    Created {formatDate(bot.created_at)}
                  </div>
                  <div className="flex items-center space-x-2 pt-2">
                    <Link href={`/dashboard/bots/${bot.id}`} className="flex-1">
                      <Button variant="outline" size="sm" className="w-full">
                        Manage
                      </Button>
                    </Link>
                    <Link href={`/dashboard/bots/${bot.id}/chat`} className="flex-1">
                      <Button size="sm" className="w-full">
                        Test Chat
                      </Button>
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

