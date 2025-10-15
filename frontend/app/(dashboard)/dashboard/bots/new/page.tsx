'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NewBotPage() {
  const router = useRouter()
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
            welcome_message: formData.welcome_message,
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
          <p className="text-dark-800">Checking bot limit...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/dashboard">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Bot</CardTitle>
          <CardDescription>
            Set up your AI chatbot with custom settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            <Input
              label="Bot Name"
              placeholder="Customer Support Bot"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Description
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
                Language
              </label>
              <select
                className="w-full rounded-lg border border-primary/20 bg-dark-50 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-primary"
                value={formData.language}
                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
              >
                <option value="en">English</option>
                <option value="he">Hebrew</option>
              </select>
            </div>

            <Input
              label="Personality"
              placeholder="helpful and professional"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            />

            <Input
              label="Welcome Message"
              placeholder="Hello! How can I help you today?"
              value={formData.welcome_message}
              onChange={(e) => setFormData({ ...formData, welcome_message: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                Primary Color
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
                {loading ? 'Creating...' : 'Create Bot'}
              </Button>
              <Link href="/dashboard" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

