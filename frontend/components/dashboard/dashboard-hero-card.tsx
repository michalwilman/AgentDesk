'use client'

import { Card, CardContent } from '@/components/ui/card'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface DashboardHeroCardProps {
  totalChats: number
  trend?: number
  label?: string
  sublabel?: string
}

export function DashboardHeroCard({ 
  totalChats, 
  trend = 0,
  label = "Total Conversations",
  sublabel = "All time"
}: DashboardHeroCardProps) {
  return (
    <Card className="border-primary/30 bg-gradient-to-br from-dark-50 to-dark hover:border-primary/50 transition-all">
      <CardContent className="flex flex-col items-center justify-center py-12">
        {/* Circular Display */}
        <div className="relative">
          {/* Outer Circle - Animated Border */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary via-primary/50 to-primary animate-pulse opacity-20"></div>
          
          {/* Main Circle */}
          <div className="relative w-48 h-48 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-4 border-primary/30 flex flex-col items-center justify-center shadow-lg">
            {/* Number */}
            <div className="text-6xl font-bold text-white mb-2">
              {totalChats.toLocaleString()}
            </div>
            
            {/* Trend Indicator */}
            {trend !== 0 && (
              <div className={`flex items-center gap-1 text-sm font-medium ${
                trend > 0 ? 'text-green-500' : 'text-red-500'
              }`}>
                {trend > 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{trend > 0 ? '+' : ''}{trend}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Label */}
        <div className="mt-6 text-center">
          <h3 className="text-xl font-semibold text-white mb-1">
            {label}
          </h3>
          <p className="text-sm text-dark-800">
            {sublabel}
          </p>
        </div>

        {/* Decorative Elements */}
        <div className="mt-4 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 rounded-full bg-primary animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
      </CardContent>
    </Card>
  )
}

