'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Search, Calendar as CalendarIcon, Clock, ExternalLink, Trash2 } from 'lucide-react'
import { format } from 'date-fns'
import { createClient } from '@/lib/supabase/client'

interface Appointment {
  id: string
  bot_id: string
  scheduled_time: string
  duration_minutes: number
  attendee_name: string
  attendee_email?: string
  attendee_phone?: string
  notes?: string
  status: string
  calendar_event_id?: string
  created_at: string
  bots: { name: string }
}

export function AppointmentsTable({
  appointments: initialAppointments,
}: {
  appointments: Appointment[]
}) {
  const supabase = createClient()
  const [appointments, setAppointments] = useState(initialAppointments)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [timeFilter, setTimeFilter] = useState<string>('all')
  const [selectedAppointments, setSelectedAppointments] = useState<Set<string>>(new Set())
  const [deleting, setDeleting] = useState(false)

  // Filter appointments
  const now = new Date()
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      appointment.attendee_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.attendee_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      appointment.bots.name.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus =
      statusFilter === 'all' || appointment.status === statusFilter

    const appointmentTime = new Date(appointment.scheduled_time)
    const matchesTime =
      timeFilter === 'all' ||
      (timeFilter === 'upcoming' && appointmentTime >= now) ||
      (timeFilter === 'past' && appointmentTime < now)

    return matchesSearch && matchesStatus && matchesTime
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30'
      case 'confirmed':
        return 'bg-green-500/20 text-green-500 border-green-500/30'
      case 'completed':
        return 'bg-blue-500/20 text-blue-500 border-blue-500/30'
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500/30'
      default:
        return 'bg-dark-100 text-dark-800 border-dark-100'
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: format(date, 'MMM dd, yyyy'),
      time: format(date, 'HH:mm'),
    }
  }

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedAppointments.size === filteredAppointments.length) {
      setSelectedAppointments(new Set())
    } else {
      setSelectedAppointments(new Set(filteredAppointments.map(appointment => appointment.id)))
    }
  }

  // Toggle individual appointment
  const toggleSelectAppointment = (appointmentId: string) => {
    const newSelected = new Set(selectedAppointments)
    if (newSelected.has(appointmentId)) {
      newSelected.delete(appointmentId)
    } else {
      newSelected.add(appointmentId)
    }
    setSelectedAppointments(newSelected)
  }

  // Delete single appointment
  const deleteAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return
    }

    try {
      setDeleting(true)
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) throw error

      setAppointments(appointments.filter(appointment => appointment.id !== appointmentId))
      setSelectedAppointments(prev => {
        const newSet = new Set(prev)
        newSet.delete(appointmentId)
        return newSet
      })
    } catch (error) {
      console.error('Error deleting appointment:', error)
      alert('Failed to delete appointment. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  // Delete selected appointments
  const deleteSelectedAppointments = async () => {
    if (selectedAppointments.size === 0) return

    if (!confirm(`Are you sure you want to delete ${selectedAppointments.size} appointment(s)?`)) {
      return
    }

    try {
      setDeleting(true)
      const { error } = await supabase
        .from('appointments')
        .delete()
        .in('id', Array.from(selectedAppointments))

      if (error) throw error

      setAppointments(appointments.filter(appointment => !selectedAppointments.has(appointment.id)))
      setSelectedAppointments(new Set())
    } catch (error) {
      console.error('Error deleting appointments:', error)
      alert('Failed to delete appointments. Please try again.')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <CardTitle>All Appointments ({filteredAppointments.length})</CardTitle>
          <div className="flex items-center gap-3 flex-wrap">
            {/* Delete Selected Button */}
            {selectedAppointments.size > 0 && (
              <Button 
                variant="danger" 
                onClick={deleteSelectedAppointments}
                disabled={deleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Selected ({selectedAppointments.size})
              </Button>
            )}
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-800" />
              <Input
                placeholder="Search appointments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-[250px]"
              />
            </div>

            {/* Time Filter */}
            <Select value={timeFilter} onValueChange={setTimeFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Time</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="past">Past</SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-12 w-12 text-dark-800 mx-auto mb-4" />
            <p className="text-dark-800">No appointments found</p>
            <p className="text-sm text-dark-800 mt-2">
              {searchTerm || statusFilter !== 'all' || timeFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Enable appointment scheduling in bot actions to start booking meetings'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-100">
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800 w-12">
                    <input
                      type="checkbox"
                      checked={filteredAppointments.length > 0 && selectedAppointments.size === filteredAppointments.length}
                      onChange={toggleSelectAll}
                      className="rounded border-dark-100 text-primary focus:ring-primary"
                    />
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Attendee
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Duration
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Bot
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-dark-800">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => {
                  const { date, time } = formatDateTime(appointment.scheduled_time)
                  const isPast = new Date(appointment.scheduled_time) < now

                  return (
                    <tr
                      key={appointment.id}
                      className="border-b border-dark-100 hover:bg-dark-50 transition-colors"
                    >
                      <td className="py-3 px-4">
                        <input
                          type="checkbox"
                          checked={selectedAppointments.has(appointment.id)}
                          onChange={() => toggleSelectAppointment(appointment.id)}
                          className="rounded border-dark-100 text-primary focus:ring-primary"
                        />
                      </td>
                      <td className="py-3 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-white font-medium">
                            <CalendarIcon className="h-4 w-4 text-primary" />
                            {date}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-dark-800">
                            <Clock className="h-3 w-3" />
                            {time}
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-medium text-white">
                            {appointment.attendee_name}
                          </div>
                          {appointment.attendee_email && (
                            <div className="text-sm text-dark-800">
                              {appointment.attendee_email}
                            </div>
                          )}
                          {appointment.attendee_phone && (
                            <div className="text-sm text-dark-800">
                              {appointment.attendee_phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-dark-800">
                          {appointment.duration_minutes} min
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-sm text-dark-800">
                          {appointment.bots.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(appointment.status)} capitalize`}
                        >
                          {appointment.status}
                        </Badge>
                        {isPast && appointment.status !== 'completed' && (
                          <div className="text-xs text-red-500 mt-1">Past due</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {appointment.calendar_event_id && (
                            <a
                              href={`https://calendar.google.com/calendar/event?eid=${appointment.calendar_event_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 h-9 px-3"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteAppointment(appointment.id)}
                            disabled={deleting}
                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

