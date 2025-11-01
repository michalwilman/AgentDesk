'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'

interface ActivityData {
  date: string
  conversations: number
  messages: number
}

interface DashboardActivityChartProps {
  data: ActivityData[]
}

export function DashboardActivityChart({ data }: DashboardActivityChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-50 p-3 rounded-lg border border-dark-100 shadow-lg">
          <p className="text-white font-medium mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="text-sm">
              {entry.name}: <span className="font-bold">{entry.value}</span>
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const totalConversations = data.reduce((sum, item) => sum + item.conversations, 0)
  const avgConversations = data.length > 0 ? (totalConversations / data.length).toFixed(1) : '0'

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Activity Overview
            </CardTitle>
            <CardDescription className="mt-1">
              Conversations and messages over the last 7 days
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{totalConversations}</p>
            <p className="text-xs text-dark-800">Total conversations</p>
            <p className="text-xs text-primary mt-1">Avg: {avgConversations}/day</p>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis 
                dataKey="date" 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#666"
                style={{ fontSize: '12px' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ fontSize: '12px' }}
              />
              <Line 
                type="monotone" 
                dataKey="conversations" 
                name="Conversations" 
                stroke="#00d4aa" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#00d4aa' }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="messages" 
                name="Messages" 
                stroke="#00a887" 
                strokeWidth={2}
                dot={{ r: 4, fill: '#00a887' }}
                activeDot={{ r: 6 }}
                strokeDasharray="5 5"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

