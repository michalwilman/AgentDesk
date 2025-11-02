'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Calendar, CheckCircle2, XCircle } from 'lucide-react'
import { GoogleCalendarManageDialog } from './google-calendar-manage-dialog'

interface GoogleCalendarStatusProps {
  botId: string
  isConnected: boolean
  appointmentsEnabled: boolean
}

export function GoogleCalendarStatus({
  botId,
  isConnected,
  appointmentsEnabled,
}: GoogleCalendarStatusProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [localIsConnected, setLocalIsConnected] = useState(isConnected)

  const handleDisconnected = () => {
    setLocalIsConnected(false)
    // Reload page to refresh data
    window.location.reload()
  }

  if (localIsConnected) {
    return (
      <>
        <div className="border-t border-dark-100 pt-4 mt-4">
          <label className="text-sm font-medium text-[#666666] flex items-center mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            Google Calendar Integration
          </label>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-start gap-3 mb-3">
              <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-primary font-medium">Connected</p>
                <p className="text-sm text-dark-800 mt-1">
                  Your bot can automatically schedule appointments via Google Calendar
                </p>
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-[#666666]">Appointment Scheduling:</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-medium ${
                    appointmentsEnabled
                      ? 'bg-primary/20 text-primary'
                      : 'bg-dark-100 text-dark-800'
                  }`}
                >
                  {appointmentsEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDialogOpen(true)}
              >
                Manage Settings
              </Button>
              <Link href={`/dashboard/bots/${botId}/actions`}>
                <Button variant="ghost" size="sm">
                  Configure Actions
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <GoogleCalendarManageDialog
          botId={botId}
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onDisconnected={handleDisconnected}
        />
      </>
    )
  }

  return (
    <div className="border-t border-dark-100 pt-4 mt-4">
      <label className="text-sm font-medium text-[#666666] flex items-center mb-3">
        <Calendar className="h-4 w-4 mr-2" />
        Google Calendar Integration
      </label>
      <div className="bg-dark-50 border border-dark-100 rounded-lg p-4">
        <div className="flex items-start gap-3 mb-3">
          <XCircle className="h-5 w-5 text-dark-800 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-white font-medium">Not Connected</p>
            <p className="text-sm text-dark-800 mt-1">
              Connect Google Calendar to enable automatic appointment scheduling
            </p>
          </div>
        </div>
        <div className="flex gap-2 mt-4">
          <Link href={`/dashboard/bots/${botId}/actions`}>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              Connect Calendar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

