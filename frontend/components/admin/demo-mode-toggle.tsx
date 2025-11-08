'use client'

import { useState, useEffect } from 'react'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'

export function DemoModeToggle() {
  const [demoMode, setDemoMode] = useState(true)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchDemoMode()
  }, [])

  const fetchDemoMode = async () => {
    try {
      const response = await fetch('/api/admin/toggle-demo')
      const data = await response.json()

      if (response.ok) {
        setDemoMode(data.demo_mode)
      } else {
        setError(data.error || 'Failed to fetch demo mode status')
      }
    } catch (err) {
      console.error('Error fetching demo mode:', err)
      setError('Failed to load demo mode status')
    } finally {
      setLoading(false)
    }
  }

  const toggleDemoMode = async (enabled: boolean) => {
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      const response = await fetch('/api/admin/toggle-demo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      })

      const data = await response.json()

      if (response.ok) {
        setDemoMode(enabled)
        setSuccess(data.message)
        setTimeout(() => setSuccess(null), 3000)
      } else {
        setError(data.error || 'Failed to update demo mode')
        // Revert switch if failed
        setDemoMode(!enabled)
      }
    } catch (err) {
      console.error('Error toggling demo mode:', err)
      setError('Failed to update demo mode')
      // Revert switch if failed
      setDemoMode(!enabled)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <Card className="border-dark-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-dark-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-primary" />
          Demo Mode
        </CardTitle>
        <CardDescription>
          Control payment simulation for the entire system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <div className="flex items-center justify-between p-4 bg-dark-50 rounded-lg">
          <div className="flex-1">
            <h4 className="font-semibold text-white mb-1">
              {demoMode ? 'Demo Mode: Enabled' : 'Demo Mode: Disabled'}
            </h4>
            <p className="text-sm text-dark-800">
              {demoMode 
                ? 'All payments are simulated. No real transactions will be processed.'
                : 'Real payment processing is active. Transactions will be charged.'}
            </p>
          </div>
          <Switch
            checked={demoMode}
            onCheckedChange={toggleDemoMode}
            disabled={updating}
            className="ml-4"
          />
        </div>

        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <p className="text-xs text-blue-400">
            💡 <strong>Note:</strong> This affects all users in the system. 
            When enabled, checkout will simulate successful payment without processing real transactions.
            Only administrators can see and modify this setting.
          </p>
        </div>

        {demoMode && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-xs text-yellow-400">
              ⚠️ <strong>Warning:</strong> Demo mode is currently active. 
              Remember to disable it before going live with real payments.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

