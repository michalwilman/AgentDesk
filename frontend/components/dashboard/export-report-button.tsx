'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

interface ExportReportButtonProps {
  botId: string
  botName: string
  totalChats: number
  totalMessages: number
  avgSatisfaction: number | null
  conversations: any[]
}

export function ExportReportButton({
  botId,
  botName,
  totalChats,
  totalMessages,
  avgSatisfaction,
  conversations,
}: ExportReportButtonProps) {
  const handleExport = () => {
    const reportData = {
      bot_id: botId,
      bot_name: botName,
      total_conversations: totalChats,
      total_messages: totalMessages,
      avg_satisfaction: avgSatisfaction,
      recent_conversations: conversations,
      generated_at: new Date().toISOString(),
    }
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-report-${botName}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <Button 
      variant="outline" 
      size="sm"
      className="gap-2"
      onClick={handleExport}
    >
      <Download className="h-4 w-4" />
      Export Report
    </Button>
  )
}

