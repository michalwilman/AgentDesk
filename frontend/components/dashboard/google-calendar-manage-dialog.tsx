'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Calendar, Mail, CheckCircle2, XCircle, Loader2 } from 'lucide-react'

interface GoogleCalendarManageDialogProps {
  botId: string
  isOpen: boolean
  onClose: () => void
  onDisconnected?: () => void
}

interface ConnectionDetails {
  email: string
  calendarId: string
  appointmentsEnabled: boolean
}

export function GoogleCalendarManageDialog({
  botId,
  isOpen,
  onClose,
  onDisconnected,
}: GoogleCalendarManageDialogProps) {
  const [loading, setLoading] = useState(true)
  const [disconnecting, setDisconnecting] = useState(false)
  const [details, setDetails] = useState<ConnectionDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (isOpen) {
      fetchConnectionDetails()
    }
  }, [isOpen, botId])

  const fetchConnectionDetails = async () => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('bot_actions_config')
        .select('google_calendar_email, google_calendar_id, appointments_enabled')
        .eq('bot_id', botId)
        .single()

      if (fetchError) throw fetchError

      if (data) {
        setDetails({
          email: data.google_calendar_email || 'N/A',
          calendarId: data.google_calendar_id || 'primary',
          appointmentsEnabled: data.appointments_enabled || false,
        })
      }
    } catch (err) {
      console.error('Error fetching connection details:', err)
      setError('Failed to load connection details')
    } finally {
      setLoading(false)
    }
  }

  const handleDisconnect = async () => {
    if (!confirm('האם אתה בטוח שברצונך לנתק את חשבון Google Calendar?')) {
      return
    }

    setDisconnecting(true)
    setError(null)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        throw new Error('No active session')
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/actions/google/disconnect?bot_id=${botId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        }
      )

      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to disconnect')
      }

      // Success!
      onClose()
      onDisconnected?.()
    } catch (err: any) {
      console.error('Error disconnecting Google Calendar:', err)
      setError(err.message || 'Failed to disconnect Google Calendar')
    } finally {
      setDisconnecting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-dark border-primary/20">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <Calendar className="h-5 w-5 text-primary" />
            Google Calendar Connection
          </DialogTitle>
          <DialogDescription className="text-dark-800">
            Manage your Google Calendar integration settings
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : error ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm text-red-500">{error}</p>
            </div>
          </div>
        ) : details ? (
          <div className="space-y-4">
            {/* Connection Status */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span className="font-medium text-primary">Connected</span>
              </div>
              <p className="text-sm text-dark-800">
                Your bot is connected to Google Calendar and can schedule appointments automatically
              </p>
            </div>

            {/* Connection Details */}
            <div className="space-y-3">
              <div className="border border-dark-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Mail className="h-4 w-4 text-dark-800" />
                  <label className="text-sm font-medium text-[#666666]">
                    Connected Account
                  </label>
                </div>
                <p className="text-white font-mono text-sm">{details.email}</p>
              </div>

              <div className="border border-dark-100 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="h-4 w-4 text-dark-800" />
                  <label className="text-sm font-medium text-[#666666]">
                    Calendar ID
                  </label>
                </div>
                <p className="text-white font-mono text-sm">{details.calendarId}</p>
              </div>

              <div className="border border-dark-100 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#666666]">
                    Appointment Scheduling
                  </label>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      details.appointmentsEnabled
                        ? 'bg-primary/20 text-primary'
                        : 'bg-dark-100 text-dark-800'
                    }`}
                  >
                    {details.appointmentsEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={disconnecting}
          >
            Close
          </Button>
          <Button
            variant="danger"
            onClick={handleDisconnect}
            disabled={disconnecting}
          >
            {disconnecting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Disconnecting...
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 mr-2" />
                Disconnect
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

