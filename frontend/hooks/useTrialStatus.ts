'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TrialStatus {
  is_trial: boolean
  status: 'active' | 'expired'
  trial_start?: string
  trial_end?: string
  days_remaining?: number
  hours_remaining?: number
  payment_method_added?: boolean
  reminder_sent?: boolean
  message?: string
  plan?: string
}

export function useTrialStatus() {
  const [trialStatus, setTrialStatus] = useState<TrialStatus | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrialStatus()
  }, [])

  const fetchTrialStatus = async () => {
    try {
      // Get Supabase session token
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        console.error('No session token available')
        setLoading(false)
        return
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/trial/status`, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to fetch trial status')
      }

      const data = await response.json()
      setTrialStatus(data)
    } catch (error) {
      console.error('Error fetching trial status:', error)
    } finally {
      setLoading(false)
    }
  }

  return {
    trialStatus,
    loading,
    refetch: fetchTrialStatus,
  }
}

