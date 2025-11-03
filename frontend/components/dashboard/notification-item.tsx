'use client'

import { format } from 'date-fns'
import { Calendar, Clock, User, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

interface NotificationItemProps {
  notification: {
    id: string
    created_at: string
    appointments: {
      id: string
      scheduled_time: string
      attendee_name: string
      attendee_email: string | null
      attendee_phone: string | null
      lead_id: string | null
      bot_id: string
      bots: {
        id: string
        name: string
      }
    }
  }
  onDismiss: (id: string) => void
  dismissing: boolean
}

export function NotificationItem({
  notification,
  onDismiss,
  dismissing,
}: NotificationItemProps) {
  const router = useRouter()
  const appointment = notification.appointments

  const scheduledDate = new Date(appointment.scheduled_time)
  const formattedDate = format(scheduledDate, 'MMM dd, yyyy')
  const formattedTime = format(scheduledDate, 'HH:mm')

  const handleViewLead = () => {
    if (appointment.lead_id) {
      router.push(`/dashboard/leads?lead_id=${appointment.lead_id}`)
    } else {
      router.push(`/dashboard/leads`)
    }
  }

  const handleViewAppointment = () => {
    router.push(`/dashboard/appointments?bot_id=${appointment.bot_id}`)
  }

  return (
    <div className="p-4 border border-dark-100 rounded-lg bg-dark-50 hover:bg-dark-100 transition-colors relative">
      {/* Dismiss Button */}
      <button
        onClick={() => onDismiss(notification.id)}
        disabled={dismissing}
        className="absolute top-2 right-2 text-dark-800 hover:text-white transition-colors p-1 rounded-md hover:bg-dark-200"
        title="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Content */}
      <div className="space-y-3 pr-6">
        {/* Header */}
        <div className="flex items-start gap-2">
          <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-white">New Appointment</h4>
            <p className="text-xs text-dark-800">from {appointment.bots.name}</p>
          </div>
        </div>

        {/* Attendee Info */}
        <div className="flex items-center gap-2 text-sm">
          <User className="h-4 w-4 text-dark-800" />
          <span className="text-white font-medium">{appointment.attendee_name}</span>
        </div>

        {/* Date & Time */}
        <div className="flex items-center gap-4 text-sm text-dark-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{formattedTime}</span>
          </div>
        </div>

        {/* Contact Info */}
        {(appointment.attendee_email || appointment.attendee_phone) && (
          <div className="text-xs text-dark-800 space-y-1">
            {appointment.attendee_email && (
              <div>Email: {appointment.attendee_email}</div>
            )}
            {appointment.attendee_phone && (
              <div>Phone: {appointment.attendee_phone}</div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleViewLead}
            className="flex-1 text-xs"
          >
            View Lead
          </Button>
          <Button
            size="sm"
            onClick={handleViewAppointment}
            className="flex-1 text-xs"
          >
            View Appointment
          </Button>
        </div>
      </div>
    </div>
  )
}

