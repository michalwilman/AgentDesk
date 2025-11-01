'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface Message {
  created_at: string
  role: string
}

interface Conversation {
  created_at: string
  source?: string
}

interface AnalyticsChartsProps {
  messages: Message[]
  conversations: Conversation[]
}

export function AnalyticsCharts({ messages, conversations }: AnalyticsChartsProps) {
  // Process data for charts
  const processDataByDay = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const data: { [key: string]: { day: string; conversations: number; messages: number } } = {}

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayName = days[date.getDay()]
      const key = date.toISOString().split('T')[0]
      data[key] = { day: dayName, conversations: 0, messages: 0 }
    }

    // Count conversations by day
    conversations.forEach((conv) => {
      const key = conv.created_at.split('T')[0]
      if (data[key]) {
        data[key].conversations++
      }
    })

    // Count messages by day
    messages.forEach((msg) => {
      const key = msg.created_at.split('T')[0]
      if (data[key]) {
        data[key].messages++
      }
    })

    return Object.values(data)
  }

  const chartData = processDataByDay()

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark border border-primary/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="grid md:grid-cols-2 gap-6 mb-6">
      {/* Conversations Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Conversations Over Time
          </CardTitle>
          <CardDescription>
            Daily conversation volume for the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis 
                dataKey="day" 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                stroke="#00d4aa" 
                strokeWidth={2}
                dot={{ fill: '#00d4aa', r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Messages Over Time */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Messages Over Time
          </CardTitle>
          <CardDescription>
            Daily message volume for the last 7 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2a2a" />
              <XAxis 
                dataKey="day" 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="messages" 
                fill="#00d4aa"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}

