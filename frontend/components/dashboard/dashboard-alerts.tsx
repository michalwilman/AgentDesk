'use client'

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, Clock, FileWarning, Plug, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Alert {
  id: string
  type: 'warning' | 'info' | 'error'
  title: string
  description: string
  actionLabel?: string
  actionUrl?: string
  dismissible?: boolean
}

interface DashboardAlertsProps {
  alerts: Alert[]
}

export function DashboardAlerts({ alerts: initialAlerts }: DashboardAlertsProps) {
  const [alerts, setAlerts] = useState(initialAlerts)

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'info':
        return <Clock className="h-4 w-4 text-blue-500" />
      default:
        return <AlertTriangle className="h-4 w-4 text-primary" />
    }
  }

  const getAlertStyles = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-yellow-500/30 bg-yellow-500/5'
      case 'error':
        return 'border-red-500/30 bg-red-500/5'
      case 'info':
        return 'border-blue-500/30 bg-blue-500/5'
      default:
        return 'border-primary/30 bg-primary/5'
    }
  }

  const dismissAlert = (id: string) => {
    setAlerts(alerts.filter(alert => alert.id !== id))
  }

  if (alerts.length === 0) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            Alerts
          </CardTitle>
          <CardDescription>Important notifications and warnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">✓</span>
            </div>
            <p className="text-sm text-dark-800">All good! No alerts at the moment.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-primary" />
          Alerts
          <span className="ml-auto text-sm font-normal text-dark-800">
            {alerts.length} {alerts.length === 1 ? 'alert' : 'alerts'}
          </span>
        </CardTitle>
        <CardDescription>Important notifications and warnings</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`relative p-4 rounded-lg border ${getAlertStyles(alert.type)}`}
            >
              {/* Dismiss Button */}
              {alert.dismissible && (
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-dark-100/50 transition-colors"
                  aria-label="Dismiss"
                >
                  <X className="h-3 w-3 text-dark-800" />
                </button>
              )}

              <div className="flex items-start gap-3">
                {/* Icon */}
                <div className="flex-shrink-0 mt-0.5">
                  {getIcon(alert.type)}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                  <h4 className="text-sm font-semibold text-white mb-1">
                    {alert.title}
                  </h4>
                  <p className="text-xs text-dark-800 mb-3">
                    {alert.description}
                  </p>

                  {/* Action Button */}
                  {alert.actionLabel && alert.actionUrl && (
                    <Link href={alert.actionUrl}>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="text-xs h-7"
                      >
                        {alert.actionLabel}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

