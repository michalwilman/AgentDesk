'use client'

import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NotificationItem } from './notification-item'
import axios from 'axios'
import { createClient } from '@/lib/supabase/client'

interface Notification {
  id: string
  dismissed: boolean
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

interface NotificationsPanelProps {
  className?: string
}

export function NotificationsPanel({ className = '' }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [dismissing, setDismissing] = useState(false)
  const supabase = createClient()

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      const response = await axios.get(
        `${backendUrl}/api/appointments/notifications`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      setNotifications(response.data.notifications || [])
    } catch (error) {
      console.error('Error fetching notifications:', error)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [])

  // Poll for new notifications every 30 seconds when panel is open
  useEffect(() => {
    if (!isOpen) return

    const interval = setInterval(() => {
      fetchNotifications()
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [isOpen])

  // Refresh when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  // Dismiss notification
  const handleDismiss = async (notificationId: string) => {
    try {
      setDismissing(true)

      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) return

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
      
      await axios.put(
        `${backendUrl}/api/appointments/notifications/${notificationId}/dismiss`,
        {},
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      )

      // Remove from local state
      setNotifications(prev => prev.filter(n => n.id !== notificationId))
    } catch (error) {
      console.error('Error dismissing notification:', error)
    } finally {
      setDismissing(false)
    }
  }

  const unreadCount = notifications.length

  return (
    <>
      {/* Bell Icon Button */}
      <div className={`relative ${className}`}>
        <button
          onClick={() => setIsOpen(true)}
          className="relative p-2 rounded-lg hover:bg-dark-50 transition-colors"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-dark-800 hover:text-white" />
          {unreadCount > 0 && (
            <span className="absolute top-0 right-0 h-5 w-5 bg-primary rounded-full text-[10px] font-bold text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0A0A0A] border-l border-dark-100 shadow-xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-dark-100">
          <div>
            <h2 className="text-xl font-bold text-white">Notifications</h2>
            <p className="text-sm text-dark-800 mt-1">
              {unreadCount === 0
                ? 'No new appointments'
                : `${unreadCount} new appointment${unreadCount > 1 ? 's' : ''}`}
            </p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-dark-800 hover:text-white" />
          </button>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100%-88px)] p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-dark-800 mt-4">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-dark-800 mx-auto mb-4" />
              <p className="text-dark-800">No new notifications</p>
              <p className="text-sm text-dark-800 mt-2">
                New appointments will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={handleDismiss}
                  dismissing={dismissing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}

