'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function EditBotPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [fetching, setFetching] = useState(true)
  
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
    const fetchBot = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          router.push('/login')
          return
        }

        const { data: bot, error: fetchError } = await supabase
          .from('bots')
          .select('*')
          .eq('id', params.id)
          .eq('user_id', user.id)
          .single()

        if (fetchError || !bot) {
          router.push('/dashboard')
          return
        }

        // Pre-fill form with existing bot data
        setFormData({
          name: bot.name || '',
          description: bot.description || '',
          language: bot.language || 'en',
          personality: bot.personality || 'helpful and professional',
          welcome_message: bot.welcome_message || 'Hello! How can I help you today?',
          primary_color: bot.primary_color || '#3B82F6',
        })

        // Load welcome messages (use array if available, otherwise use single message)
        if (bot.welcome_messages && Array.isArray(bot.welcome_messages) && bot.welcome_messages.length > 0) {
          setWelcomeMessages(bot.welcome_messages)
        } else if (bot.welcome_message) {
          setWelcomeMessages([bot.welcome_message])
        }

        setFetching(false)
      } catch (error) {
        console.error('Error fetching bot:', error)
        router.push('/dashboard')
      }
    }

    fetchBot()
  }, [params.id, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const supabase = createClient()
      
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error('Not authenticated')
      }

      // Update bot in Supabase
      const { data: bot, error: updateError } = await supabase
        .from('bots')
        .update({
          name: formData.name,
          description: formData.description,
          language: formData.language,
          personality: formData.personality,
          welcome_message: welcomeMessages[0] || formData.welcome_message, // First message for backward compatibility
          welcome_messages: welcomeMessages.filter(msg => msg.trim() !== ''), // Array of all messages
          primary_color: formData.primary_color,
        })
        .eq('id', params.id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (updateError) {
        throw new Error(updateError.message || 'Failed to update bot')
      }

      // Show success message
      const successMessage = formData.language === 'he' 
        ? 'הבוט עודכן בהצלחה ✅' 
        : 'Bot updated successfully ✅'
      setSuccess(successMessage)

      // Redirect after a short delay
      setTimeout(() => {
        router.push(`/dashboard/bots/${params.id}`)
      }, 1500)
    } catch (error: any) {
      setError(error.message || 'Failed to update bot')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <p className="text-dark-800">Loading bot data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto" dir={formData.language === 'he' ? 'rtl' : 'ltr'}>
      <Link href={`/dashboard/bots/${params.id}`}>
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          {formData.language === 'he' ? 'חזרה לבוט' : 'Back to Bot'}
        </Button>
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{formData.language === 'he' ? 'ערוך בוט' : 'Edit Bot'}</CardTitle>
          <CardDescription>
            {formData.language === 'he' 
              ? 'עדכן את הגדרות הבוט שלך' 
              : 'Update your bot settings'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-600 text-sm">
                {success}
              </div>
            )}

            <Input
              label={formData.language === 'he' ? 'שם הבוט' : 'Bot Name'}
              placeholder="Customer Support Bot"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {formData.language === 'he' ? 'תיאור' : 'Description'}
              </label>
              <textarea
                className="w-full rounded-lg border border-primary/20 bg-dark-50 px-3 py-2 text-sm text-white placeholder:text-[#666666] focus:outline-none focus:ring-2 focus:ring-primary"
                rows={3}
                placeholder={formData.language === 'he' 
                  ? 'תיאור הבוט שלך' 
                  : 'A helpful assistant for customer inquiries'}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {formData.language === 'he' ? 'שפה' : 'Language'}
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
              label={formData.language === 'he' ? 'אישיות' : 'Personality'}
              placeholder="helpful and professional"
              value={formData.personality}
              onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
            />

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {formData.language === 'he' ? 'הודעות פתיחה' : 'Welcome Messages'}
              </label>
              <p className="text-xs text-[#666666] mb-3">
                {formData.language === 'he' 
                  ? 'הוסף הודעת פתיחה אחת או יותר שיוצגו ברצף כשהצ\'אט מתחיל' 
                  : 'Add one or more opening messages that will be shown sequentially when the chat starts'}
              </p>
              <div className="space-y-2">
                {welcomeMessages.map((message, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder={formData.language === 'he' ? `הודעה ${index + 1}` : `Message ${index + 1}`}
                      value={message}
                      onChange={(e) => updateWelcomeMessage(index, e.target.value)}
                      className="flex-1"
                    />
                    {welcomeMessages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeWelcomeMessage(index)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title={formData.language === 'he' ? 'הסר הודעה' : 'Remove message'}
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
                  {formData.language === 'he' ? 'הוסף שורת פתיחה' : 'Add Line'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-1">
                {formData.language === 'he' ? 'צבע ראשי' : 'Primary Color'}
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

            <div className="flex items-center space-x-2 gap-2">
              <Button type="submit" disabled={loading || success !== ''} className="flex-1">
                {loading 
                  ? (formData.language === 'he' ? 'מעדכן...' : 'Updating...') 
                  : (formData.language === 'he' ? 'שמור שינויים' : 'Save Changes')}
              </Button>
              <Link href={`/dashboard/bots/${params.id}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full" disabled={loading}>
                  {formData.language === 'he' ? 'ביטול' : 'Cancel'}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

