'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageCircle, Loader2 } from 'lucide-react'

interface TopQuestionsProps {
  botId: string
}

interface Question {
  question: string
  count: number
}

export function TopQuestions({ botId }: TopQuestionsProps) {
  const [questions, setQuestions] = useState<Question[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTopQuestions()
  }, [botId])

  const fetchTopQuestions = async () => {
    try {
      // This would fetch from your backend API
      // For now, we'll use mock data
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock data - in production, this would come from analyzing user messages
      const mockQuestions: Question[] = [
        { question: "What are your business hours?", count: 234 },
        { question: "How much does it cost?", count: 189 },
        { question: "Where are you located?", count: 156 },
        { question: "Do you ship internationally?", count: 98 },
        { question: "What's your return policy?", count: 76 },
      ]
      
      setQuestions(mockQuestions)
    } catch (error) {
      console.error('Failed to fetch top questions:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Top Questions
          </CardTitle>
          <CardDescription>
            Most frequently asked questions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Top Questions
        </CardTitle>
        <CardDescription>
          Most frequently asked questions by users
        </CardDescription>
      </CardHeader>
      <CardContent>
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((q, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-dark-50 rounded-lg border border-dark-100"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-bold text-sm">{index + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm mb-1">{q.question}</p>
                  <p className="text-xs text-dark-800">
                    Asked {q.count} times
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MessageCircle className="h-12 w-12 text-dark-800 mx-auto mb-4" />
            <p className="text-dark-800 mb-2">No questions yet</p>
            <p className="text-sm text-dark-800">
              Questions will appear here as users interact with your bot
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

