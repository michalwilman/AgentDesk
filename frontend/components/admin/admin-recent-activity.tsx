'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock } from 'lucide-react'

export function AdminRecentActivity() {
  return (
    <Card className="border-gray-700 bg-gray-900">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <Clock className="h-5 w-5 text-blue-500" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-gray-300 text-center py-8">
          <p>Activity logs will appear here</p>
          <p className="text-sm mt-2">No recent activity to display</p>
        </div>
      </CardContent>
    </Card>
  )
}

