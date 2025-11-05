'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/lib/contexts/LanguageContext'

export default function NewBotPage() {
  const router = useRouter()
  const { t, dir } = useLanguage()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(true)
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    language: 'en',
    personality: 'helpful and professional',
    welcome_message: 'Hello! How can I help you today?',
    primary_color: '#3B82F6',
  })

  const [welcomeMessages, setWelcomeMessages] = useState<string[]>(['Hello! How can I help you today?'])

  const addWelcomeMessage = () => {
    setWelcomeMessages([...welcomeMessages, ''])
  }

  const removeWelcomeMessage = (index: number) => {
    if (welcomeMessages.length > 1) {
      setWelcomeMessages(welcomeMessages.filter((_, i) => i !== index))
    }
  }

  const updateWelcomeMessage = (index: number, value: string) => {
    const updated = [...welcomeMessages]
    updated[index] = value
    setWelcomeMessages(updated)
  }

  useEffect(() => {
    const checkBotLimit = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: bots } = await supabase
          .from('bots')
          .select('id')
          .eq('user_id', user.id)

        if (bots && bots.length >= 1) {
          router.push('/dashboard?error=bot_limit_reached')
          return
        }

        setChecking(false)
      } catch (error) {
        console.error('Error checking bot limit:', error)
        setChecking(false)
      }
    }

    checkBotLimit()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Check if user exists in users table, if not create it
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .single()

      if (!existingUser) {
        // Create user profile if it doesn't exist
        const userData = user.user_metadata || {}
        const { error: userError } = await supabase.from('users').insert([
          {
            id: user.id,
            email: user.email,
            full_name: userData.full_name || userData.name || '',
            company_name: userData.company_name || '',
            avatar_url: userData.avatar_url || userData.picture || null,
          },
        ])

        if (userError) {
          console.error('Error creating user profile:', userError)
          throw new Error('Failed to create user profile')
        }
      }

      // Create bot directly in Supabase
      const { data: bot, error: insertError } = await supabase
        .from('bots')
        .insert([
          {
            user_id: user.id,
            name: formData.name,
            description: formData.description,
            language: formData.language,
            personality: formData.personality,
            welcome_message: welcomeMessages[0] || formData.welcome_message, // First message for backward compatibility
            welcome_messages: welcomeMessages.filter(msg => msg.trim() !== ''), // Array of all messages
            primary_color: formData.primary_color,
            is_active: true,
            is_trained: false,
          },
        ])
        .select()
        .single()

      if (insertError) {
        throw new Error(insertError.message || 'Failed to create bot')
      }

      // Redirect to the new bot's page
      router.push(`/dashboard/bots/${bot.id}`)
    } catch (error: any) {
      setError(error.message || 'Failed to create bot')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <p className="text-dark-800">{t('common.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto" dir={dir}>
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {t('common.back')}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('bot.create')}</CardTitle>
          <CardDescription>
            Set up your AI chatbot with custom settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Info about Knowledge Base */}
          <div className="mb-6 p-4 rounded-lg bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> After creating your bot, you can add documents and build your knowledge base in the edit page.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Input
              label={t('bot.name')}
              placeholder="Customer Support Bot"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t('bot.description')}
              </label>
              <textarea
                className="w-full rounded-lg border border-primary/20 bg-dark-50 px-3 py-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder="A helpful assistant for customer inquiries"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t('bot.language')}
              </label>
              <select
                className="w-full rounded-lg border border-primary/20 bg-dark-50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="he">עברית</option>
              </select>
            </div>

            <Input
              label={t('bot.personality')}
              placeholder="helpful and professional"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t('bot.welcomeMessage')}
              </label>
              <p className="text-xs text-[#666666] mb-3">
                Add one or more opening messages that will be shown sequentially when the chat starts
              </p>
              <div className="space-y-2">
                {welcomeMessages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={`Message ${index + 1}`}
                      value={message}
                      onChange={(e) => updateWelcomeMessage(index, e.target.value)}
                      className="flex-1"
                    />
                    {welcomeMessages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWelcomeMessage(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove message"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addWelcomeMessage}
                  className="flex items-center gap-2 px-4 py-2 text-sm text-primary border border-primary/20 rounded-lg hover:bg-primary/10 transition-colors"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Add Line
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {t('bot.primaryColor')}
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="color"
                  className="h-10 w-20 rounded border border-primary/20 bg-dark-50"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                />
                <Input
                  type="text"
                  value={formData.primary_color}
                  onChange={(e) => setFormData({ ...formData, primary_color: e.target.value })}
                  className="flex-1"
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? t('bot.saving') : t('bot.create')}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('bot.cancel')}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

