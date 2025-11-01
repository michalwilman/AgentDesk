'use client'

import { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'
import { Globe, Smartphone, Monitor } from 'lucide-react'

interface Conversation {
  created_at: string
  source?: string
  metadata?: any
}

interface TrafficSourcesProps {
  conversations: Conversation[]
}

const COLORS = {
  website: '#00d4aa',
  wordpress: '#00a887',
  whatsapp: '#25D366',
  telegram: '#0088cc',
  other: '#666666',
}

export function TrafficSources({ conversations }: TrafficSourcesProps) {
  const trafficData = useMemo(() => {
    const sources: { [key: string]: number } = {}
    
    conversations.forEach((conv) => {
      const source = conv.source || 'website'
      sources[source] = (sources[source] || 0) + 1
    })

    return Object.entries(sources).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: COLORS[name as keyof typeof COLORS] || COLORS.other,
    }))
  }, [conversations])

  const totalConversations = trafficData.reduce((sum, item) => sum + item.value, 0)

  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / totalConversations) * 100).toFixed(1)
      return (
        <div className="bg-dark border border-primary/20 rounded-lg p-3 shadow-lg">
          <p className="text-white font-medium">{data.name}</p>
          <p className="text-sm text-dark-800">
            {data.value} conversations ({percentage}%)
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Traffic Sources
        </CardTitle>
        <CardDescription>
          Where your conversations are coming from
        </CardDescription>
      </CardHeader>
      <CardContent>
        {trafficData.length > 0 ? (
          <div>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            {/* Legend with percentages */}
            <div className="space-y-2 mt-4">
              {trafficData.map((item, index) => {
                const percentage = ((item.value / totalConversations) * 100).toFixed(1)
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-dark-50 rounded"
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-white text-sm">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-dark-800 text-sm">{item.value}</span>
                      <span className="text-primary text-sm font-medium min-w-[45px] text-right">
                        {percentage}%
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <Globe className="h-12 w-12 text-dark-800 mx-auto mb-4" />
            <p className="text-dark-800 mb-2">No traffic data yet</p>
            <p className="text-sm text-dark-800">
              Traffic sources will appear here as users interact with your bot
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

